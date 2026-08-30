import mongoose from 'mongoose';
import { Tenant, ITenant } from './tenant.model.js';
import { Product } from '../catalog/product.model.js';
import { Location, InventoryItem } from '../inventory/inventory.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { ROLE_PERMISSIONS, PERMISSIONS } from '../rbac/permissions.js';
import { NotFoundError, ConflictError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface CreateTenantDTO {
  name: string;
  slug?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  businessType?: string;
  phone?: string;
  email?: string;
}

export interface SetupBusinessDTO {
  name: string;
  country: string;
  currency: string;
  timezone: string;
  businessType: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logoUrl?: string;
}

export interface OnboardingProductDTO {
  name: string;
  sku?: string;
  barcode?: string;
  sellingPrice: number;
  costPrice?: number;
  categoryName?: string;
  initialStock?: number;
}

export interface OnboardingDTO {
  business?: {
    name?: string;
    country?: string;
    currency?: string;
    timezone?: string;
    businessType?: string;
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  location?: {
    name?: string;
    code?: string;
    street?: string;
    city?: string;
  };
  products?: OnboardingProductDTO[];
  loadSampleProducts?: boolean;
  markComplete?: boolean;
}

export interface SetupChecklistResult {
  businessProfile: boolean;
  products: boolean;
  location: boolean;
  openingStock: boolean;
  isSetupComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  items: Array<{
    id: 'businessProfile' | 'products' | 'location' | 'openingStock';
    label: string;
    description: string;
    completed: boolean;
    actionRoute: string;
  }>;
}

export const tenantService = {
  async createTenant(data: CreateTenantDTO, userId?: string): Promise<ITenant> {
    const slug =
      data.slug ||
      data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30) +
        '-' +
        Math.random().toString(36).substring(2, 6);

    const existing = await Tenant.findOne({ slug });
    if (existing) {
      throw new ConflictError(`Business with identifier '${slug}' already exists`);
    }

    const tenant = await Tenant.create({
      name: data.name,
      slug,
      country: data.country || 'US',
      currency: data.currency || 'USD',
      timezone: data.timezone || 'UTC',
      businessType: data.businessType || 'HYBRID_RETAIL',
      phone: data.phone,
      email: data.email,
      isSetupComplete: false,
      activeModules: ['core', 'retail', 'ecommerce'],
    });

    if (userId) {
      await auditService.log({
        tenantId: tenant.id,
        userId,
        action: 'CREATE',
        entity: 'Tenant',
        entityId: tenant.id,
        metadata: { name: tenant.name, slug: tenant.slug },
      });
    }

    return tenant;
  },

  async getTenantById(tenantId: string): Promise<ITenant> {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant '${tenantId}' not found`);
    }
    return tenant;
  },

  async getTenantBySlug(slug: string): Promise<ITenant> {
    const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
    if (!tenant) {
      throw new NotFoundError(`Business '${slug}' not found`);
    }
    return tenant;
  },

  async setupBusiness(tenantId: string, data: SetupBusinessDTO, userId: string): Promise<ITenant> {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Business not found');
    }

    tenant.name = data.name;
    tenant.country = data.country;
    tenant.currency = data.currency;
    tenant.timezone = data.timezone;
    tenant.businessType = data.businessType;
    if (data.phone) tenant.phone = data.phone;
    if (data.email) tenant.email = data.email;
    if (data.address) tenant.address = data.address;
    if (data.logoUrl) tenant.logoUrl = data.logoUrl;
    tenant.isSetupComplete = true;

    await tenant.save();

    await auditService.log({
      tenantId: tenant.id,
      userId,
      action: 'UPDATE',
      entity: 'TenantSetup',
      entityId: tenant.id,
      metadata: { name: tenant.name, currency: tenant.currency, businessType: tenant.businessType },
    });

    return tenant;
  },

  // -------------------------------------------------------------
  // SETUP CHECKLIST CALCULATION
  // -------------------------------------------------------------
  async getSetupChecklist(tenantId: string): Promise<SetupChecklistResult> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) {
      throw new NotFoundError('Business not found');
    }

    // 1. Business Profile Step: valid name, country, currency, contact info
    const businessProfile = Boolean(
      tenant.name &&
      tenant.name.trim().length > 0 &&
      tenant.country &&
      tenant.currency &&
      (tenant.phone || tenant.email || tenant.address?.city)
    );

    // 2. Products Step: at least one active product created
    const productCount = await Product.countDocuments({
      tenantId: tenantObjectId,
      isArchived: { $ne: true },
    });
    const products = productCount > 0;

    // 3. Location Step: at least one active location
    const locationCount = await Location.countDocuments({
      tenantId: tenantObjectId,
      isActive: { $ne: false },
    });
    const location = locationCount > 0;

    // 4. Opening Stock Step: at least one inventory item with stockOnHand > 0
    const stockCount = await InventoryItem.countDocuments({
      tenantId: tenantObjectId,
      quantityOnHand: { $gt: 0 },
    });
    const openingStock = stockCount > 0;

    const allStepsCompleted = businessProfile && products && location && openingStock;
    const isSetupComplete = tenant.isSetupComplete || allStepsCompleted;

    const items: SetupChecklistResult['items'] = [
      {
        id: 'businessProfile',
        label: 'Business profile',
        description: 'Set company name, business type, currency, and contact details',
        completed: businessProfile,
        actionRoute: 'setup?step=1',
      },
      {
        id: 'location',
        label: 'Location',
        description: 'Add your primary store, warehouse, or retail branch',
        completed: location,
        actionRoute: 'setup?step=2',
      },
      {
        id: 'products',
        label: 'Products',
        description: 'Add your initial items or load sample starter catalog',
        completed: products,
        actionRoute: 'setup?step=3',
      },
      {
        id: 'openingStock',
        label: 'Opening stock',
        description: 'Set initial stock quantities for ready-to-sell inventory',
        completed: openingStock,
        actionRoute: 'setup?step=4',
      },
    ];

    const completedSteps = items.filter((i) => i.completed).length;
    const totalSteps = items.length;
    const percentComplete = Math.round((completedSteps / totalSteps) * 100);

    return {
      businessProfile,
      products,
      location,
      openingStock,
      isSetupComplete,
      completedSteps,
      totalSteps,
      percentComplete,
      items,
    };
  },

  // -------------------------------------------------------------
  // 5-STEP STREAMLINED ONBOARDING PROCESSOR
  // -------------------------------------------------------------
  async completeOnboarding(
    tenantId: string,
    data: OnboardingDTO,
    userId: string
  ): Promise<{ tenant: ITenant; checklist: SetupChecklistResult; productsCreated: number; sampleLoaded: boolean }> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) {
      throw new NotFoundError('Business not found');
    }

    let productsCreated = 0;
    let sampleLoaded = false;

    // Step 1: Business Information
    if (data.business) {
      if (data.business.name) tenant.name = data.business.name.trim();
      if (data.business.country) tenant.country = data.business.country;
      if (data.business.currency) tenant.currency = data.business.currency;
      if (data.business.timezone) tenant.timezone = data.business.timezone;
      if (data.business.businessType) tenant.businessType = data.business.businessType;
      if (data.business.phone) tenant.phone = data.business.phone;
      if (data.business.email) tenant.email = data.business.email;
      if (data.business.address) tenant.address = data.business.address;
    }

    // Step 2: Ensure Location
    let defaultLocation = await Location.findOne({ tenantId: tenantObjectId, isDefault: true });
    if (!defaultLocation) {
      const locName = data.location?.name || `${tenant.name} Main Store`;
      const locCode = data.location?.code || 'MAIN-01';
      defaultLocation = await Location.create({
        tenantId: tenantObjectId,
        name: locName,
        code: locCode,
        type: 'STORE',
        address: data.business?.address ? {
          street: data.business.address.street,
          city: data.business.address.city,
          state: data.business.address.state,
          zipCode: data.business.address.postalCode,
          country: data.business.address.country,
        } : undefined,
        isDefault: true,
        isActive: true,
      });
    } else if (data.location?.name) {
      defaultLocation.name = data.location.name;
      await defaultLocation.save();
    }

    // Step 3 & 4: Products & Opening Stock
    if (data.loadSampleProducts) {
      await this.loadSampleData(tenantId, userId);
      sampleLoaded = true;
      productsCreated += 4;
    } else if (data.products && data.products.length > 0) {
      for (const prodData of data.products) {
        const sku = prodData.sku || `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const product = await Product.create({
          tenantId: tenantObjectId,
          name: prodData.name.trim(),
          sku,
          sellingPrice: Number(prodData.sellingPrice) || 0,
          costPrice: Number(prodData.costPrice) || 0,
          categoryName: prodData.categoryName || 'General',
          barcodes: prodData.barcode ? [{ barcode: prodData.barcode.trim(), symbology: 'CODE128', isPrimary: true }] : [],
          unit: 'pcs',
          isActive: true,
        });
        productsCreated++;

        // Add initial stock if specified > 0
        const qty = Number(prodData.initialStock);
        if (qty > 0) {
          await inventoryService.recordStockMovement({
            tenantId,
            locationId: defaultLocation.id,
            productId: product.id,
            transactionType: 'OPENING_BALANCE',
            quantityDelta: qty,
            costPerUnit: Number(prodData.costPrice) || 0,
            referenceType: 'ONBOARDING',
            referenceId: tenant.id,
            notes: 'Initial opening stock from onboarding wizard',
            userId,
          });
        }
      }
    }

    // Step 5: Mark complete if requested or all steps finished
    if (data.markComplete !== false) {
      tenant.isSetupComplete = true;
    }

    await tenant.save();

    await auditService.log({
      tenantId: tenant.id,
      userId,
      action: 'UPDATE',
      entity: 'Onboarding',
      entityId: tenant.id,
      metadata: {
        productsCreated,
        sampleLoaded,
        isSetupComplete: tenant.isSetupComplete,
      },
    });

    const checklist = await this.getSetupChecklist(tenantId);
    return {
      tenant,
      checklist,
      productsCreated,
      sampleLoaded,
    };
  },

  // -------------------------------------------------------------
  // 1-CLICK SAMPLE CATALOG & OPENING INVENTORY STARTER PACK
  // -------------------------------------------------------------
  async loadSampleData(tenantId: string, userId: string): Promise<void> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const location = await inventoryService.getOrCreateDefaultLocation(tenantId);

    const sampleProducts = [
      {
        name: 'Organic Colombian Coffee Beans (250g)',
        sku: 'COF-COL-250',
        barcode: '890123456001',
        sellingPrice: 14.5,
        costPrice: 7.2,
        categoryName: 'Beverages',
        initialStock: 45,
      },
      {
        name: 'Ceramic Artisan Coffee Mug',
        sku: 'MUG-ART-01',
        barcode: '890123456002',
        sellingPrice: 18.0,
        costPrice: 6.5,
        categoryName: 'Merchandise',
        initialStock: 30,
      },
      {
        name: 'Fresh French Butter Croissant',
        sku: 'BAK-CROIS-01',
        barcode: '890123456003',
        sellingPrice: 4.25,
        costPrice: 1.5,
        categoryName: 'Bakery',
        initialStock: 25,
      },
      {
        name: 'Organic Matcha Green Tea Tin (50g)',
        sku: 'TEA-MAT-050',
        barcode: '890123456004',
        sellingPrice: 22.0,
        costPrice: 11.0,
        categoryName: 'Beverages',
        initialStock: 20,
      },
    ];

    for (const sample of sampleProducts) {
      let product = await Product.findOne({ tenantId: tenantObjectId, sku: sample.sku });
      if (!product) {
        product = await Product.create({
          tenantId: tenantObjectId,
          name: sample.name,
          sku: sample.sku,
          sellingPrice: sample.sellingPrice,
          costPrice: sample.costPrice,
          categoryName: sample.categoryName,
          barcodes: [{ barcode: sample.barcode, symbology: 'CODE128', isPrimary: true }],
          unit: 'pcs',
          isActive: true,
        });
      }

      const existingItem = await InventoryItem.findOne({
        tenantId: tenantObjectId,
        locationId: location._id,
        productId: product._id,
      });

      if (!existingItem || existingItem.quantityOnHand === 0) {
        await inventoryService.recordStockMovement({
          tenantId,
          locationId: location.id,
          productId: product.id,
          transactionType: 'OPENING_BALANCE',
          quantityDelta: sample.initialStock,
          costPerUnit: sample.costPrice,
          referenceType: 'SAMPLE_PACK',
          referenceId: tenantId,
          notes: 'Sample starter catalog opening stock',
          userId,
        });
      }
    }
  },

  // -------------------------------------------------------------
  // SYSTEM ROLES & PERMISSIONS METADATA
  // -------------------------------------------------------------
  getRolesAndPermissions() {
    const roleDescriptions: Record<string, string> = {
      Owner: 'Full administrative access across all business modules, financial reports, settings, and team management.',
      Manager: 'Can supervise daily operations, manage inventory, handle orders, approve purchases, and invite staff.',
      Sales: 'Focused on creating customer quotes, orders, managing CRM clients, and running sales workflows.',
      Cashier: 'High-speed POS cashier operations, scanning barcodes, processing tenders, and printing receipts.',
      'Inventory Manager': 'Full stock control, inventory receiving, warehouse transfers, adjustments, and supplier relations.',
      Accountant: 'Financial ledgers, double-entry money operations, journal entries, P&L statements, and tax audits.',
      Staff: 'Standard frontline staff with read-only product lookup and assigned operational tasks.',
    };

    return Object.entries(ROLE_PERMISSIONS).map(([roleName, permissions]) => ({
      role: roleName,
      description: roleDescriptions[roleName] || 'Standard team role',
      permissions,
      permissionCount: permissions.length,
      isSystemRole: true,
    }));
  },

  // -------------------------------------------------------------
  // CATEGORIZED SETTINGS MANAGEMENT
  // -------------------------------------------------------------
  async getCategorizedSettings(tenantId: string) {
    const tenant = await this.getTenantById(tenantId);
    const locations = await inventoryService.listLocations(tenantId);
    const roles = this.getRolesAndPermissions();

    return {
      business: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        country: tenant.country,
        currency: tenant.currency,
        timezone: tenant.timezone,
        businessType: tenant.businessType,
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.address || {},
        logoUrl: tenant.logoUrl || '',
        isSetupComplete: tenant.isSetupComplete,
      },
      taxes: {
        taxNumber: tenant.settings?.taxNumber || '',
        defaultTaxRate: tenant.settings?.defaultTaxRate ?? 0,
        pricesIncludeTax: Boolean(tenant.settings?.pricesIncludeTax),
        taxRates: tenant.settings?.taxRates || [
          { name: 'Standard VAT / Sales Tax', rate: tenant.settings?.defaultTaxRate || 0, isDefault: true, code: 'STD' },
          { name: 'Zero-rated', rate: 0, isDefault: false, code: 'ZERO' },
        ],
      },
      currency: {
        currency: tenant.currency,
        symbol: tenant.settings?.currencySymbol || '$',
        position: tenant.settings?.currencyPosition || 'before',
        decimalPlaces: tenant.settings?.decimalPlaces ?? 2,
        thousandSeparator: tenant.settings?.thousandSeparator || ',',
        decimalSeparator: tenant.settings?.decimalSeparator || '.',
      },
      receipt: {
        header: tenant.settings?.receiptHeader || `Welcome to ${tenant.name}`,
        footer: tenant.settings?.receiptFooter || 'Thank you for your business! Please visit again.',
        showLogo: tenant.settings?.receiptShowLogo !== false,
        showTax: tenant.settings?.receiptShowTax !== false,
        showBarcode: tenant.settings?.receiptShowBarcode !== false,
        width: tenant.settings?.receiptWidth || '80mm',
        terms: tenant.settings?.receiptTerms || 'Goods sold in good condition cannot be returned after 7 days.',
      },
      invoice: {
        prefix: tenant.settings?.invoicePrefix || 'INV-',
        nextNumber: tenant.settings?.nextInvoiceNumber ?? 1001,
        paymentTerms: tenant.settings?.paymentTerms || 'DUE_ON_RECEIPT',
        defaultNotes: tenant.settings?.invoiceDefaultNotes || 'Payment due within invoice terms. Thank you for your partnership.',
        bankDetails: tenant.settings?.invoiceBankDetails || 'Bank: Universal National Bank\nAccount: 123456789\nRouting: 987654321',
        dueDays: tenant.settings?.invoiceDueDays ?? 14,
      },
      notifications: {
        emailAlertsEnabled: tenant.settings?.emailAlertsEnabled !== false,
        lowStockAlertThreshold: tenant.settings?.lowStockAlertThreshold ?? 5,
        lowStockEmailRecipient: tenant.settings?.lowStockEmailRecipient || tenant.email || '',
        dailySalesSummaryEmail: Boolean(tenant.settings?.dailySalesSummaryEmail),
        orderNotificationsEnabled: tenant.settings?.orderNotificationsEnabled !== false,
      },
      integrations: {
        apiKey: tenant.settings?.apiKey || `ak_live_${tenant.id.substring(0, 8)}_${Math.random().toString(36).substring(2, 8)}`,
        webhookUrl: tenant.settings?.webhookUrl || '',
        shopifyConnected: Boolean(tenant.settings?.shopifyConnected),
        stripeConnected: Boolean(tenant.settings?.stripeConnected),
        quickbooksConnected: Boolean(tenant.settings?.quickbooksConnected),
        webhookEvents: tenant.settings?.webhookEvents || ['sale.created', 'inventory.low', 'customer.registered'],
      },
      security: {
        sessionTimeoutMinutes: tenant.settings?.sessionTimeoutMinutes ?? 1440,
        twoFactorRequired: Boolean(tenant.settings?.twoFactorRequired),
        passwordExpiryDays: tenant.settings?.passwordExpiryDays ?? 90,
      },
      advanced: {
        allowNegativeStock: Boolean(tenant.settings?.allowNegativeStock),
        customCss: tenant.settings?.customCss || '',
        webhookSecret: tenant.settings?.webhookSecret || `whsec_${Math.random().toString(36).substring(2, 12)}`,
        rawConfigJson: tenant.settings?.rawConfigJson || '{\n  "cacheTtlSeconds": 300,\n  "offlineSyncBatchSize": 50\n}',
        debugMode: Boolean(tenant.settings?.debugMode),
      },
      locations,
      roles,
    };
  },

  async updateTenantSettings(tenantId: string, settings: any, userId: string): Promise<ITenant> {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Business not found');
    }

    tenant.settings = { ...tenant.settings, ...settings };
    await tenant.save();

    await auditService.log({
      tenantId: tenant.id,
      userId,
      action: 'UPDATE',
      entity: 'TenantSettings',
      entityId: tenant.id,
      metadata: { settingsUpdated: Object.keys(settings) },
    });

    return tenant;
  },

  async updateCategorySettings(tenantId: string, category: string, payload: any, userId: string): Promise<any> {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Business not found');
    }

    switch (category.toLowerCase()) {
      case 'business': {
        if (payload.name) tenant.name = payload.name.trim();
        if (payload.country) tenant.country = payload.country;
        if (payload.currency) tenant.currency = payload.currency;
        if (payload.timezone) tenant.timezone = payload.timezone;
        if (payload.businessType) tenant.businessType = payload.businessType;
        if (payload.phone !== undefined) tenant.phone = payload.phone;
        if (payload.email !== undefined) tenant.email = payload.email;
        if (payload.address) tenant.address = { ...tenant.address, ...payload.address };
        if (payload.logoUrl !== undefined) tenant.logoUrl = payload.logoUrl;
        await tenant.save();
        break;
      }
      case 'taxes': {
        tenant.settings = {
          ...tenant.settings,
          taxNumber: payload.taxNumber !== undefined ? payload.taxNumber : tenant.settings?.taxNumber,
          defaultTaxRate: payload.defaultTaxRate !== undefined ? Number(payload.defaultTaxRate) : tenant.settings?.defaultTaxRate,
          pricesIncludeTax: payload.pricesIncludeTax !== undefined ? Boolean(payload.pricesIncludeTax) : tenant.settings?.pricesIncludeTax,
          taxRates: payload.taxRates || tenant.settings?.taxRates,
        };
        await tenant.save();
        break;
      }
      case 'currency': {
        if (payload.currency) tenant.currency = payload.currency;
        tenant.settings = {
          ...tenant.settings,
          currencySymbol: payload.symbol || tenant.settings?.currencySymbol,
          currencyPosition: payload.position || tenant.settings?.currencyPosition,
          decimalPlaces: payload.decimalPlaces !== undefined ? Number(payload.decimalPlaces) : tenant.settings?.decimalPlaces,
          thousandSeparator: payload.thousandSeparator || tenant.settings?.thousandSeparator,
          decimalSeparator: payload.decimalSeparator || tenant.settings?.decimalSeparator,
        };
        await tenant.save();
        break;
      }
      case 'receipt': {
        tenant.settings = {
          ...tenant.settings,
          receiptHeader: payload.header !== undefined ? payload.header : tenant.settings?.receiptHeader,
          receiptFooter: payload.footer !== undefined ? payload.footer : tenant.settings?.receiptFooter,
          receiptShowLogo: payload.showLogo !== undefined ? Boolean(payload.showLogo) : tenant.settings?.receiptShowLogo,
          receiptShowTax: payload.showTax !== undefined ? Boolean(payload.showTax) : tenant.settings?.receiptShowTax,
          receiptShowBarcode: payload.showBarcode !== undefined ? Boolean(payload.showBarcode) : tenant.settings?.receiptShowBarcode,
          receiptWidth: payload.width || tenant.settings?.receiptWidth,
          receiptTerms: payload.terms !== undefined ? payload.terms : tenant.settings?.receiptTerms,
        };
        await tenant.save();
        break;
      }
      case 'invoice': {
        tenant.settings = {
          ...tenant.settings,
          invoicePrefix: payload.prefix !== undefined ? payload.prefix : tenant.settings?.invoicePrefix,
          nextInvoiceNumber: payload.nextNumber !== undefined ? Number(payload.nextNumber) : tenant.settings?.nextInvoiceNumber,
          paymentTerms: payload.paymentTerms || tenant.settings?.paymentTerms,
          invoiceDefaultNotes: payload.defaultNotes !== undefined ? payload.defaultNotes : tenant.settings?.invoiceDefaultNotes,
          invoiceBankDetails: payload.bankDetails !== undefined ? payload.bankDetails : tenant.settings?.invoiceBankDetails,
          invoiceDueDays: payload.dueDays !== undefined ? Number(payload.dueDays) : tenant.settings?.invoiceDueDays,
        };
        await tenant.save();
        break;
      }
      case 'notifications': {
        tenant.settings = {
          ...tenant.settings,
          emailAlertsEnabled: payload.emailAlertsEnabled !== undefined ? Boolean(payload.emailAlertsEnabled) : tenant.settings?.emailAlertsEnabled,
          lowStockAlertThreshold: payload.lowStockAlertThreshold !== undefined ? Number(payload.lowStockAlertThreshold) : tenant.settings?.lowStockAlertThreshold,
          lowStockEmailRecipient: payload.lowStockEmailRecipient !== undefined ? payload.lowStockEmailRecipient : tenant.settings?.lowStockEmailRecipient,
          dailySalesSummaryEmail: payload.dailySalesSummaryEmail !== undefined ? Boolean(payload.dailySalesSummaryEmail) : tenant.settings?.dailySalesSummaryEmail,
          orderNotificationsEnabled: payload.orderNotificationsEnabled !== undefined ? Boolean(payload.orderNotificationsEnabled) : tenant.settings?.orderNotificationsEnabled,
        };
        await tenant.save();
        break;
      }
      case 'integrations': {
        tenant.settings = {
          ...tenant.settings,
          apiKey: payload.apiKey || tenant.settings?.apiKey,
          webhookUrl: payload.webhookUrl !== undefined ? payload.webhookUrl : tenant.settings?.webhookUrl,
          shopifyConnected: payload.shopifyConnected !== undefined ? Boolean(payload.shopifyConnected) : tenant.settings?.shopifyConnected,
          stripeConnected: payload.stripeConnected !== undefined ? Boolean(payload.stripeConnected) : tenant.settings?.stripeConnected,
          quickbooksConnected: payload.quickbooksConnected !== undefined ? Boolean(payload.quickbooksConnected) : tenant.settings?.quickbooksConnected,
          webhookEvents: payload.webhookEvents || tenant.settings?.webhookEvents,
        };
        await tenant.save();
        break;
      }
      case 'security': {
        tenant.settings = {
          ...tenant.settings,
          sessionTimeoutMinutes: payload.sessionTimeoutMinutes !== undefined ? Number(payload.sessionTimeoutMinutes) : tenant.settings?.sessionTimeoutMinutes,
          twoFactorRequired: payload.twoFactorRequired !== undefined ? Boolean(payload.twoFactorRequired) : tenant.settings?.twoFactorRequired,
          passwordExpiryDays: payload.passwordExpiryDays !== undefined ? Number(payload.passwordExpiryDays) : tenant.settings?.passwordExpiryDays,
        };
        await tenant.save();
        break;
      }
      case 'advanced': {
        tenant.settings = {
          ...tenant.settings,
          allowNegativeStock: payload.allowNegativeStock !== undefined ? Boolean(payload.allowNegativeStock) : tenant.settings?.allowNegativeStock,
          customCss: payload.customCss !== undefined ? payload.customCss : tenant.settings?.customCss,
          webhookSecret: payload.webhookSecret !== undefined ? payload.webhookSecret : tenant.settings?.webhookSecret,
          rawConfigJson: payload.rawConfigJson !== undefined ? payload.rawConfigJson : tenant.settings?.rawConfigJson,
          debugMode: payload.debugMode !== undefined ? Boolean(payload.debugMode) : tenant.settings?.debugMode,
        };
        await tenant.save();
        break;
      }
      default: {
        tenant.settings = { ...tenant.settings, ...payload };
        await tenant.save();
      }
    }

    await auditService.log({
      tenantId: tenant.id,
      userId,
      action: 'UPDATE',
      entity: `Settings:${category}`,
      entityId: tenant.id,
      metadata: { category, fields: Object.keys(payload) },
    });

    return await this.getCategorizedSettings(tenantId);
  },
};
