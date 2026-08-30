import mongoose from 'mongoose';
import {
  IOfflineManifest,
  IOfflineProductManifestItem,
  IOfflineQueuedSale,
  IOfflineSyncResult,
} from './offline-pos.types.js';
import { Product, ProductBarcode } from '../catalog/product.model.js';
import { Location } from '../inventory/inventory.model.js';
import { Tenant } from '../tenancy/tenant.model.js';
import { Sale, ISale } from '../sales/sale.model.js';
import { saleService } from '../sales/sale.service.js';
import { auditService } from '../audit/audit.service.js';
import { BadRequestError } from '../common/errors.js';

export const offlinePosService = {
  // -------------------------------------------------------------
  // 1. GENERATE OFFLINE CATALOG MANIFEST
  // -------------------------------------------------------------
  async generateOfflineManifest(tenantId: string): Promise<IOfflineManifest> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    const [tenant, products, barcodes, locations] = await Promise.all([
      Tenant.findById(tenantObjectId).lean(),
      Product.find({ tenantId: tenantObjectId, isActive: true }).lean(),
      ProductBarcode.find({ tenantId: tenantObjectId }).lean(),
      Location.find({ tenantId: tenantObjectId, isActive: true }).lean(),
    ]);

    // Build fast barcode lookup map
    const barcodeMap: Record<string, { productId: string; name: string; sku: string; price: number }> = {};
    const barcodesByProduct = new Map<string, string[]>();

    for (const b of barcodes) {
      const prodIdStr = b.productId.toString();
      if (!barcodesByProduct.has(prodIdStr)) {
        barcodesByProduct.set(prodIdStr, []);
      }
      barcodesByProduct.get(prodIdStr)!.push(b.barcode);
    }

    const manifestProducts: IOfflineProductManifestItem[] = products.map((p) => {
      const prodIdStr = p._id.toString();
      const pBarcodes = barcodesByProduct.get(prodIdStr) || [];

      // Populate direct barcode map
      for (const bc of pBarcodes) {
        barcodeMap[bc] = {
          productId: prodIdStr,
          name: p.name,
          sku: p.sku,
          price: p.sellingPrice,
        };
      }

      return {
        id: prodIdStr,
        name: p.name,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        categoryName: p.categoryName,
        taxRatePercent: 0,
        barcodes: pBarcodes,
        unit: p.unit,
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      tenantId,
      currency: tenant?.currency || 'USD',
      products: manifestProducts,
      barcodeMap,
      locations: locations.map((l) => ({
        id: l._id.toString(),
        name: l.name,
        code: l.code,
        isDefault: l.isDefault || false,
      })),
    };
  },

  // -------------------------------------------------------------
  // 2. IDEMPOTENT OFFLINE TRANSACTIONS BATCH SYNC
  // -------------------------------------------------------------
  async syncOfflineBatch(
    tenantId: string,
    offlineSales: IOfflineQueuedSale[],
    userId: string
  ): Promise<IOfflineSyncResult> {
    if (!Array.isArray(offlineSales)) {
      throw new BadRequestError('offlineSales must be an array of transactions');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result: IOfflineSyncResult = {
      synced: [],
      duplicatesSkipped: [],
      failed: [],
      totalProcessed: offlineSales.length,
    };

    for (const item of offlineSales) {
      if (!item.offlineSaleId) {
        result.failed.push({
          offlineSaleId: 'UNKNOWN',
          error: 'Missing offlineSaleId idempotency key',
        });
        continue;
      }

      try {
        // IDEMPOTENCY CHECK: Has this offline transaction already been synchronized?
        const existingSale = await Sale.findOne({
          tenantId: tenantObjectId,
          clientReferenceId: item.offlineSaleId,
        });

        if (existingSale) {
          result.duplicatesSkipped.push({
            offlineSaleId: item.offlineSaleId,
            saleId: existingSale.id,
            saleNumber: existingSale.saleNumber,
            reason: 'Transaction already synced previously (Idempotent replay)',
          });
          continue;
        }

        // Process new offline transaction through core sale engine
        const createSaleDTO = {
          docType: 'INVOICE' as const,
          locationId: item.locationId,
          customerId: item.customerId,
          customerName: item.customerName || 'Walk-in Customer',
          clientReferenceId: item.offlineSaleId,
          items: item.items.map((line) => ({
            productId: line.productId,
            name: line.name,
            sku: line.sku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount || 0,
            taxRatePercent: line.taxRatePercent || 0,
          })),
          payments: item.payments.map((p) => ({
            paymentMethod: p.paymentMethod,
            amount: p.amount,
            reference: p.reference || `OFFLINE-${item.offlineSaleId.slice(0, 8)}`,
            tenderedAmount: p.tenderedAmount,
            changeAmount: p.changeAmount,
          })),
          notes: `${item.notes || ''} [Offline Sync: created ${item.offlineCreatedAt || 'offline'}]`.trim(),
        };

        const createdSale = await saleService.createSale(tenantId, createSaleDTO as any, userId);

        // Mark offline synced timestamp
        await Sale.updateOne(
          { _id: createdSale._id },
          {
            $set: {
              clientReferenceId: item.offlineSaleId,
              offlineSyncedAt: new Date(),
            },
          }
        );

        result.synced.push({
          offlineSaleId: item.offlineSaleId,
          saleId: createdSale.id,
          saleNumber: createdSale.saleNumber,
          grandTotal: createdSale.grandTotal,
        });
      } catch (err: any) {
        result.failed.push({
          offlineSaleId: item.offlineSaleId,
          error: err.message || 'Failed to process offline sale',
        });
      }
    }

    if (result.synced.length > 0) {
      await auditService.log({
        tenantId,
        userId,
        action: 'CREATE',
        entity: 'OfflinePOSSync',
        metadata: {
          syncedCount: result.synced.length,
          skippedCount: result.duplicatesSkipped.length,
          failedCount: result.failed.length,
        },
      });
    }

    return result;
  },
};
