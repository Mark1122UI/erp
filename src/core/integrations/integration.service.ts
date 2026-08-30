import mongoose from 'mongoose';
import {
  IntegrationProviderType,
  IProviderCatalogItem,
  SyncType,
  ISyncResult,
} from './integration.types.js';
import {
  IntegrationConnection,
  IntegrationCredential,
  IntegrationMapping,
  IntegrationSync,
  IntegrationLog,
  IIntegrationConnection,
} from './integration.model.js';
import { IIntegrationProviderAdapter } from './adapters/provider.adapter.js';
import { ShopifyAdapter } from './adapters/shopify.adapter.js';
import { WooCommerceAdapter } from './adapters/woocommerce.adapter.js';
import { CustomApiAdapter } from './adapters/custom-api.adapter.js';
import { Product } from '../catalog/product.model.js';
import { Party } from '../parties/party.model.js';
import { Sale } from '../sales/sale.model.js';
import { InventoryItem, Location } from '../inventory/inventory.model.js';
import { auditService } from '../audit/audit.service.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';

export class IntegrationService {
  private adapters = new Map<IntegrationProviderType, IIntegrationProviderAdapter>();

  constructor() {
    this.registerAdapter(new ShopifyAdapter());
    this.registerAdapter(new WooCommerceAdapter());
    this.registerAdapter(new CustomApiAdapter());
  }

  registerAdapter(adapter: IIntegrationProviderAdapter) {
    this.adapters.set(adapter.provider, adapter);
  }

