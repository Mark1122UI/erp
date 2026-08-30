import mongoose from 'mongoose';
import { IGlobalSearchResults, IGlobalSearchResultItem } from './search.types.js';
import { Product, ProductBarcode } from '../catalog/product.model.js';
import { Party } from '../parties/party.model.js';
import { Sale } from '../sales/sale.model.js';
import { PurchaseOrder, SupplierBill } from '../purchasing/purchase.model.js';
import { Task } from '../tasks/task.model.js';

export const searchService = {
  async globalSearch(
    tenantId: string,
    queryText: string,
    limitPerType = 10
  ): Promise<IGlobalSearchResults> {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) {
      return {
        query: '',
        totalCount: 0,
        resultsByEntity: {
          products: [],
          customers: [],
          suppliers: [],
          sales: [],
          purchases: [],
          bills: [],
          tasks: [],
        },
        results: [],
      };
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const searchRegex = new RegExp(cleanQuery, 'i');
    const limit = Math.min(20, Math.max(1, limitPerType));

    // 1. Parallel Search Execution
    const [
      matchedBarcodes,
      rawProducts,
      rawParties,
      rawSales,
      rawPurchaseOrders,
      rawSupplierBills,
      rawTasks,
    ] = await Promise.all([
      // Check Barcodes
      ProductBarcode.find({ tenantId: tenantObjectId, barcode: cleanQuery }).lean(),
      // Products
      Product.find({
        tenantId: tenantObjectId,
        isActive: true,
        $or: [{ name: searchRegex }, { sku: searchRegex }],
      })
        .limit(limit)
        .lean(),
      // Customers & Suppliers
      Party.find({
        tenantId: tenantObjectId,
        isArchived: false,
        $or: [
          { displayName: searchRegex },
          { companyName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { taxNumber: searchRegex },
        ],
      })
        .limit(limit * 2)
        .lean(),
      // Sales & Invoices
      Sale.find({
        tenantId: tenantObjectId,
        $or: [
          { saleNumber: searchRegex },
          { customerName: searchRegex },
          { notes: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      // Purchase Orders
      PurchaseOrder.find({
        tenantId: tenantObjectId,
        $or: [
          { purchaseOrderNumber: searchRegex },
          { supplierName: searchRegex },
          { notes: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      // Supplier Bills
      SupplierBill.find({
        tenantId: tenantObjectId,
        $or: [
          { billNumber: searchRegex },
          { supplierInvoiceNumber: searchRegex },
          { supplierName: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      // Tasks
      Task.find({
        tenantId: tenantObjectId,
        $or: [
          { taskNumber: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    // Handle barcode-matched products if not already in product results
    let productResults = [...rawProducts];
    if (matchedBarcodes.length > 0) {
      const barcodeProdIds = matchedBarcodes.map((b) => b.productId);
      const barcodeProds = await Product.find({
        _id: { $in: barcodeProdIds },
        tenantId: tenantObjectId,
      }).lean();

      for (const bp of barcodeProds) {
        if (!productResults.some((p) => p._id.toString() === bp._id.toString())) {
          productResults.unshift(bp);
        }
      }
    }

    // 2. Format & Map Results by Entity Type
    const products: IGlobalSearchResultItem[] = productResults.slice(0, limit).map((p) => ({
      id: p._id.toString(),
      entityType: 'PRODUCT',
      title: p.name,
      subtitle: `SKU: ${p.sku} &bull; Price: $${Number(p.sellingPrice).toFixed(2)}`,
      badge: p.categoryName || 'Product',
      url: `/products/${p._id}`,
      metadata: { sku: p.sku, sellingPrice: p.sellingPrice },
    }));

    const customers: IGlobalSearchResultItem[] = rawParties
      .filter((p) => p.roles.includes('CUSTOMER'))
      .slice(0, limit)
      .map((c) => ({
        id: c._id.toString(),
        entityType: 'CUSTOMER',
        title: c.displayName,
        subtitle: `${c.email || c.phone || 'Customer'} &bull; Balance: $${Number(c.customerDetails?.currentBalance || 0).toFixed(2)}`,
        badge: 'Customer',
        url: `/customers/${c._id}`,
      }));

    const suppliers: IGlobalSearchResultItem[] = rawParties
      .filter((p) => p.roles.includes('SUPPLIER'))
      .slice(0, limit)
      .map((s) => ({
        id: s._id.toString(),
        entityType: 'SUPPLIER',
        title: s.displayName,
        subtitle: `${s.email || s.phone || 'Supplier'} &bull; AP Balance: $${Number(s.supplierDetails?.currentBalance || 0).toFixed(2)}`,
        badge: 'Supplier',
        url: `/suppliers/${s._id}`,
      }));

    const sales: IGlobalSearchResultItem[] = rawSales.map((s) => ({
      id: s._id.toString(),
      entityType: s.docType === 'QUOTE' ? 'SALE' : 'INVOICE',
      title: `${s.saleNumber} - ${s.customerName}`,
      subtitle: `Total: $${Number(s.grandTotal).toFixed(2)} &bull; Paid: $${Number(s.paidAmount).toFixed(2)}`,
      badge: s.status,
      date: new Date(s.createdAt).toISOString().split('T')[0],
      url: `/sales/${s._id}`,
    }));

    const purchases: IGlobalSearchResultItem[] = rawPurchaseOrders.map((po) => ({
      id: po._id.toString(),
      entityType: 'PURCHASE_ORDER',
      title: `${po.purchaseOrderNumber} - ${po.supplierName}`,
      subtitle: `Total: $${Number(po.grandTotal).toFixed(2)} &bull; Status: ${po.status}`,
      badge: po.status,
      date: new Date(po.orderDate).toISOString().split('T')[0],
      url: `/purchases/orders/${po._id}`,
    }));

    const bills: IGlobalSearchResultItem[] = rawSupplierBills.map((b) => ({
      id: b._id.toString(),
      entityType: 'SUPPLIER_BILL',
      title: `${b.billNumber} - ${b.supplierName}`,
      subtitle: `Due: $${Number(b.dueAmount).toFixed(2)} &bull; Total: $${Number(b.totalAmount).toFixed(2)}`,
      badge: b.status,
      date: new Date(b.createdAt).toISOString().split('T')[0],
      url: `/purchases/bills/${b._id}`,
    }));

    const tasks: IGlobalSearchResultItem[] = rawTasks.map((t) => ({
      id: t._id.toString(),
      entityType: 'TASK',
      title: `${t.taskNumber}: ${t.title}`,
      subtitle: `Priority: ${t.priority} &bull; Due: ${t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'No due date'}`,
      badge: t.status,
      url: `/tasks/${t._id}`,
    }));

    const flatResults: IGlobalSearchResultItem[] = [
      ...products,
      ...customers,
      ...suppliers,
      ...sales,
      ...purchases,
      ...bills,
      ...tasks,
    ];

    return {
      query: cleanQuery,
      totalCount: flatResults.length,
      resultsByEntity: {
        products,
        customers,
        suppliers,
        sales,
        purchases,
        bills,
        tasks,
      },
      results: flatResults,
    };
  },
};
