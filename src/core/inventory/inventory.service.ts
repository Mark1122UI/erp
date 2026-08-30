import mongoose from 'mongoose';
import {
  Location,
  ILocation,
  LocationType,
  InventoryItem,
  IInventoryItem,
  InventoryTransaction,
  IInventoryTransaction,
  InventoryTransactionType,
  StockAdjustment,
  IStockAdjustment,
  AdjustmentReason,
  StockTransfer,
  IStockTransfer,
  TransferStatus,
} from './inventory.model.js';
import { StockCount, IStockCount } from './stock-count.model.js';
import { Product, ProductBarcode } from '../catalog/product.model.js';
import { NotFoundError, BadRequestError, ConflictError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface CreateLocationDTO {
  name: string;
  code: string;
  type?: LocationType;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isDefault?: boolean;
}

export interface StockMovementDTO {
  tenantId: string;
  locationId: string;
  productId: string;
  variantId?: string;
  transactionType: InventoryTransactionType;
  quantityDelta: number;
  costPerUnit?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  userId: string;
}

export interface CreateAdjustmentDTO {
  locationId: string;
  reason: AdjustmentReason;
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    newQuantity?: number;
    deltaQuantity?: number;
    unitCost?: number;
  }>;
}

export interface CreateTransferDTO {
  sourceLocationId: string;
  destinationLocationId: string;
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export interface StockLevelFilter {
  locationId?: string;
  search?: string;
  isLowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface StockLevelListResult {
  items: any[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const inventoryService = {
  // -------------------------------------------------------------
  // 1. LOCATION SERVICES
  // -------------------------------------------------------------
  async getOrCreateDefaultLocation(tenantId: string): Promise<ILocation> {
    const existing = await Location.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isDefault: true,
    });
    if (existing) return existing;

    const anyLoc = await Location.findOne({ tenantId: new mongoose.Types.ObjectId(tenantId) });
    if (anyLoc) return anyLoc;

    return await Location.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: 'Main Store',
      code: 'MAIN-01',
      type: 'STORE',
      isDefault: true,
      isActive: true,
    });
  },

