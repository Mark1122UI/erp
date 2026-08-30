import mongoose from 'mongoose';
import {
  ReportDateFilter,
  ISalesSummaryReport,
  ISalesByDateItem,
  ISalesByProductItem,
  ISalesByCategoryItem,
  ISalesByEmployeeItem,
  IPaymentMethodSummaryItem,
  IInventoryStockReportItem,
  IInventoryValuationReport,
  IPurchasesBySupplierItem,
  IFinancialReportSummary,
} from './report.types.js';
import { Sale } from '../sales/sale.model.js';
import { Product } from '../catalog/product.model.js';
import { InventoryItem, InventoryTransaction, StockAdjustment } from '../inventory/inventory.model.js';
import { PurchaseOrder, SupplierBill } from '../purchasing/purchase.model.js';
import { Expense } from '../money/money.model.js';
import { Party } from '../parties/party.model.js';
import { Money } from '../common/money.js';

export const reportService = {
  // Helper: Build date query
  buildDateQuery(options: ReportDateFilter, dateField = 'createdAt') {
    const filter: any = {};
    if (options.startDate || options.endDate) {
      filter[dateField] = {};
      if (options.startDate) {
        filter[dateField].$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        filter[dateField].$lte = end;
      }
    }
    return filter;
  },

  // -------------------------------------------------------------
  // 1. SALES REPORTS
  // -------------------------------------------------------------
  async getSalesSummary(tenantId: string, options: ReportDateFilter = {}): Promise<ISalesSummaryReport> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    // Today vs Yesterday
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const [todayAgg, yesterdayAgg, periodAgg] = await Promise.all([
      Sale.aggregate([
        { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        {
          $match: {
            tenantId: tenantObjectId,
            docType: { $ne: 'QUOTE' },
            createdAt: { $gte: startOfYesterday, $lt: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalDiscount: { $sum: '$discountTotal' },
            totalTax: { $sum: '$taxTotal' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const todaySales = todayAgg[0]?.total || 0;
    const todayOrdersCount = todayAgg[0]?.count || 0;
    const yesterdaySales = yesterdayAgg[0]?.total || 0;

    let salesGrowthPercent = 0;
    if (yesterdaySales > 0) {
      salesGrowthPercent = Number((((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(2));
    }

    const totalRevenue = periodAgg[0]?.totalRevenue || 0;
    const totalOrders = periodAgg[0]?.totalOrders || 0;
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;
    const totalDiscount = periodAgg[0]?.totalDiscount || 0;
    const totalTax = periodAgg[0]?.totalTax || 0;

    return {
      todaySales: Number(todaySales.toFixed(2)),
      todayOrdersCount,
      yesterdaySales: Number(yesterdaySales.toFixed(2)),
      salesGrowthPercent,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue,
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
    };
  },

  async getSalesByDate(tenantId: string, options: ReportDateFilter = {}): Promise<ISalesByDateItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    const agg = await Sale.aggregate([
      { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orderCount: { $sum: 1 },
          grossSales: { $sum: '$subtotal' },
          discountTotal: { $sum: '$discountTotal' },
          taxTotal: { $sum: '$taxTotal' },
          netSales: { $sum: '$grandTotal' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return agg.map((r) => ({
      date: r._id,
      orderCount: r.orderCount,
      grossSales: Number(r.grossSales.toFixed(2)),
      discountTotal: Number(r.discountTotal.toFixed(2)),
      taxTotal: Number(r.taxTotal.toFixed(2)),
      netSales: Number(r.netSales.toFixed(2)),
    }));
  },

  async getSalesByProduct(tenantId: string, options: ReportDateFilter = {}): Promise<ISalesByProductItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    const agg = await Sale.aggregate([
      { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          unitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
          estimatedCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return agg.map((r) => {
      const revenue = Number(r.totalRevenue.toFixed(2));
      const cost = Number(r.estimatedCost.toFixed(2));
      const grossProfit = Number((revenue - cost).toFixed(2));
      return {
        productId: r._id?.toString() || '',
        name: r.name,
        sku: r.sku,
        unitsSold: r.unitsSold,
        totalRevenue: revenue,
        estimatedCost: cost,
        estimatedGrossProfit: grossProfit,
      };
    });
  },

  async getSalesByCategory(tenantId: string, options: ReportDateFilter = {}): Promise<ISalesByCategoryItem[]> {
    const productSales = await this.getSalesByProduct(tenantId, options);
    const productIds = productSales.map((p) => p.productId).filter((id) => mongoose.Types.ObjectId.isValid(id));

    const products = await Product.find({
      _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    const prodCategoryMap = new Map<string, string>();
    for (const p of products) {
      prodCategoryMap.set(p._id.toString(), p.categoryName || 'Uncategorized');
    }

    const categoryMap = new Map<string, { units: number; revenue: number }>();
    let totalRevenueSum = 0;

    for (const item of productSales) {
      const category = prodCategoryMap.get(item.productId) || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { units: 0, revenue: 0 });
      }
      const cat = categoryMap.get(category)!;
      cat.units += item.unitsSold;
      cat.revenue += item.totalRevenue;
      totalRevenueSum += item.totalRevenue;
    }

    const results: ISalesByCategoryItem[] = [];
    for (const [categoryName, data] of categoryMap.entries()) {
      const sharePercent = totalRevenueSum > 0 ? Number(((data.revenue / totalRevenueSum) * 100).toFixed(2)) : 0;
      results.push({
        categoryName,
        unitsSold: data.units,
        totalRevenue: Number(data.revenue.toFixed(2)),
        sharePercent,
      });
    }

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  },

  async getSalesByEmployee(tenantId: string, options: ReportDateFilter = {}): Promise<ISalesByEmployeeItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    const agg = await Sale.aggregate([
      { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
      {
        $group: {
          _id: '$createdBy',
          ordersCount: { $sum: 1 },
          totalSales: { $sum: '$grandTotal' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $sort: { totalSales: -1 } },
    ]);

    return agg.map((r) => ({
      employeeId: r._id?.toString() || '',
      employeeName: r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : 'Unknown Employee',
      employeeEmail: r.user?.email || 'N/A',
      ordersCount: r.ordersCount,
      totalSales: Number(r.totalSales.toFixed(2)),
    }));
  },

  async getPaymentMethodSummary(tenantId: string, options: ReportDateFilter = {}): Promise<IPaymentMethodSummaryItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    const agg = await Sale.aggregate([
      { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.paymentMethod',
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$payments.amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalSum = agg.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return agg.map((r) => ({
      paymentMethod: r._id,
      transactionCount: r.transactionCount,
      totalAmount: Number(r.totalAmount.toFixed(2)),
      sharePercent: totalSum > 0 ? Number(((r.totalAmount / totalSum) * 100).toFixed(2)) : 0,
    }));
  },

  // -------------------------------------------------------------
  // 2. INVENTORY REPORTS
  // -------------------------------------------------------------
  async getCurrentStock(tenantId: string, options: { locationId?: string; lowStockOnly?: boolean } = {}): Promise<IInventoryStockReportItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const query: any = { tenantId: tenantObjectId };

    if (options.locationId && mongoose.Types.ObjectId.isValid(options.locationId)) {
      query.locationId = new mongoose.Types.ObjectId(options.locationId);
    }

    const items = await InventoryItem.find(query)
      .populate('productId')
      .populate('locationId')
      .lean();

    const results: IInventoryStockReportItem[] = [];

    for (const it of items) {
      const p = it.productId as any;
      const loc = it.locationId as any;
      if (!p) continue;

      const qty = it.quantityOnHand || 0;
      const reorder = it.reorderPoint || 10;

      if (options.lowStockOnly && qty > reorder) {
        continue;
      }

      const cost = p.costPrice || 0;
      const price = p.sellingPrice || 0;

      results.push({
        productId: p._id.toString(),
        name: p.name,
        sku: p.sku,
        categoryName: p.categoryName,
        locationName: loc?.name || 'Main Location',
        quantityOnHand: qty,
        reorderPoint: reorder,
        unitCost: cost,
        sellingPrice: price,
        stockCostValue: Number((qty * cost).toFixed(2)),
        stockRetailValue: Number((qty * price).toFixed(2)),
      });
    }

    return results.sort((a, b) => a.quantityOnHand - b.quantityOnHand);
  },

  async getStockValuation(tenantId: string): Promise<IInventoryValuationReport> {
    const stockList = await this.getCurrentStock(tenantId);

    let totalUnitsOnHand = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;

    for (const item of stockList) {
      totalUnitsOnHand += item.quantityOnHand;
      totalCostValuation += item.stockCostValue;
      totalRetailValuation += item.stockRetailValue;
    }

    const potentialMarginValue = Number((totalRetailValuation - totalCostValuation).toFixed(2));
    const potentialMarginPercent =
      totalRetailValuation > 0
        ? Number(((potentialMarginValue / totalRetailValuation) * 100).toFixed(2))
        : 0;

    return {
      totalItemsTracked: stockList.length,
      totalUnitsOnHand,
      totalCostValuation: Number(totalCostValuation.toFixed(2)),
      totalRetailValuation: Number(totalRetailValuation.toFixed(2)),
      potentialMarginValue,
      potentialMarginPercent,
    };
  },

  async getStockMovements(tenantId: string, options: ReportDateFilter = {}): Promise<any[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);
    const limit = Math.min(200, options.limit || 100);

    return await InventoryTransaction.find({
      tenantId: tenantObjectId,
      ...dateQuery,
    })
      .populate('productId', 'name sku')
      .populate('locationId', 'name')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async getStockAdjustments(tenantId: string, options: ReportDateFilter = {}): Promise<any[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    return await StockAdjustment.find({
      tenantId: tenantObjectId,
      ...dateQuery,
    })
      .populate('locationId', 'name')
      .populate('adjustedBy', 'firstName lastName email')
      .populate('authorizedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  },

  // -------------------------------------------------------------
  // 3. PURCHASES REPORTS
  // -------------------------------------------------------------
  async getPurchasesBySupplier(tenantId: string, options: ReportDateFilter = {}): Promise<IPurchasesBySupplierItem[]> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options, 'orderDate');

    const poAgg = await PurchaseOrder.aggregate([
      { $match: { tenantId: tenantObjectId, ...dateQuery } },
      {
        $group: {
          _id: '$supplierId',
          supplierName: { $first: '$supplierName' },
          poCount: { $sum: 1 },
          totalSpend: { $sum: '$grandTotal' },
        },
      },
    ]);

    const billAgg = await SupplierBill.aggregate([
      { $match: { tenantId: tenantObjectId } },
      {
        $group: {
          _id: '$supplierId',
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
        },
      },
    ]);

    const billMap = new Map<string, { totalPaid: number; totalDue: number }>();
    for (const b of billAgg) {
      billMap.set(b._id?.toString() || '', {
        totalPaid: Number(b.totalPaid.toFixed(2)),
        totalDue: Number(b.totalDue.toFixed(2)),
      });
    }

    return poAgg.map((po) => {
      const suppIdStr = po._id?.toString() || '';
      const bInfo = billMap.get(suppIdStr) || { totalPaid: 0, totalDue: 0 };
      return {
        supplierId: suppIdStr,
        supplierName: po.supplierName || 'Supplier',
        poCount: po.poCount,
        totalSpend: Number(po.totalSpend.toFixed(2)),
        totalPaid: bInfo.totalPaid,
        totalDue: bInfo.totalDue,
      };
    });
  },

  // -------------------------------------------------------------
  // 4. FINANCIAL SUMMARY REPORT (MONEY)
  // -------------------------------------------------------------
  async getFinancialSummary(tenantId: string, options: ReportDateFilter = {}): Promise<IFinancialReportSummary> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const dateQuery = this.buildDateQuery(options);

    const [salesAgg, expenseAgg, customers, suppliers] = await Promise.all([
      Sale.aggregate([
        { $match: { tenantId: tenantObjectId, docType: { $ne: 'QUOTE' }, ...dateQuery } },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$items.lineTotal' },
            cogs: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { tenantId: tenantObjectId, ...dateQuery } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Party.find({ tenantId: tenantObjectId, roles: 'CUSTOMER' }).lean(),
      Party.find({ tenantId: tenantObjectId, roles: 'SUPPLIER' }).lean(),
    ]);

    const revenue = salesAgg[0]?.revenue || 0;
    const cogs = salesAgg[0]?.cogs || 0;
    const grossProfit = revenue - cogs;
    const grossMarginPercent = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(2)) : 0;

    const operatingExpenses = expenseAgg[0]?.total || 0;
    const netProfit = grossProfit - operatingExpenses;
    const netMarginPercent = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(2)) : 0;

    const customerReceivables = customers.reduce(
      (acc: number, c: any) => acc + (c.customerDetails?.currentBalance || 0),
      0
    );
    const supplierPayables = suppliers.reduce(
      (acc: number, s: any) => acc + (s.supplierDetails?.currentBalance || 0),
      0
    );

    return {
      revenue: Number(revenue.toFixed(2)),
      costOfGoodsSold: Number(cogs.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossMarginPercent,
      operatingExpenses: Number(operatingExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      netMarginPercent,
      customerReceivables: Number(customerReceivables.toFixed(2)),
      supplierPayables: Number(supplierPayables.toFixed(2)),
    };
  },

  // -------------------------------------------------------------
  // 5. CSV EXPORT SERIALIZER
  // -------------------------------------------------------------
  convertToCsv(rows: Record<string, any>[]): string {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const values = headers.map((h) => {
        const val = r[h];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvLines.push(values.join(','));
    }

    return csvLines.join('\n');
  },
};
