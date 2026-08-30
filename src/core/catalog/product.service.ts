import mongoose from 'mongoose';
import {
  Product,
  IProduct,
  ProductBarcode,
  IProductBarcode,
  IProductVariant,
  BarcodeSymbology,
  Category,
  Unit,
} from './product.model.js';
import { ConflictError, NotFoundError, BadRequestError, InvalidIdError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface CreateBarcodeDTO {
  barcode: string;
  symbology?: BarcodeSymbology;
  isPrimary?: boolean;
  description?: string;
  variantId?: string;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  brand?: string;
  costPrice?: number;
  sellingPrice: number;
  isTaxable?: boolean;
  taxRatePercent?: number;
  unit?: string;
  reorderPoint?: number;
  trackInventory?: boolean;
  primarySupplierId?: string;
  supplierProductCode?: string;
  barcodes?: CreateBarcodeDTO[];
  hasVariants?: boolean;
  variants?: IProductVariant[];
  tags?: string[];
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  isActive?: boolean;
}

export interface ListProductsFilter {
  search?: string;
  categoryId?: string;
  categoryName?: string;
  brand?: string;
  isArchived?: boolean;
  isActive?: boolean;
  primarySupplierId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ImportRowDTO {
  name: string;
  sku: string;
  sellingPrice: number | string;
  costPrice?: number | string;
  barcode?: string;
  barcodeSymbology?: BarcodeSymbology;
  categoryName?: string;
  brand?: string;
  unit?: string;
}

export interface ListProductsResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const productService = {
  async createProduct(tenantId: string, data: CreateProductDTO, userId: string): Promise<IProduct> {
    const normalizedSku = data.sku.toUpperCase().trim();

    // 1. Verify Unique SKU within Tenant
    const existingSku = await Product.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      sku: normalizedSku,
    });
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${normalizedSku}' already exists in this business`);
    }

    // 2. Validate Barcodes if provided
    if (data.barcodes && data.barcodes.length > 0) {
      const barcodeStrings = data.barcodes.map((b) => b.barcode.trim());
      const duplicatesInPayload = barcodeStrings.filter((b, i) => barcodeStrings.indexOf(b) !== i);
      if (duplicatesInPayload.length > 0) {
        throw new BadRequestError(`Duplicate barcode '${duplicatesInPayload[0]}' in payload`);
      }

      const existingBarcodes = await ProductBarcode.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        barcode: { $in: barcodeStrings },
      });

      if (existingBarcodes.length > 0) {
        throw new ConflictError(`Barcode '${existingBarcodes[0].barcode}' is already registered to another product`);
      }
    }

    // 3. Create Product
    const product = await Product.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: data.name.trim(),
      sku: normalizedSku,
      description: data.description,
      categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined,
      categoryName: data.categoryName,
      brand: data.brand,
      costPrice: Number(data.costPrice) || 0,
      sellingPrice: Number(data.sellingPrice),
      isTaxable: data.isTaxable !== undefined ? data.isTaxable : true,
      taxRatePercent: Number(data.taxRatePercent) || 0,
      unit: data.unit ? data.unit.toUpperCase() : 'PCS',
      reorderPoint: Number(data.reorderPoint) || 5,
      trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
      primarySupplierId: data.primarySupplierId ? new mongoose.Types.ObjectId(data.primarySupplierId) : undefined,
      supplierProductCode: data.supplierProductCode,
      hasVariants: Boolean(data.hasVariants && data.variants && data.variants.length > 0),
      variants: data.variants || [],
      tags: data.tags || [],
      images: data.images || [],
      isArchived: false,
      isActive: true,
    });

    // 4. Create ProductBarcodes
    if (data.barcodes && data.barcodes.length > 0) {
      const barcodeDocs = data.barcodes.map((b, index) => ({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        productId: product._id,
        variantId: b.variantId ? new mongoose.Types.ObjectId(b.variantId) : undefined,
        barcode: b.barcode.trim(),
        symbology: b.symbology || 'CODE128',
        isPrimary: b.isPrimary !== undefined ? b.isPrimary : index === 0,
        description: b.description,
      }));

      await ProductBarcode.insertMany(barcodeDocs);
    }

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Product',
      entityId: product.id,
      metadata: { sku: product.sku, name: product.name, sellingPrice: product.sellingPrice },
    });

    return product;
  },

  async updateProduct(
    tenantId: string,
    productId: string,
    data: UpdateProductDTO,
    userId: string
  ): Promise<IProduct> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID format');
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check SKU conflict if modified
    if (data.sku && data.sku.toUpperCase().trim() !== product.sku) {
      const normalizedSku = data.sku.toUpperCase().trim();
      const existing = await Product.findOne({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        sku: normalizedSku,
        _id: { $ne: product._id },
      });
      if (existing) {
        throw new ConflictError(`Product with SKU '${normalizedSku}' already exists in this business`);
      }
      product.sku = normalizedSku;
    }

    if (data.name !== undefined) product.name = data.name.trim();
    if (data.description !== undefined) product.description = data.description;
    if (data.categoryId !== undefined) {
      product.categoryId = data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined;
    }
    if (data.categoryName !== undefined) product.categoryName = data.categoryName;
    if (data.brand !== undefined) product.brand = data.brand;
    if (data.costPrice !== undefined) product.costPrice = Number(data.costPrice);
    if (data.sellingPrice !== undefined) product.sellingPrice = Number(data.sellingPrice);
    if (data.isTaxable !== undefined) product.isTaxable = data.isTaxable;
    if (data.taxRatePercent !== undefined) product.taxRatePercent = Number(data.taxRatePercent);
    if (data.unit !== undefined) product.unit = data.unit.toUpperCase();
    if (data.reorderPoint !== undefined) product.reorderPoint = Number(data.reorderPoint);
    if (data.trackInventory !== undefined) product.trackInventory = data.trackInventory;
    if (data.primarySupplierId !== undefined) {
      product.primarySupplierId = data.primarySupplierId ? new mongoose.Types.ObjectId(data.primarySupplierId) : undefined;
    }
    if (data.supplierProductCode !== undefined) product.supplierProductCode = data.supplierProductCode;
    if (data.tags !== undefined) product.tags = data.tags;
    if (data.images !== undefined) product.images = data.images;
    if (data.isActive !== undefined) product.isActive = data.isActive;
    if (data.variants !== undefined) {
      product.variants = data.variants;
      product.hasVariants = data.variants.length > 0;
    }

    // Barcode updates if provided
    if (data.barcodes !== undefined) {
      await ProductBarcode.deleteMany({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        productId: product._id,
      });

      if (data.barcodes.length > 0) {
        const barcodeDocs = data.barcodes.map((b, index) => ({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          productId: product._id,
          variantId: b.variantId ? new mongoose.Types.ObjectId(b.variantId) : undefined,
          barcode: b.barcode.trim(),
          symbology: b.symbology || 'CODE128',
          isPrimary: b.isPrimary !== undefined ? b.isPrimary : index === 0,
          description: b.description,
        }));
        await ProductBarcode.insertMany(barcodeDocs);
      }
    }

    await product.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'Product',
      entityId: product.id,
      metadata: { sku: product.sku, name: product.name },
    });

    return product;
  },

  async getProductById(tenantId: string, productId: string): Promise<IProduct & { barcodes: IProductBarcode[] }> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new InvalidIdError('Invalid product ID format');
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).lean();

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const barcodes = await ProductBarcode.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      productId: product._id,
    }).lean();

    return {
      ...product,
      barcodes,
    } as any;
  },

  async addBarcode(tenantId: string, productId: string, barcodeData: CreateBarcodeDTO): Promise<IProductBarcode> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (!product) throw new NotFoundError('Product not found');

    const cleanBarcode = barcodeData.barcode.trim();
    const existing = await ProductBarcode.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      barcode: cleanBarcode,
    });
    if (existing) {
      throw new ConflictError(`Barcode '${cleanBarcode}' is already assigned to a product`);
    }

    const barcode = await ProductBarcode.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      productId: product._id,
      variantId: barcodeData.variantId ? new mongoose.Types.ObjectId(barcodeData.variantId) : undefined,
      barcode: cleanBarcode,
      symbology: barcodeData.symbology || 'CODE128',
      isPrimary: barcodeData.isPrimary || false,
      description: barcodeData.description,
    });

    return barcode;
  },

  async removeBarcode(tenantId: string, barcodeId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(barcodeId)) {
      throw new BadRequestError('Invalid barcode ID');
    }
    const res = await ProductBarcode.deleteOne({
      _id: new mongoose.Types.ObjectId(barcodeId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (res.deletedCount === 0) {
      throw new NotFoundError('Barcode not found');
    }
  },

  async setArchiveStatus(tenantId: string, productId: string, isArchived: boolean, userId: string): Promise<IProduct> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (!product) throw new NotFoundError('Product not found');

    product.isArchived = isArchived;
    await product.save();

    await auditService.log({
      tenantId,
      userId,
      action: isArchived ? 'DELETE' : 'UPDATE',
      entity: 'Product',
      entityId: product.id,
      metadata: { sku: product.sku, isArchived },
    });

    return product;
  },

  async listProducts(tenantId: string, filter: ListProductsFilter): Promise<ListProductsResult> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isArchived: filter.isArchived !== undefined ? filter.isArchived : false,
    };

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }
    if (filter.categoryId && mongoose.Types.ObjectId.isValid(filter.categoryId)) {
      query.categoryId = new mongoose.Types.ObjectId(filter.categoryId);
    }
    if (filter.categoryName) {
      query.categoryName = filter.categoryName;
    }
    if (filter.brand) {
      query.brand = filter.brand;
    }
    if (filter.primarySupplierId && mongoose.Types.ObjectId.isValid(filter.primarySupplierId)) {
      query.primarySupplierId = new mongoose.Types.ObjectId(filter.primarySupplierId);
    }

    // Handle search query (Name, SKU, Brand, or Barcode)
    if (filter.search && filter.search.trim().length > 0) {
      const searchTerm = filter.search.trim();

      // 1. Fast-path exact barcode match (hits indexed unique barcode)
      const exactBarcodeRecords = await ProductBarcode.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        barcode: searchTerm,
      })
        .select('productId')
        .lean();

      let productIdsFromBarcodes = exactBarcodeRecords.map((b) => b.productId);

      const searchRegex = new RegExp(searchTerm, 'i');

      // If no exact barcode match, fallback to regex search on barcodes
      if (productIdsFromBarcodes.length === 0) {
        const matchingBarcodeRecords = await ProductBarcode.find({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          barcode: searchRegex,
        })
          .select('productId')
          .lean();

        productIdsFromBarcodes = matchingBarcodeRecords.map((b) => b.productId);
      }

      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { brand: searchRegex },
        { categoryName: searchRegex },
        { _id: { $in: productIdsFromBarcodes } },
      ];
    }

    const sortOptions: any = {};
    if (filter.sortBy) {
      sortOptions[filter.sortBy] = filter.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [products, totalRecords] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    // Attach barcodes to the returned products
    const productIds = products.map((p) => p._id);
    const barcodes = await ProductBarcode.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      productId: { $in: productIds },
    }).lean();

    const productsWithBarcodes = products.map((p) => ({
      ...p,
      barcodes: barcodes.filter((b) => b.productId.toString() === p._id.toString()),
    }));

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      products: productsWithBarcodes,
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

  // -------------------------------------------------------------
  // CSV IMPORT ARCHITECTURE
  // -------------------------------------------------------------
  async validateAndImportCsv(
    tenantId: string,
    rows: ImportRowDTO[],
    userId: string
  ): Promise<{
    success: boolean;
    importedCount: number;
    errors: Array<{ row: number; sku?: string; field?: string; message: string }>;
  }> {
    const errors: Array<{ row: number; sku?: string; field?: string; message: string }> = [];

    if (!rows || rows.length === 0) {
      return { success: false, importedCount: 0, errors: [{ row: 0, message: 'CSV payload is empty' }] };
    }

    const parsedRows: Array<{
      rowNumber: number;
      name: string;
      sku: string;
      sellingPrice: number;
      costPrice: number;
      barcode?: string;
      barcodeSymbology?: BarcodeSymbology;
      categoryName?: string;
      brand?: string;
      unit?: string;
    }> = [];

    const seenSkus = new Set<string>();
    const seenBarcodes = new Set<string>();

    // 1. Row-by-Row Structural Validation
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNumber = i + 1;

      if (!r.name || r.name.trim().length === 0) {
        errors.push({ row: rowNumber, field: 'name', message: 'Product Name is required' });
      }

      if (!r.sku || r.sku.trim().length === 0) {
        errors.push({ row: rowNumber, field: 'sku', message: 'Product SKU is required' });
      }

      const normalizedSku = r.sku ? r.sku.toUpperCase().trim() : '';

      if (normalizedSku) {
        if (seenSkus.has(normalizedSku)) {
          errors.push({ row: rowNumber, sku: normalizedSku, field: 'sku', message: `Duplicate SKU '${normalizedSku}' within import file` });
        }
        seenSkus.add(normalizedSku);
      }

      const sellingPrice = Number(r.sellingPrice);
      if (isNaN(sellingPrice) || sellingPrice < 0) {
        errors.push({ row: rowNumber, sku: normalizedSku, field: 'sellingPrice', message: 'Selling price must be a valid positive number' });
      }

      const costPrice = r.costPrice !== undefined && r.costPrice !== '' ? Number(r.costPrice) : 0;
      if (isNaN(costPrice) || costPrice < 0) {
        errors.push({ row: rowNumber, sku: normalizedSku, field: 'costPrice', message: 'Cost price must be a valid positive number' });
      }

      const cleanBarcode = r.barcode ? String(r.barcode).trim() : undefined;
      if (cleanBarcode) {
        if (seenBarcodes.has(cleanBarcode)) {
          errors.push({ row: rowNumber, sku: normalizedSku, field: 'barcode', message: `Duplicate Barcode '${cleanBarcode}' within import file` });
        }
        seenBarcodes.add(cleanBarcode);
      }

      if (errors.filter((e) => e.row === rowNumber).length === 0) {
        parsedRows.push({
          rowNumber,
          name: r.name.trim(),
          sku: normalizedSku,
          sellingPrice,
          costPrice,
          barcode: cleanBarcode,
          barcodeSymbology: r.barcodeSymbology || 'CODE128',
          categoryName: r.categoryName?.trim(),
          brand: r.brand?.trim(),
          unit: r.unit?.toUpperCase().trim() || 'PCS',
        });
      }
    }

    // 2. Database Conflict Checks (Existing SKUs and Barcodes)
    if (seenSkus.size > 0) {
      const existingDbSkus = await Product.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        sku: { $in: Array.from(seenSkus) },
      }).select('sku');

      for (const existing of existingDbSkus) {
        errors.push({
          row: 0,
          sku: existing.sku,
          field: 'sku',
          message: `SKU '${existing.sku}' already exists in database`,
        });
      }
    }

    if (seenBarcodes.size > 0) {
      const existingDbBarcodes = await ProductBarcode.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        barcode: { $in: Array.from(seenBarcodes) },
      }).select('barcode');

      for (const existing of existingDbBarcodes) {
        errors.push({
          row: 0,
          field: 'barcode',
          message: `Barcode '${existing.barcode}' already exists in database`,
        });
      }
    }

    // If any error exists, do NOT import silently
    if (errors.length > 0) {
      return { success: false, importedCount: 0, errors };
    }

    // 3. Batch Insertion
    const productsToInsert = parsedRows.map((r) => ({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: r.name,
      sku: r.sku,
      sellingPrice: r.sellingPrice,
      costPrice: r.costPrice,
      categoryName: r.categoryName,
      brand: r.brand,
      unit: r.unit,
      isTaxable: true,
      reorderPoint: 5,
      trackInventory: true,
      isArchived: false,
      isActive: true,
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);

    const barcodesToInsert: any[] = [];
    for (let i = 0; i < parsedRows.length; i++) {
      const r = parsedRows[i];
      if (r.barcode) {
        barcodesToInsert.push({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          productId: insertedProducts[i]._id,
          barcode: r.barcode,
          symbology: r.barcodeSymbology,
          isPrimary: true,
        });
      }
    }

    if (barcodesToInsert.length > 0) {
      await ProductBarcode.insertMany(barcodesToInsert);
    }

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'ProductBatchImport',
      metadata: { count: insertedProducts.length },
    });

    return {
      success: true,
      importedCount: insertedProducts.length,
      errors: [],
    };
  },
};
