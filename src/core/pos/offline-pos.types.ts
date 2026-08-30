export interface IOfflineProductManifestItem {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice?: number;
  categoryName?: string;
  taxRatePercent?: number;
  barcodes: string[];
  unit?: string;
}

export interface IOfflineManifest {
  generatedAt: string;
  tenantId: string;
  currency: string;
  products: IOfflineProductManifestItem[];
  barcodeMap: Record<string, { productId: string; name: string; sku: string; price: number }>;
  locations: { id: string; name: string; code: string; isDefault: boolean }[];
}

export interface IOfflineQueuedItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRatePercent?: number;
}

export interface IOfflineQueuedPayment {
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'OTHER';
  amount: number;
  reference?: string;
  tenderedAmount?: number;
  changeAmount?: number;
}

export interface IOfflineQueuedSale {
  offlineSaleId: string; // Unique client-generated UUID / Idempotency Key
  locationId: string;
  customerId?: string;
  customerName?: string;
  items: IOfflineQueuedItem[];
  payments: IOfflineQueuedPayment[];
  notes?: string;
  offlineCreatedAt: string;
}

export interface IOfflineSyncResult {
  synced: {
    offlineSaleId: string;
    saleId: string;
    saleNumber: string;
    grandTotal: number;
  }[];
  duplicatesSkipped: {
    offlineSaleId: string;
    saleId: string;
    saleNumber: string;
    reason: string;
  }[];
  failed: {
    offlineSaleId: string;
    error: string;
  }[];
  totalProcessed: number;
}
