import mongoose from 'mongoose';
import { Expense, IExpense, DEFAULT_EXPENSE_CATEGORIES } from './money.model.js';
import { Sale } from '../sales/sale.model.js';
import { SupplierBill } from '../purchasing/purchase.model.js';
import { Party } from '../parties/party.model.js';
import { InventoryItem } from '../inventory/inventory.model.js';
import { Tenant } from '../tenancy/tenant.model.js';
import { Money } from '../common/money.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';
import { PaymentMethod } from '../sales/sale.model.js';

export interface CreateExpenseDTO {
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate?: Date;
  reference?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface ListExpensesFilter {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export const moneyService = {
  // -------------------------------------------------------------
  // 1. CREATE EXPENSE
  // -------------------------------------------------------------
  async createExpense(
    tenantId: string,
    data: CreateExpenseDTO,
    userId: string
  ): Promise<IExpense> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestError('Expense amount must be greater than zero');
    }

    const count = await Expense.countDocuments({ tenantId: tenantObjectId });
    const expenseNumber = `EXP-${String(count + 1).padStart(5, '0')}`;

    const expense = await Expense.create({
      tenantId: tenantObjectId,
      expenseNumber,
      category: data.category || 'OTHER',
      amount,
      currency: tenant.currency || 'USD',
      paymentMethod: data.paymentMethod || 'CASH',
      expenseDate: data.expenseDate || new Date(),
      reference: data.reference,
      notes: data.notes,
      attachmentUrl: data.attachmentUrl,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Expense',
      entityId: expense.id,
      metadata: { expenseNumber, category: expense.category, amount },
    });

    return expense;
  },

  // -------------------------------------------------------------
  // 2. LIST EXPENSES
  // -------------------------------------------------------------
  async listExpenses(tenantId: string, filter: ListExpensesFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.startDate || filter.endDate) {
      query.expenseDate = {};
      if (filter.startDate) query.expenseDate.$gte = new Date(filter.startDate);
      if (filter.endDate) query.expenseDate.$lte = new Date(filter.endDate);
    }