  getAdapter(provider: IntegrationProviderType): IIntegrationProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new BadRequestError(`No adapter registered for provider: '${provider}'`);
    return adapter;
  }

  // -------------------------------------------------------------
  // 1. PROVIDER CATALOG
  // -------------------------------------------------------------
  getProviderCatalog(): IProviderCatalogItem[] {
    return [
      {
        id: 'SHOPIFY',
        name: 'Shopify',
        description: 'Sync products, inventory, orders, and customer details with your Shopify store.',
        category: 'ECOMMERCE',
        authType: 'OAUTH2',
        capabilities: ['PRODUCTS', 'INVENTORY', 'ORDERS', 'CUSTOMERS', 'WEBHOOKS'],
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/shopify.svg',
        docsUrl: 'https://shopify.dev/docs/apps',
      },
      {
        id: 'WOOCOMMERCE',
        name: 'WooCommerce',
        description: 'Connect your WordPress WooCommerce store for bi-directional inventory and sales sync.',
        category: 'ECOMMERCE',
        authType: 'OAUTH2',
        capabilities: ['PRODUCTS', 'INVENTORY', 'ORDERS', 'CUSTOMERS'],
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/woocommerce.svg',
        docsUrl: 'https://woocommerce.com/document/woocommerce-rest-api/',
      },
      {
        id: 'CUSTOM_API',
        name: 'Custom Webhook / REST Store',
        description: 'Connect bespoke e-commerce platforms and custom websites via secure API webhooks.',
        category: 'CUSTOM',
        authType: 'API_KEY',
        capabilities: ['PRODUCTS', 'INVENTORY', 'ORDERS', 'WEBHOOKS'],
      },
    ];
  }

  // -------------------------------------------------------------
  // 2. OAUTH & STORE CONNECTION MANAGEMENT
  // -------------------------------------------------------------
  async getOAuthUrl(
    tenantId: string,
    provider: IntegrationProviderType,
    redirectUri: string,
    storeName?: string
  ): Promise<{ authUrl: string }> {
    const adapter = this.getAdapter(provider);
    const authUrl = await adapter.getAuthUrl(tenantId, redirectUri, undefined, storeName);
    return { authUrl };
  }

  async connectStore(
    tenantId: string,
    data: {
      provider: IntegrationProviderType;
      name: string;
      storeUrl?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      settings?: any;
    },
    userId: string
  ): Promise<IIntegrationConnection> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const connection = await IntegrationConnection.create({
      tenantId: tenantObjectId,
      provider: data.provider,
      name: data.name.trim(),
      storeUrl: data.storeUrl?.trim(),
      status: 'ACTIVE',
      settings: data.settings || {},
      createdBy: userObjectId,
    });

    // Store credentials securely in separate isolated collection
    await IntegrationCredential.create({
      tenantId: tenantObjectId,
      connectionId: connection._id,
      accessToken: data.accessToken,
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
    });

    await this.logEvent(tenantId, connection.id, 'INFO', 'STORE_CONNECTED', `Connected store "${connection.name}" (${data.provider})`);

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'IntegrationConnection',
      entityId: connection.id,
      metadata: { provider: data.provider, name: data.name },
    });

    return connection;
  }

  async handleOAuthCallback(
    tenantId: string,
    provider: IntegrationProviderType,
    params: { code: string; state?: string; shop?: string; redirectUri?: string },
    userId: string
  ): Promise<IIntegrationConnection> {
    const adapter = this.getAdapter(provider);
    const result = await adapter.handleOAuthCallback(params);

    const connection = await this.connectStore(
      tenantId,
      {
        provider,
        name: result.name || `${provider} Store`,
        storeUrl: result.storeUrl,
        accessToken: result.credentials.accessToken,
        apiKey: result.credentials.apiKey,
        apiSecret: result.credentials.apiSecret,
      },
      userId
    );

    return connection;
  }

  async listConnections(tenantId: string): Promise<IIntegrationConnection[]> {
    return (await IntegrationConnection.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .sort({ createdAt: -1 })
      .lean()) as any;
  }

  async getConnection(tenantId: string, connectionId: string): Promise<IIntegrationConnection> {
    if (!mongoose.Types.ObjectId.isValid(connectionId)) throw new BadRequestError('Invalid connection ID');

    const connection = await IntegrationConnection.findOne({
      _id: new mongoose.Types.ObjectId(connectionId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).lean();

    if (!connection) throw new NotFoundError('Integration connection not found');
    return connection as any;
  }

  async disconnectStore(tenantId: string, connectionId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(connectionId)) throw new BadRequestError('Invalid connection ID');
    const connObjId = new mongoose.Types.ObjectId(connectionId);
    const tenantObjId = new mongoose.Types.ObjectId(tenantId);

    const res = await IntegrationConnection.deleteOne({ _id: connObjId, tenantId: tenantObjId });
    if (res.deletedCount === 0) throw new NotFoundError('Connection not found');

    // Purge credentials and mappings
    await Promise.all([
      IntegrationCredential.deleteOne({ connectionId: connObjId, tenantId: tenantObjId }),
      IntegrationMapping.deleteMany({ connectionId: connObjId, tenantId: tenantObjId }),
    ]);

    await auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'IntegrationConnection',
      entityId: connectionId,
    });
  }

  // -------------------------------------------------------------
  // 3. SYNCHRONIZATION ENGINE
  // -------------------------------------------------------------
  async triggerSync(
    tenantId: string,
    connectionId: string,
    syncType: SyncType,
    userId: string
  ): Promise<ISyncResult> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const connObjectId = new mongoose.Types.ObjectId(connectionId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const connection = await IntegrationConnection.findOne({
      _id: connObjectId,
      tenantId: tenantObjectId,
    });
    if (!connection) throw new NotFoundError('Integration connection not found');

    const credentials = await IntegrationCredential.findOne({
      connectionId: connObjectId,
      tenantId: tenantObjectId,
    }).select('+accessToken +refreshToken +apiKey +apiSecret +webhookSecret');

    const adapter = this.getAdapter(connection.provider);

    // Create Sync execution record
    const syncJob = await IntegrationSync.create({
      tenantId: tenantObjectId,
      connectionId: connObjectId,
      syncType,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      triggeredBy: userObjectId,
    });

    await this.logEvent(tenantId, connection.id, 'INFO', 'SYNC_STARTED', `Started ${syncType} sync for ${connection.name}`, undefined, syncJob.id);

    const errors: string[] = [];
    let itemsProcessed = 0;
    let itemsSucceeded = 0;
    let itemsFailed = 0;

    try {
      // 1. SYNC PRODUCTS
      if (syncType === 'PRODUCTS' || syncType === 'FULL') {
        const extProducts = await adapter.fetchProducts(connection, credentials || ({} as any));
        for (const ep of extProducts) {
          itemsProcessed++;
          try {
            // Find or create ERP Product
            let product = await Product.findOne({
              tenantId: tenantObjectId,
              sku: ep.sku,
            });

            if (!product) {
              product = await Product.create({
                tenantId: tenantObjectId,
                name: ep.title,
                sku: ep.sku,
                sellingPrice: ep.price,
                costPrice: Number((ep.price * 0.6).toFixed(2)),
                barcodes: ep.barcode ? [{ barcode: ep.barcode, symbology: 'EAN13' }] : [],
                isActive: true,
              });
            }

            // Upsert Integration Mapping
            await IntegrationMapping.findOneAndUpdate(
              {
                tenantId: tenantObjectId,
                connectionId: connObjectId,
                entityType: 'PRODUCT',
                externalId: ep.externalId,
              },
              {
                erpId: product._id,
                externalSku: ep.sku,
                lastSyncedAt: new Date(),
              },
              { upsert: true, new: true }
            );

            itemsSucceeded++;
          } catch (err: any) {
            itemsFailed++;
            errors.push(`Failed product "${ep.title}": ${err.message}`);
          }
        }
      }

      // 2. SYNC CUSTOMERS
      if (syncType === 'CUSTOMERS' || syncType === 'FULL') {
        const extCustomers = await adapter.fetchCustomers(connection, credentials || ({} as any));
        for (const ec of extCustomers) {
          itemsProcessed++;
          try {
            let customer = await Party.findOne({
              tenantId: tenantObjectId,
              email: ec.email,
            });

            if (!customer) {
              customer = await Party.create({
                tenantId: tenantObjectId,
                type: 'INDIVIDUAL',
                roles: ['CUSTOMER'],
                firstName: ec.firstName,
                lastName: ec.lastName,
                displayName: `${ec.firstName} ${ec.lastName}`.trim(),
                email: ec.email,
                phone: ec.phone,
                billingAddress: ec.address,
              });
            }

            await IntegrationMapping.findOneAndUpdate(
              {
                tenantId: tenantObjectId,
                connectionId: connObjectId,
                entityType: 'CUSTOMER',
                externalId: ec.externalId,
              },
              {
                erpId: customer._id,
                lastSyncedAt: new Date(),
              },
              { upsert: true, new: true }
            );

            itemsSucceeded++;
          } catch (err: any) {
            itemsFailed++;
            errors.push(`Failed customer "${ec.email}": ${err.message}`);
          }
        }
      }

      // 3. SYNC ORDERS
      if (syncType === 'ORDERS' || syncType === 'FULL') {
        const extOrders = await adapter.fetchOrders(connection, credentials || ({} as any));
        
        // Find default location
        let defaultLocation = await Location.findOne({ tenantId: tenantObjectId, isDefault: true });
        if (!defaultLocation) {
          defaultLocation = await Location.findOne({ tenantId: tenantObjectId });
        }

        for (const eo of extOrders) {
          itemsProcessed++;
          try {
            // Check if already mapped
            const existingMapping = await IntegrationMapping.findOne({
              tenantId: tenantObjectId,
              connectionId: connObjectId,
              entityType: 'ORDER',
              externalId: eo.externalId,
            });

            if (!existingMapping && defaultLocation) {
              const saleItems: any[] = [];
              for (const item of eo.items) {
                const prod = await Product.findOne({ tenantId: tenantObjectId, sku: item.sku });
                if (prod) {
                  saleItems.push({
                    productId: prod._id,
                    name: prod.name,
                    sku: prod.sku,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    lineTotal: item.quantity * item.price,
                  });
                }
              }

              if (saleItems.length > 0) {
                const sale = await Sale.create({
                  tenantId: tenantObjectId,
                  locationId: defaultLocation._id,
                  customerName: eo.customerName,
                  saleNumber: `ORD-${eo.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
                  docType: 'ORDER',
                  status: eo.financialStatus === 'PAID' ? 'PAID' : 'CONFIRMED',
                  subtotal: eo.totalAmount,
                  grandTotal: eo.totalAmount,
                  paidAmount: eo.financialStatus === 'PAID' ? eo.totalAmount : 0,
                  dueAmount: eo.financialStatus === 'PAID' ? 0 : eo.totalAmount,
                  items: saleItems,
                  payments: eo.financialStatus === 'PAID' ? [{
                    paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
                    amount: eo.totalAmount,
                    paymentMethod: 'CARD',
                    provider: connection.provider,
                    status: 'COMPLETED',
                    createdAt: new Date(),
                  }] : [],
                  notes: `Imported from ${connection.name} (External Order: ${eo.orderNumber})`,
                  createdBy: userObjectId,
                });

                await IntegrationMapping.create({
                  tenantId: tenantObjectId,
                  connectionId: connObjectId,
                  entityType: 'ORDER',
                  erpId: sale._id,
                  externalId: eo.externalId,
                  metadata: { orderNumber: eo.orderNumber },
                  lastSyncedAt: new Date(),
                });
              }
            }

            itemsSucceeded++;
          } catch (err: any) {
            itemsFailed++;
            errors.push(`Failed order "${eo.orderNumber}": ${err.message}`);
          }
        }
      }

      // 4. SYNC INVENTORY (OUTBOUND PUSH)
      if (syncType === 'INVENTORY' || syncType === 'FULL') {
        const mappings = await IntegrationMapping.find({
          tenantId: tenantObjectId,
          connectionId: connObjectId,
          entityType: 'PRODUCT',
        });

        const inventoryPayload: { externalId: string; sku: string; quantity: number }[] = [];

        for (const map of mappings) {
          const stock = await InventoryItem.findOne({
            tenantId: tenantObjectId,
            productId: map.erpId,
          });

          inventoryPayload.push({
            externalId: map.externalId,
            sku: map.externalSku || '',
            quantity: stock?.quantityOnHand || 0,
          });
        }

        if (inventoryPayload.length > 0) {
          const pushResult = await adapter.pushInventory(connection, credentials || ({} as any), inventoryPayload);
          itemsProcessed += inventoryPayload.length;
          itemsSucceeded += pushResult.successCount;
          itemsFailed += pushResult.failureCount;
        }
      }

      const finalStatus = itemsFailed > 0 ? (itemsSucceeded > 0 ? 'PARTIAL' : 'FAILED') : 'COMPLETED';

      syncJob.status = finalStatus;
      syncJob.itemsProcessed = itemsProcessed;
      syncJob.itemsSucceeded = itemsSucceeded;
      syncJob.itemsFailed = itemsFailed;
      syncJob.errorMessages = errors;
      syncJob.completedAt = new Date();
      await syncJob.save();

      connection.lastSyncAt = new Date();
      await connection.save();

      await this.logEvent(
        tenantId,
        connection.id,
        itemsFailed > 0 ? 'WARN' : 'INFO',
        'SYNC_COMPLETED',
        `Completed ${syncType} sync: ${itemsSucceeded} succeeded, ${itemsFailed} failed`,
        { errors },
        syncJob.id
      );

      return {
        syncId: syncJob.id,
        status: finalStatus,
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        errors,
      };
    } catch (error: any) {
      syncJob.status = 'FAILED';
      syncJob.errorMessages.push(error.message);
      syncJob.completedAt = new Date();
      await syncJob.save();

      await this.logEvent(tenantId, connection.id, 'ERROR', 'SYNC_FAILED', `Sync failed with error: ${error.message}`, { error: error.stack }, syncJob.id);

      return {
        syncId: syncJob.id,
        status: 'FAILED',
        itemsProcessed,
        itemsSucceeded,
        itemsFailed: itemsFailed + 1,
        errors: [error.message],
      };
    }
  }

  // -------------------------------------------------------------
  // 4. INTEGRATION LOGS & AUDIT
  // -------------------------------------------------------------
  async logEvent(
    tenantId: string,
    connectionId: string,
    level: 'INFO' | 'WARN' | 'ERROR',
    event: string,
    message: string,
    payload?: any,
    syncId?: string
  ): Promise<void> {
    await IntegrationLog.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      connectionId: new mongoose.Types.ObjectId(connectionId),
      syncId: syncId ? new mongoose.Types.ObjectId(syncId) : undefined,
      level,
      event,
      message,
      payload,
    });
  }

  async getLogs(tenantId: string, connectionId?: string, limit = 50): Promise<any[]> {
    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    if (connectionId && mongoose.Types.ObjectId.isValid(connectionId)) {
      query.connectionId = new mongoose.Types.ObjectId(connectionId);
    }

    return await IntegrationLog.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

export const integrationService = new IntegrationService();
