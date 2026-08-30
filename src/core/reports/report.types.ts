export interface ReportDateFilter {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  page?: number;
  limit?: number;
}

export interface ISalesSummaryReport {
  todaySales: number;
  todayOrdersCount: number;
  yesterdaySales: number;
  salesGrowthPercent: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalTax: number;
}

export interface ISalesByDateItem {
  date: string;
  orderCount: number;
  grossSales: number;
  discountTotal: number;
  taxTotal: number;
  netSales: number;
}

export interface ISalesByProductItem {
  productId: string;
  name: string;
  sku: string;
  unitsSold: number;
  totalRevenue: number;
  estimatedCost: number;
  estimatedGrossProfit: number;
}

export interface ISalesByCategoryItem {
  categoryName: string;
  unitsSold: number;
  totalRevenue: number;
  sharePercent: number;
}

export interface ISalesByEmployeeItem {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  ordersCount: number;
  totalSales: number;
}

export interface IPaymentMethodSummaryItem {
  paymentMethod: string;
  transactionCount: number;
  totalAmount: number;
  sharePercent: number;
}

export interface IInventoryStockReportItem {
  productId: string;
  name: string;
  sku: string;
  categoryName?: string;
  locationName: string;
  quantityOnHand: number;
  reorderPoint: number;
  unitCost: number;
  sellingPrice: number;
  stockCostValue: number;
  stockRetailValue: number;
}

export interface IInventoryValuationReport {
  totalItemsTracked: number;
  totalUnitsOnHand: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  potentialMarginValue: number;
  potentialMarginPercent: number;
}

export interface IPurchasesBySupplierItem {
  supplierId: string;
  supplierName: string;
  poCount: number;
  totalSpend: number;
  totalPaid: number;
  totalDue: number;
}

export interface IFinancialReportSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  customerReceivables: number;
  supplierPayables: number;
}