    if (filter.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { expenseNumber: searchRegex },
        { category: searchRegex },
        { notes: searchRegex },
        { reference: searchRegex },
      ];
    }

    const [expenses, totalRecords] = await Promise.all([
      Expense.find(query)
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Expense.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      expenses,
      categories: DEFAULT_EXPENSE_CATEGORIES,
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
  // 3. MONEY & CASH POSITION SUMMARY
  // -------------------------------------------------------------
  async getMoneySummary(tenantId: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    const currency = tenant?.currency || 'USD';

    // 1. Sales & Revenue metrics (excluding full returns)
    const sales = await Sale.find({
      tenantId: tenantObjectId,
      status: { $ne: 'DRAFT' },
    }).lean();

    let totalSalesRevenueCents = 0;
    let totalCostOfGoodsSoldCents = 0;
    let totalPaymentsReceivedCents = 0;

    for (const s of sales) {
      if (s.status !== 'REFUNDED') {
        totalSalesRevenueCents += Money.toCents(s.grandTotal);
        for (const item of s.items) {
          const itemCost = Money.multiply(item.costPrice || 0, item.quantity);
          totalCostOfGoodsSoldCents += Money.toCents(itemCost);
        }
      }
      totalPaymentsReceivedCents += Money.toCents(s.paidAmount);
    }

    // 2. Expenses metrics
    const expenses = await Expense.find({ tenantId: tenantObjectId }).lean();
    let totalExpensesCents = 0;
    for (const exp of expenses) {
      totalExpensesCents += Money.toCents(exp.amount);
    }

    // 3. Supplier Bills & Supplier Payments Made
    const bills = await SupplierBill.find({ tenantId: tenantObjectId }).lean();
    let totalSupplierPaymentsMadeCents = 0;
    for (const b of bills) {
      totalSupplierPaymentsMadeCents += Money.toCents(b.paidAmount);
    }

    // 4. Total Cash Outflow = Supplier Bill Payments + Direct Expenses
    const totalPaymentsMadeCents = totalSupplierPaymentsMadeCents + totalExpensesCents;

    // 5. Customer Balances (Accounts Receivable) & Supplier Balances (Accounts Payable)
    const parties = await Party.find({
      tenantId: tenantObjectId,
      isArchived: false,
    }).lean();

    let customerBalancesDueCents = 0;
    let supplierBalancesDueCents = 0;

    for (const p of parties) {
      if (p.customerDetails?.currentBalance) {
        customerBalancesDueCents += Money.toCents(p.customerDetails.currentBalance);
      }
      if (p.supplierDetails?.currentBalance) {
        supplierBalancesDueCents += Money.toCents(p.supplierDetails.currentBalance);
      }
    }

    // 6. Net Profit Estimate & Cash Position
    const totalSalesRevenue = Money.fromCents(totalSalesRevenueCents);
    const totalCostOfGoodsSold = Money.fromCents(totalCostOfGoodsSoldCents);
    const totalExpenses = Money.fromCents(totalExpensesCents);
    const totalPaymentsReceived = Money.fromCents(totalPaymentsReceivedCents);
    const totalPaymentsMade = Money.fromCents(totalPaymentsMadeCents);
    const customerBalancesDue = Money.fromCents(customerBalancesDueCents);
    const supplierBalancesDue = Money.fromCents(supplierBalancesDueCents);

    const grossProfitCents = totalSalesRevenueCents - totalCostOfGoodsSoldCents;
    const estimatedProfit = Money.fromCents(grossProfitCents - totalExpensesCents);
    const netCashPosition = Money.fromCents(totalPaymentsReceivedCents - totalPaymentsMadeCents);

    return {
      currency,
      sales: {
        totalRevenue: totalSalesRevenue,
        costOfGoodsSold: totalCostOfGoodsSold,
        grossProfit: Money.fromCents(grossProfitCents),
      },
      expenses: {
        totalExpenses,
      },
      cashFlow: {
        paymentsReceived: totalPaymentsReceived,
        paymentsMade: totalPaymentsMade,
        netCashPosition,
      },
      receivablesAndPayables: {
        customerBalancesDue,
        supplierBalancesDue,
      },
      profitability: {
        estimatedProfit,
      },
    };
  },

  // -------------------------------------------------------------
  // 4. ROLE-AWARE DASHBOARD METRICS
  // -------------------------------------------------------------
  async getDashboard(tenantId: string, role?: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    const currency = tenant?.currency || 'USD';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales Today & This Month
    const salesTodayDocs = await Sale.find({
      tenantId: tenantObjectId,
      createdAt: { $gte: startOfToday },
      status: { $ne: 'DRAFT' },
    }).lean();

    const salesThisMonthDocs = await Sale.find({
      tenantId: tenantObjectId,
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'DRAFT' },
    }).lean();

    let salesTodayCents = 0;
    for (const s of salesTodayDocs) {
      if (s.status !== 'REFUNDED') salesTodayCents += Money.toCents(s.grandTotal);
    }

    let salesThisMonthCents = 0;
    for (const s of salesThisMonthDocs) {
      if (s.status !== 'REFUNDED') salesThisMonthCents += Money.toCents(s.grandTotal);
    }

    // Expenses This Month
    const expensesThisMonthDocs = await Expense.find({
      tenantId: tenantObjectId,
      expenseDate: { $gte: startOfMonth },
    }).lean();

    let expensesThisMonthCents = 0;
    for (const exp of expensesThisMonthDocs) {
      expensesThisMonthCents += Money.toCents(exp.amount);
    }

    // Global Money Metrics
    const moneySummary = await this.getMoneySummary(tenantId);

    // Low Stock Alert
    const lowStockItems = await InventoryItem.find({
      tenantId: tenantObjectId,
      $expr: { $lte: ['$quantityOnHand', '$reorderPoint'] },
    })
      .populate('productId', 'name sku sellingPrice')
      .populate('locationId', 'name code')
      .limit(10)
      .lean();

    // Recent Financial Transactions (Last 8)
    const [recentSales, recentExpenses] = await Promise.all([
      Sale.find({ tenantId: tenantObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Expense.find({ tenantId: tenantObjectId })
        .sort({ expenseDate: -1 })
        .limit(5)
        .lean(),
    ]);

    const recentTransactions = [
      ...recentSales.map((s) => ({
        id: s._id,
        type: 'SALE',
        reference: s.saleNumber,
        title: `Sale to ${s.customerName}`,
        amount: s.grandTotal,
        direction: 'INFLOW',
        date: s.createdAt,
        status: s.status,
      })),
      ...recentExpenses.map((e) => ({
        id: e._id,
        type: 'EXPENSE',
        reference: e.expenseNumber,
        title: `Expense: ${e.category}`,
        amount: e.amount,
        direction: 'OUTFLOW',
        date: e.expenseDate,
        status: 'PAID',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    return {
      currency,
      role: role || 'Owner',
      metrics: {
        salesToday: Money.fromCents(salesTodayCents),
        salesThisMonth: Money.fromCents(salesThisMonthCents),
        expensesThisMonth: Money.fromCents(expensesThisMonthCents),
        estimatedProfit: moneySummary.profitability.estimatedProfit,
        outstandingCustomerPayments: moneySummary.receivablesAndPayables.customerBalancesDue,
        outstandingSupplierPayments: moneySummary.receivablesAndPayables.supplierBalancesDue,
        cashPosition: moneySummary.cashFlow.netCashPosition,
        lowStockCount: lowStockItems.length,
      },
      lowStockItems: lowStockItems.map((it) => ({
        id: it._id,
        name: (it.productId as any)?.name || 'Unknown Product',
        sku: (it.productId as any)?.sku || 'NO-SKU',
        quantityOnHand: it.quantityOnHand,
        reorderPoint: it.reorderPoint,
        locationName: (it.locationId as any)?.name || 'Main Location',
      })),
      recentTransactions,
    };
  },
};
