import {
  IOfflineManifest,
  IOfflineProductManifestItem,
  IOfflineQueuedSale,
  IOfflineQueuedItem,
  IOfflineQueuedPayment,
  IOfflineSyncResult,
} from '../core/pos/offline-pos.types.js';

export interface IOfflineCartItem extends IOfflineQueuedItem {}

export class LocalProductCache {
  private products = new Map<string, IOfflineProductManifestItem>();

  load(products: IOfflineProductManifestItem[]) {
    this.products.clear();
    for (const p of products) {
      this.products.set(p.id, p);
    }
  }

  getById(productId: string): IOfflineProductManifestItem | undefined {
    return this.products.get(productId);
  }

  getAll(): IOfflineProductManifestItem[] {
    return Array.from(this.products.values());
  }

  search(term: string): IOfflineProductManifestItem[] {
    const clean = term.toLowerCase().trim();
    if (!clean) return this.getAll();
    return this.getAll().filter(
      (p) =>
        p.name.toLowerCase().includes(clean) ||
        p.sku.toLowerCase().includes(clean) ||
        p.barcodes.some((b) => b.toLowerCase().includes(clean))
    );
  }
}

export class LocalBarcodeIndex {
  private barcodeMap = new Map<string, { productId: string; name: string; sku: string; price: number }>();

  load(barcodeMap: Record<string, { productId: string; name: string; sku: string; price: number }>) {
    this.barcodeMap.clear();
    for (const [code, info] of Object.entries(barcodeMap)) {
      this.barcodeMap.set(code, info);
    }
  }

  lookup(barcode: string): { productId: string; name: string; sku: string; price: number } | undefined {
    return this.barcodeMap.get(barcode.trim());
  }
}

export class OfflineCart {
  private items: IOfflineCartItem[] = [];

  addItem(product: IOfflineProductManifestItem, quantity = 1): IOfflineCartItem {
    const existing = this.items.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }

    const newItem: IOfflineCartItem = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice: product.sellingPrice,
      discountAmount: 0,
      taxRatePercent: product.taxRatePercent || 0,
    };
    this.items.push(newItem);
    return newItem;
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
  }

  removeItem(productId: string) {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  clear() {
    this.items = [];
  }

  getItems(): IOfflineCartItem[] {
    return [...this.items];
  }

  calculateTotals(): {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  } {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    for (const it of this.items) {
      const lineGross = it.quantity * it.unitPrice;
      const lineDisc = (it.discountAmount || 0) * it.quantity;
      const lineNet = Math.max(0, lineGross - lineDisc);
      const lineTax = (lineNet * (it.taxRatePercent || 0)) / 100;

      subtotal += lineGross;
      discountTotal += lineDisc;
      taxTotal += lineTax;
    }

    const grandTotal = Number((subtotal - discountTotal + taxTotal).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      grandTotal,
    };
  }
}

export class OfflineTransactionQueue {
  private queue: IOfflineQueuedSale[] = [];

  enqueue(sale: IOfflineQueuedSale) {
    this.queue.push(sale);
  }

  getQueue(): IOfflineQueuedSale[] {
    return [...this.queue];
  }

  removeSynced(syncedIds: string[]) {
    const syncedSet = new Set(syncedIds);
    this.queue = this.queue.filter((s) => !syncedSet.has(s.offlineSaleId));
  }

  count(): number {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}

export class OfflinePOSManager {
  public catalog = new LocalProductCache();
  public barcodeIndex = new LocalBarcodeIndex();
  public cart = new OfflineCart();
  public queue = new OfflineTransactionQueue();
  public isOnline = true;

  constructor() {
    // Network listeners for browser environments
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
  }

  getStatusBadge(): { status: 'ONLINE' | 'OFFLINE'; message: string } {
    if (this.isOnline) {
      return { status: 'ONLINE', message: 'Online' };
    }
    return {
      status: 'OFFLINE',
      message: 'Offline — Sales will sync automatically when connection returns.',
    };
  }

  seedManifest(manifest: IOfflineManifest) {
    this.catalog.load(manifest.products);
    this.barcodeIndex.load(manifest.barcodeMap);
  }

  checkoutOffline(params: {
    locationId: string;
    customerId?: string;
    customerName?: string;
    payments: IOfflineQueuedPayment[];
    notes?: string;
  }): IOfflineQueuedSale {
    const items = this.cart.getItems();
    if (items.length === 0) {
      throw new Error('Cannot checkout empty cart');
    }

    const offlineSaleId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const queuedSale: IOfflineQueuedSale = {
      offlineSaleId,
      locationId: params.locationId,
      customerId: params.customerId,
      customerName: params.customerName || 'Walk-in Customer',
      items,
      payments: params.payments,
      notes: params.notes,
      offlineCreatedAt: new Date().toISOString(),
    };

    this.queue.enqueue(queuedSale);
    this.cart.clear();

    return queuedSale;
  }

  async syncWithServer(
    syncFunction: (sales: IOfflineQueuedSale[]) => Promise<IOfflineSyncResult>
  ): Promise<IOfflineSyncResult> {
    const pendingSales = this.queue.getQueue();
    if (pendingSales.length === 0) {
      return {
        synced: [],
        duplicatesSkipped: [],
        failed: [],
        totalProcessed: 0,
      };
    }

    const result = await syncFunction(pendingSales);

    // Remove successfully synced and acknowledged duplicate sales from queue
    const acknowledgedIds = [
      ...result.synced.map((s) => s.offlineSaleId),
      ...result.duplicatesSkipped.map((d) => d.offlineSaleId),
    ];

    this.queue.removeSynced(acknowledgedIds);

    return result;
  }
}