  async createLocation(tenantId: string, data: CreateLocationDTO, userId: string): Promise<ILocation> {
    const normalizedCode = data.code.toUpperCase().trim();

    const existing = await Location.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      code: normalizedCode,
    });
    if (existing) {
      throw new ConflictError(`Location with code '${normalizedCode}' already exists`);
    }

    if (data.isDefault) {
      await Location.updateMany(
        { tenantId: new mongoose.Types.ObjectId(tenantId) },
        { $set: { isDefault: false } }
      );
    }

    const location = await Location.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: data.name.trim(),
      code: normalizedCode,
      type: data.type || 'STORE',
      address: data.address,
      isDefault: Boolean(data.isDefault),
      isActive: true,
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Location',
      entityId: location.id,
      metadata: { code: location.code, name: location.name },
    });

    return location;
  },

  async listLocations(tenantId: string): Promise<ILocation[]> {
    return await Location.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isActive: true,
    }).sort({ isDefault: -1, name: 1 });
  },

  // -------------------------------------------------------------
  // 2. TRANSACTION-BASED STOCK MUTATION CORE
  // -------------------------------------------------------------
  async recordStockMovement(data: StockMovementDTO): Promise<IInventoryTransaction> {
    const {
      tenantId,
      locationId,
      productId,
      variantId,
      transactionType,
      quantityDelta,
      costPerUnit = 0,
      referenceType,
      referenceId,
      notes,
      userId,
    } = data;

    if (!mongoose.Types.ObjectId.isValid(locationId) || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid location or product ID format');
    }

    if (quantityDelta === 0) {
      throw new BadRequestError('Quantity delta must not be zero');
    }

    const locObjectId = new mongoose.Types.ObjectId(locationId);
    const prodObjectId = new mongoose.Types.ObjectId(productId);
    const varObjectId = variantId && mongoose.Types.ObjectId.isValid(variantId) ? new mongoose.Types.ObjectId(variantId) : undefined;
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    // Verify Product exists and belongs to Tenant
    const product = await Product.findOne({ _id: prodObjectId, tenantId: tenantObjectId });
    if (!product) {
      throw new NotFoundError('Product not found in this business');
    }

    // Verify Location exists and belongs to Tenant
    const location = await Location.findOne({ _id: locObjectId, tenantId: tenantObjectId });
    if (!location) {
      throw new NotFoundError('Location not found in this business');
    }

    // Load or create InventoryItem stock record
    let stockItem = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      productId: prodObjectId,
      variantId: varObjectId,
    });

    const currentQty = stockItem ? stockItem.quantityOnHand : 0;
    const newQty = currentQty + quantityDelta;

    // Rule: Negative Stock Prevention
    if (newQty < 0) {
      throw new BadRequestError(
        `Insufficient stock for '${product.name}' (SKU: ${product.sku}) at ${location.name}. Available: ${currentQty}, Requested reduction: ${Math.abs(quantityDelta)}`
      );
    }

    // Upsert InventoryItem
    if (!stockItem) {
      stockItem = new InventoryItem({
        tenantId: tenantObjectId,
        locationId: locObjectId,
        productId: prodObjectId,
        variantId: varObjectId,
        quantityOnHand: newQty,
        quantityReserved: 0,
        reorderPoint: product.reorderPoint || 5,
        lastCostPrice: costPerUnit > 0 ? costPerUnit : product.costPrice,
        averageCostPrice: costPerUnit > 0 ? costPerUnit : product.costPrice,
      });
    } else {
      stockItem.quantityOnHand = newQty;
      if (costPerUnit > 0) {
        stockItem.lastCostPrice = costPerUnit;
      }
    }

    await stockItem.save();

    // Create Immutable Transaction Ledger Entry
    const transaction = await InventoryTransaction.create({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      productId: prodObjectId,
      variantId: varObjectId,
      transactionType,
      quantityDelta,
      balanceAfter: newQty,
      costPerUnit: costPerUnit > 0 ? costPerUnit : product.costPrice,
      referenceType,
      referenceId,
      notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return transaction;
  },

  // -------------------------------------------------------------
  // 3. STOCK ADJUSTMENT WORKFLOW
  // -------------------------------------------------------------
  async createStockAdjustment(tenantId: string, data: CreateAdjustmentDTO, userId: string): Promise<IStockAdjustment> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Adjustment must contain at least one item');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const locObjectId = new mongoose.Types.ObjectId(data.locationId);

    const location = await Location.findOne({ _id: locObjectId, tenantId: tenantObjectId });
    if (!location) throw new NotFoundError('Location not found');

    const count = await StockAdjustment.countDocuments({ tenantId: tenantObjectId });
    const adjustmentNumber = `ADJ-${String(count + 1).padStart(5, '0')}`;

    const processedItems = [];

    for (const item of data.items) {
      const prodObjectId = new mongoose.Types.ObjectId(item.productId);
      const varObjectId = item.variantId ? new mongoose.Types.ObjectId(item.variantId) : undefined;

      const product = await Product.findOne({ _id: prodObjectId, tenantId: tenantObjectId });
      if (!product) throw new NotFoundError(`Product not found: ${item.productId}`);

      const currentStock = await InventoryItem.findOne({
        tenantId: tenantObjectId,
        locationId: locObjectId,
        productId: prodObjectId,
        variantId: varObjectId,
      });

      const previousQty = currentStock ? currentStock.quantityOnHand : 0;
      let newQty = previousQty;
      let delta = 0;

      if (item.newQuantity !== undefined) {
        newQty = Number(item.newQuantity);
        delta = newQty - previousQty;
      } else if (item.deltaQuantity !== undefined) {
        delta = Number(item.deltaQuantity);
        newQty = previousQty + delta;
      } else {
        throw new BadRequestError('Either newQuantity or deltaQuantity must be provided for each item');
      }

      if (newQty < 0) {
        throw new BadRequestError(`Adjustment would result in negative stock (${newQty}) for ${product.name}`);
      }

      if (delta !== 0) {
        await this.recordStockMovement({
          tenantId,
          locationId: data.locationId,
          productId: item.productId,
          variantId: item.variantId,
          transactionType: data.reason === 'DAMAGED_EXPIRED' ? 'DAMAGE' : 'ADJUSTMENT',
          quantityDelta: delta,
          costPerUnit: item.unitCost || product.costPrice,
          referenceType: 'ADJUSTMENT',
          referenceId: adjustmentNumber,
          notes: data.notes || `Reason: ${data.reason}`,
          userId,
        });
      }

      processedItems.push({
        productId: prodObjectId,
        variantId: varObjectId,
        previousQty,
        newQty,
        deltaQty: delta,
        unitCost: item.unitCost || product.costPrice,
      });
    }

    const adjustment = await StockAdjustment.create({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      adjustmentNumber,
      reason: data.reason,
      items: processedItems,
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'StockAdjustment',
      entityId: adjustment.id,
      metadata: { adjustmentNumber, reason: data.reason, itemsCount: processedItems.length },
    });

    return adjustment;
  },

  // -------------------------------------------------------------
  // 4. STOCK TRANSFER WORKFLOW (DRAFT -> DISPATCH -> RECEIVE)
  // -------------------------------------------------------------
  async createStockTransfer(tenantId: string, data: CreateTransferDTO, userId: string): Promise<IStockTransfer> {
    if (data.sourceLocationId === data.destinationLocationId) {
      throw new BadRequestError('Source and destination locations cannot be the same');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const srcObjectId = new mongoose.Types.ObjectId(data.sourceLocationId);
    const destObjectId = new mongoose.Types.ObjectId(data.destinationLocationId);

    const [srcLoc, destLoc] = await Promise.all([
      Location.findOne({ _id: srcObjectId, tenantId: tenantObjectId }),
      Location.findOne({ _id: destObjectId, tenantId: tenantObjectId }),
    ]);

    if (!srcLoc || !destLoc) {
      throw new NotFoundError('Source or Destination location not found');
    }

    const count = await StockTransfer.countDocuments({ tenantId: tenantObjectId });
    const transferNumber = `TRF-${String(count + 1).padStart(5, '0')}`;

    const transfer = await StockTransfer.create({
      tenantId: tenantObjectId,
      transferNumber,
      sourceLocationId: srcObjectId,
      destinationLocationId: destObjectId,
      items: data.items.map((it) => ({
        productId: new mongoose.Types.ObjectId(it.productId),
        variantId: it.variantId ? new mongoose.Types.ObjectId(it.variantId) : undefined,
        quantity: Number(it.quantity),
      })),
      status: 'CONFIRMED',
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'StockTransfer',
      entityId: transfer.id,
      metadata: { transferNumber, source: srcLoc.name, destination: destLoc.name },
    });

    return transfer;
  },

  async dispatchTransfer(tenantId: string, transferId: string, userId: string): Promise<IStockTransfer> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const transfer = await StockTransfer.findOne({
      _id: new mongoose.Types.ObjectId(transferId),
      tenantId: tenantObjectId,
    });

    if (!transfer) throw new NotFoundError('Stock transfer not found');
    if (transfer.status === 'TRANSFERRED_OUT' || transfer.status === 'COMPLETED') {
      throw new BadRequestError(`Transfer is already dispatched or completed`);
    }

    // Deduct stock from Source Location
    for (const item of transfer.items) {
      await this.recordStockMovement({
        tenantId,
        locationId: transfer.sourceLocationId.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId?.toString(),
        transactionType: 'TRANSFER_OUT',
        quantityDelta: -item.quantity,
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        notes: `Transfer dispatched to destination`,
        userId,
      });
    }

    transfer.status = 'TRANSFERRED_OUT';
    transfer.transferredOutAt = new Date();
    await transfer.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'StockTransfer',
      entityId: transfer.id,
      metadata: { status: 'TRANSFERRED_OUT', transferNumber: transfer.transferNumber },
    });

    return transfer;
  },

  async receiveTransfer(tenantId: string, transferId: string, userId: string): Promise<IStockTransfer> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const transfer = await StockTransfer.findOne({
      _id: new mongoose.Types.ObjectId(transferId),
      tenantId: tenantObjectId,
    });

    if (!transfer) throw new NotFoundError('Stock transfer not found');
    if (transfer.status !== 'TRANSFERRED_OUT') {
      throw new BadRequestError(`Transfer must be dispatched (TRANSFERRED_OUT) before it can be received`);
    }

    // Add stock into Destination Location
    for (const item of transfer.items) {
      await this.recordStockMovement({
        tenantId,
        locationId: transfer.destinationLocationId.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId?.toString(),
        transactionType: 'TRANSFER_IN',
        quantityDelta: item.quantity,
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        notes: `Transfer received from source`,
        userId,
      });
    }

    transfer.status = 'COMPLETED';
    transfer.transferredInAt = new Date();
    await transfer.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'StockTransfer',
      entityId: transfer.id,
      metadata: { status: 'COMPLETED', transferNumber: transfer.transferNumber },
    });

    return transfer;
  },

  // -------------------------------------------------------------
  // 5. INVENTORY QUERIES & LEDGER
  // -------------------------------------------------------------
  async getStockLevels(tenantId: string, filter: StockLevelFilter): Promise<StockLevelListResult> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 25));
    const skip = (page - 1) * limit;

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    let locationFilterId: mongoose.Types.ObjectId | undefined;
    if (filter.locationId && mongoose.Types.ObjectId.isValid(filter.locationId)) {
      locationFilterId = new mongoose.Types.ObjectId(filter.locationId);
    } else {
      const defaultLoc = await this.getOrCreateDefaultLocation(tenantId);
      locationFilterId = defaultLoc._id as mongoose.Types.ObjectId;
    }

    const prodQuery: any = {
      tenantId: tenantObjectId,
      isArchived: false,
    };

    if (filter.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      prodQuery.$or = [{ name: searchRegex }, { sku: searchRegex }, { brand: searchRegex }];
    }

    const [products, totalRecords] = await Promise.all([
      Product.find(prodQuery).skip(skip).limit(limit).lean(),
      Product.countDocuments(prodQuery),
    ]);

    const productIds = products.map((p) => p._id);

    const stockItems = await InventoryItem.find({
      tenantId: tenantObjectId,
      locationId: locationFilterId,
      productId: { $in: productIds },
    }).lean();

    const items = products.map((p) => {
      const stock = stockItems.find((s) => s.productId.toString() === p._id.toString());
      const onHand = stock ? stock.quantityOnHand : 0;
      const reorder = stock?.reorderPoint || p.reorderPoint || 5;
      const isLow = onHand <= reorder;
      const stockValuation = onHand * (p.costPrice || 0);

      return {
        productId: p._id,
        name: p.name,
        sku: p.sku,
        unit: p.unit || 'PCS',
        categoryName: p.categoryName,
        brand: p.brand,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        quantityOnHand: onHand,
        quantityReserved: stock ? stock.quantityReserved : 0,
        reorderPoint: reorder,
        isLowStock: isLow,
        stockValuation,
      };
    });

    const filteredItems = filter.isLowStock ? items.filter((it) => it.isLowStock) : items;
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      items: filteredItems,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  async getTransactionHistory(
    tenantId: string,
    filter: { locationId?: string; productId?: string; limit?: number }
  ): Promise<IInventoryTransaction[]> {
    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (filter.locationId && mongoose.Types.ObjectId.isValid(filter.locationId)) {
      query.locationId = new mongoose.Types.ObjectId(filter.locationId);
    }
    if (filter.productId && mongoose.Types.ObjectId.isValid(filter.productId)) {
      query.productId = new mongoose.Types.ObjectId(filter.productId);
    }

    const limit = Math.min(100, Number(filter.limit) || 50);

    return await InventoryTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('productId', 'name sku unit')
      .populate('locationId', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .lean() as any;
  },

  // -------------------------------------------------------------
  // BARCODE-DRIVEN STOCK COUNT (PHYSICAL INVENTORY AUDIT)
  // -------------------------------------------------------------
  async startStockCount(
    tenantId: string,
    data: { locationId: string; notes?: string },
    userId: string
  ): Promise<IStockCount> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    if (!mongoose.Types.ObjectId.isValid(data.locationId)) {
      throw new BadRequestError('Invalid location ID');
    }
    const locObjectId = new mongoose.Types.ObjectId(data.locationId);

    const location = await Location.findOne({ _id: locObjectId, tenantId: tenantObjectId });
    if (!location) throw new NotFoundError('Location not found');

    // Snapshot existing products and stock quantities
    const [products, stockItems] = await Promise.all([
      Product.find({ tenantId: tenantObjectId, isActive: true, isArchived: false }).lean(),
      InventoryItem.find({ tenantId: tenantObjectId, locationId: locObjectId }).lean(),
    ]);

    const stockMap: Record<string, number> = {};
    for (const it of stockItems) {
      stockMap[it.productId.toString()] = it.quantityOnHand;
    }

    const initialItems = products.map((p) => {
      const systemQty = stockMap[p._id.toString()] ?? 0;
      return {
        productId: p._id,
        name: p.name,
        sku: p.sku,
        systemQuantity: systemQty,
        countedQuantity: 0,
        difference: 0 - systemQty, // Initially difference is -systemQuantity until counted
        unitCost: p.costPrice || 0,
      };
    });

    const count = await StockCount.countDocuments({ tenantId: tenantObjectId });
    const countNumber = `CNT-${String(count + 1).padStart(5, '0')}`;

    const stockCount = await StockCount.create({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      countNumber,
      status: 'IN_PROGRESS',
      items: initialItems,
      totalDiscrepancyValue: 0,
      notes: data.notes,
      startedAt: new Date(),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'StockCount',
      entityId: stockCount.id,
      metadata: { countNumber, location: location.name, totalItems: initialItems.length },
    });

    return stockCount;
  },

  async recordScannedCountItem(
    tenantId: string,
    data: { stockCountId: string; barcodeOrSku: string; quantity?: number },
    userId: string
  ): Promise<IStockCount> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    if (!mongoose.Types.ObjectId.isValid(data.stockCountId)) {
      throw new BadRequestError('Invalid stock count ID');
    }

    const stockCount = await StockCount.findOne({
      _id: new mongoose.Types.ObjectId(data.stockCountId),
      tenantId: tenantObjectId,
    });
    if (!stockCount) throw new NotFoundError('Stock count session not found');
    if (stockCount.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Cannot add items to a stock count in '${stockCount.status}' status`);
    }

    const cleanInput = data.barcodeOrSku.trim();
    const qtyToAdd = Math.max(0.001, Number(data.quantity) || 1);

    // 1. Resolve Product by Barcode, SKU, or ID
    let product = null;

    // Check ProductBarcode collection
    const matchedBarcode = await ProductBarcode.findOne({
      tenantId: tenantObjectId,
      barcode: cleanInput,
    });
    if (matchedBarcode) {
      product = await Product.findOne({ _id: matchedBarcode.productId, tenantId: tenantObjectId });
    }

    // Fallback: check SKU, direct ID, or name
    if (!product) {
      const isOid = mongoose.Types.ObjectId.isValid(cleanInput);
      product = await Product.findOne({
        tenantId: tenantObjectId,
        $or: [
          ...(isOid ? [{ _id: new mongoose.Types.ObjectId(cleanInput) }] : []),
          { sku: cleanInput },
          { name: new RegExp(`^${cleanInput}$`, 'i') },
        ],
      });
    }

    if (!product) {
      throw new NotFoundError(`No product found matching barcode/SKU: '${cleanInput}'`);
    }

    const prodIdStr = product._id.toString();

    // 2. CRUCIAL RULE: Find existing item line and increment count rather than duplicating lines
    const existingItem = stockCount.items.find((it) => it.productId.toString() === prodIdStr);

    if (existingItem) {
      existingItem.countedQuantity = Number((existingItem.countedQuantity + qtyToAdd).toFixed(3));
      existingItem.difference = Number((existingItem.countedQuantity - existingItem.systemQuantity).toFixed(3));
    } else {
      // Un-snapshotted item
      stockCount.items.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        systemQuantity: 0,
        countedQuantity: qtyToAdd,
        difference: qtyToAdd,
        unitCost: product.costPrice || 0,
      } as any);
    }

    // Recalculate total discrepancy value
    let totalDiscrepancy = 0;
    for (const it of stockCount.items) {
      totalDiscrepancy += it.difference * it.unitCost;
    }
    stockCount.totalDiscrepancyValue = Number(totalDiscrepancy.toFixed(2));

    await stockCount.save();
    return stockCount;
  },

  async completeStockCount(
    tenantId: string,
    stockCountId: string,
    userId: string
  ): Promise<IStockCount> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    if (!mongoose.Types.ObjectId.isValid(stockCountId)) {
      throw new BadRequestError('Invalid stock count ID');
    }

    const stockCount = await StockCount.findOne({
      _id: new mongoose.Types.ObjectId(stockCountId),
      tenantId: tenantObjectId,
    });
    if (!stockCount) throw new NotFoundError('Stock count session not found');
    if (stockCount.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Stock count already ${stockCount.status}`);
    }

    // Reconcile differences via authorized inventory adjustments
    const itemsWithDifferences = stockCount.items.filter((it) => it.difference !== 0);

    if (itemsWithDifferences.length > 0) {
      await this.createStockAdjustment(
        tenantId,
        {
          locationId: stockCount.locationId.toString(),
          reason: 'PHYSICAL_COUNT',
          notes: `Automatic reconciliation for Physical Stock Count ${stockCount.countNumber}`,
          items: itemsWithDifferences.map((it) => ({
            productId: it.productId.toString(),
            deltaQuantity: it.difference,
            unitCost: it.unitCost,
          })),
        },
        userId
      );
    }

    stockCount.status = 'COMPLETED';
    stockCount.completedAt = new Date();
    await stockCount.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'StockCount',
      entityId: stockCount.id,
      metadata: {
        countNumber: stockCount.countNumber,
        status: 'COMPLETED',
        reconciledItemsCount: itemsWithDifferences.length,
        totalDiscrepancyValue: stockCount.totalDiscrepancyValue,
      },
    });

    return stockCount;
  },

  async listStockCounts(tenantId: string, locationId?: string) {
    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
      query.locationId = new mongoose.Types.ObjectId(locationId);
    }

    return await StockCount.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('locationId', 'name code')
      .populate('createdBy', 'firstName lastName')
      .lean();
  },

  async getStockCountById(tenantId: string, stockCountId: string): Promise<IStockCount> {
    if (!mongoose.Types.ObjectId.isValid(stockCountId)) {
      throw new BadRequestError('Invalid stock count ID');
    }
    const count = await StockCount.findOne({
      _id: new mongoose.Types.ObjectId(stockCountId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .populate('locationId', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!count) throw new NotFoundError('Stock count not found');
    return count as any;
  },
};
