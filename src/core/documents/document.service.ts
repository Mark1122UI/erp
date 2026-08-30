import mongoose from 'mongoose';
import {
  DocumentType,
  IBusinessDocument,
  IDocumentIssuerInfo,
  IDocumentPartyInfo,
  IDocumentLineItem,
  IStatementTransaction,
} from './document.types.js';
import { Tenant } from '../tenancy/tenant.model.js';
import { Sale, SalesReturn, ISaleLineItem, ISalePayment } from '../sales/sale.model.js';
import { PurchaseOrder, SupplierBill, IPurchaseOrderItem, ISupplierBillPayment } from '../purchasing/purchase.model.js';
import { Party } from '../parties/party.model.js';
import { StockTransfer } from '../inventory/inventory.model.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';

export const documentService = {
  // -------------------------------------------------------------
  // 1. EXTRACT TENANT ISSUER BRANDING
  // -------------------------------------------------------------
  async getIssuerInfo(tenantId: string): Promise<IDocumentIssuerInfo> {
    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) throw new NotFoundError('Business / Tenant not found');

    return {
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      taxNumber: tenant.settings?.taxNumber,
      currency: tenant.currency || 'USD',
      receiptHeader: tenant.settings?.receiptHeader,
      receiptFooter: tenant.settings?.receiptFooter,
    };
  },

  // -------------------------------------------------------------
  // 2. DISPATCHER: GENERATE NORMALIZED BUSINESS DOCUMENT
  // -------------------------------------------------------------
  async generateDocument(
    tenantId: string,
    type: DocumentType,
    entityId: string,
    options?: { startDate?: string; endDate?: string }
  ): Promise<IBusinessDocument> {
    switch (type) {
      case 'INVOICE':
        return await this.generateInvoice(tenantId, entityId);
      case 'RECEIPT':
        return await this.generateReceipt(tenantId, entityId);
      case 'QUOTE':
        return await this.generateQuote(tenantId, entityId);
      case 'PURCHASE_ORDER':
        return await this.generatePurchaseOrder(tenantId, entityId);
      case 'SUPPLIER_BILL':
        return await this.generateSupplierBill(tenantId, entityId);
      case 'DELIVERY_NOTE':
        return await this.generateDeliveryNote(tenantId, entityId);
      case 'CREDIT_NOTE':
        return await this.generateCreditNote(tenantId, entityId);
      case 'CUSTOMER_STATEMENT':
        return await this.generateCustomerStatement(tenantId, entityId, options);
      default:
        throw new BadRequestError(`Unsupported document type: '${type}'`);
    }
  },

  // -------------------------------------------------------------
  // 3. INVOICE GENERATION
  // -------------------------------------------------------------
  async generateInvoice(tenantId: string, saleId: string): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(saleId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('customerId').lean();

    if (!sale) throw new NotFoundError('Sale invoice not found');

    const party = sale.customerId as any;
    const recipient: IDocumentPartyInfo = {
      name: sale.customerName || party?.displayName || 'Valued Customer',
      type: party?.type || 'INDIVIDUAL',
      address: party?.billingAddress || party?.shippingAddress,
      phone: party?.phone || party?.mobile,
      email: party?.email,
      taxNumber: party?.taxNumber,
      balanceDue: party?.customerDetails?.currentBalance,
    };

    const items: IDocumentLineItem[] = sale.items.map((it: ISaleLineItem, idx: number) => ({
      itemNumber: idx + 1,
      name: it.name,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discountAmount: it.discountAmount,
      taxRatePercent: it.taxRatePercent,
      taxAmount: it.taxAmount,
      lineTotal: it.lineTotal,
    }));

    return {
      documentType: 'INVOICE',
      title: 'TAX INVOICE',
      documentNumber: sale.saleNumber,
      date: new Date(sale.createdAt).toISOString().split('T')[0],
      status: sale.status,
      issuer,
      recipient,
      items,
      totals: {
        subtotal: sale.subtotal,
        discountTotal: sale.discountTotal,
        taxTotal: sale.taxTotal,
        grandTotal: sale.grandTotal,
        amountPaid: sale.paidAmount,
        balanceDue: sale.dueAmount,
        currency: sale.currency || issuer.currency,
      },
      payments: sale.payments.map((p: ISalePayment) => ({
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        reference: p.reference,
        date: new Date(p.createdAt || sale.createdAt).toISOString().split('T')[0],
        changeAmount: p.changeAmount,
      })),
      notes: sale.notes,
      terms: 'Payment due within 30 days of invoice date. Thank you for your business.',
    };
  },

  // -------------------------------------------------------------
  // 4. RECEIPT GENERATION
  // -------------------------------------------------------------
  async generateReceipt(tenantId: string, saleId: string): Promise<IBusinessDocument> {
    const doc = await this.generateInvoice(tenantId, saleId);
    doc.documentType = 'RECEIPT';
    doc.title = 'PAYMENT RECEIPT';
    return doc;
  },

  // -------------------------------------------------------------
  // 5. QUOTE GENERATION
  // -------------------------------------------------------------
  async generateQuote(tenantId: string, saleId: string): Promise<IBusinessDocument> {
    const doc = await this.generateInvoice(tenantId, saleId);
    doc.documentType = 'QUOTE';
    doc.title = 'PRICE QUOTATION';
    doc.terms = 'This quotation is valid for 30 days from date of issue.';
    return doc;
  },

  // -------------------------------------------------------------
  // 6. PURCHASE ORDER GENERATION
  // -------------------------------------------------------------
  async generatePurchaseOrder(tenantId: string, poId: string): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    const po = await PurchaseOrder.findOne({
      _id: new mongoose.Types.ObjectId(poId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('supplierId').lean();

    if (!po) throw new NotFoundError('Purchase order not found');

    const supplier = po.supplierId as any;
    const recipient: IDocumentPartyInfo = {
      name: po.supplierName || supplier?.displayName || 'Supplier',
      type: 'SUPPLIER',
      address: supplier?.billingAddress || supplier?.shippingAddress,
      phone: supplier?.phone || supplier?.mobile,
      email: supplier?.email,
      taxNumber: supplier?.taxNumber,
    };

    const items: IDocumentLineItem[] = po.items.map((it: IPurchaseOrderItem, idx: number) => ({
      itemNumber: idx + 1,
      name: it.name,
      sku: it.sku,
      quantity: it.orderedQuantity,
      unitPrice: it.unitCost,
      discountAmount: 0,
      taxRatePercent: it.taxRatePercent,
      taxAmount: it.taxAmount,
      lineTotal: it.lineTotal,
    }));

    return {
      documentType: 'PURCHASE_ORDER',
      title: 'PURCHASE ORDER',
      documentNumber: po.purchaseOrderNumber,
      date: new Date(po.orderDate).toISOString().split('T')[0],
      dueDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString().split('T')[0] : undefined,
      status: po.status,
      issuer,
      recipient,
      items,
      totals: {
        subtotal: po.subtotal,
        discountTotal: 0,
        taxTotal: po.taxTotal,
        grandTotal: po.grandTotal,
        amountPaid: 0,
        balanceDue: po.grandTotal,
        currency: po.currency || issuer.currency,
      },
      notes: po.notes,
      terms: 'Please notify us immediately if you are unable to ship as specified.',
    };
  },

  // -------------------------------------------------------------
  // 7. SUPPLIER BILL GENERATION
  // -------------------------------------------------------------
  async generateSupplierBill(tenantId: string, billId: string): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    const bill = await SupplierBill.findOne({
      _id: new mongoose.Types.ObjectId(billId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('supplierId').lean();

    if (!bill) throw new NotFoundError('Supplier bill not found');

    const supplier = bill.supplierId as any;
    const recipient: IDocumentPartyInfo = {
      name: bill.supplierName || supplier?.displayName || 'Supplier',
      type: 'SUPPLIER',
      address: supplier?.billingAddress || supplier?.shippingAddress,
      phone: supplier?.phone,
      email: supplier?.email,
      taxNumber: supplier?.taxNumber,
    };

    return {
      documentType: 'SUPPLIER_BILL',
      title: 'SUPPLIER BILL',
      documentNumber: bill.billNumber,
      referenceNumber: bill.supplierInvoiceNumber,
      date: new Date(bill.createdAt).toISOString().split('T')[0],
      status: bill.status,
      issuer,
      recipient,
      items: [],
      totals: {
        subtotal: bill.totalAmount,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: bill.totalAmount,
        amountPaid: bill.paidAmount,
        balanceDue: bill.dueAmount,
        currency: bill.currency || issuer.currency,
      },
      payments: bill.payments.map((p: ISupplierBillPayment) => ({
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        reference: p.reference,
        date: new Date(p.paymentDate || p.createdAt).toISOString().split('T')[0],
      })),
      notes: bill.notes,
    };
  },

  // -------------------------------------------------------------
  // 8. DELIVERY NOTE / PACKING SLIP GENERATION
  // -------------------------------------------------------------
  async generateDeliveryNote(tenantId: string, entityId: string): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    
    // Check if entity is a Sale or a StockTransfer
    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(entityId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('customerId').lean();

    if (sale) {
      const party = sale.customerId as any;
      const recipient: IDocumentPartyInfo = {
        name: sale.customerName || party?.displayName || 'Customer',
        address: party?.billingAddress || party?.shippingAddress,
        phone: party?.phone || party?.mobile,
      };

      const items: IDocumentLineItem[] = sale.items.map((it: ISaleLineItem, idx: number) => ({
        itemNumber: idx + 1,
        name: it.name,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: 0,
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        lineTotal: 0,
      }));

      return {
        documentType: 'DELIVERY_NOTE',
        title: 'DELIVERY NOTE / PACKING SLIP',
        documentNumber: `DN-${sale.saleNumber}`,
        referenceNumber: sale.saleNumber,
        date: new Date(sale.createdAt).toISOString().split('T')[0],
        status: 'DISPATCHED',
        issuer,
        recipient,
        items,
        totals: {
          subtotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 0,
          amountPaid: 0,
          balanceDue: 0,
          currency: issuer.currency,
        },
        notes: 'Please verify all delivered goods upon arrival.',
        terms: 'Received in good condition. Signature: ______________________ Date: _________',
      };
    }

    // Otherwise check StockTransfer
    const transfer = await StockTransfer.findOne({
      _id: new mongoose.Types.ObjectId(entityId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('sourceLocationId destinationLocationId').lean();

    if (!transfer) throw new NotFoundError('Delivery record not found');

    const destLoc = transfer.destinationLocationId as any;
    const recipient: IDocumentPartyInfo = {
      name: destLoc?.name || 'Destination Branch',
      address: destLoc?.address,
    };

    const items: IDocumentLineItem[] = transfer.items.map((it: any, idx: number) => ({
      itemNumber: idx + 1,
      name: it.productId?.name || 'Transfer Item',
      sku: it.productId?.sku,
      quantity: it.quantity,
      unitPrice: 0,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      lineTotal: 0,
    }));

    return {
      documentType: 'DELIVERY_NOTE',
      title: 'INTER-BRANCH TRANSFER DELIVERY NOTE',
      documentNumber: `DN-${transfer.transferNumber}`,
      referenceNumber: transfer.transferNumber,
      date: new Date().toISOString().split('T')[0],
      status: transfer.status,
      issuer,
      recipient,
      items,
      totals: {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        amountPaid: 0,
        balanceDue: 0,
        currency: issuer.currency,
      },
      notes: transfer.notes,
      terms: 'Received by Store Manager: ______________________ Date: _________',
    };
  },

  // -------------------------------------------------------------
  // 9. CREDIT NOTE GENERATION
  // -------------------------------------------------------------
  async generateCreditNote(tenantId: string, returnId: string): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    const salesReturn = await SalesReturn.findOne({
      _id: new mongoose.Types.ObjectId(returnId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).populate('customerId originalSaleId').lean();

    if (!salesReturn) throw new NotFoundError('Sales return record not found');

    const party = salesReturn.customerId as any;
    const recipient: IDocumentPartyInfo = {
      name: salesReturn.customerName || party?.displayName || 'Customer',
      address: party?.billingAddress || party?.shippingAddress,
      phone: party?.phone,
      email: party?.email,
      taxNumber: party?.taxNumber,
    };

    const items: IDocumentLineItem[] = salesReturn.items.map((it: any, idx: number) => ({
      itemNumber: idx + 1,
      name: it.name,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      lineTotal: it.refundAmount,
    }));

    return {
      documentType: 'CREDIT_NOTE',
      title: 'CREDIT NOTE / REFUND ADVICE',
      documentNumber: salesReturn.returnNumber,
      date: new Date(salesReturn.createdAt).toISOString().split('T')[0],
      status: 'REFUNDED',
      issuer,
      recipient,
      items,
      totals: {
        subtotal: salesReturn.totalRefundAmount,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: salesReturn.totalRefundAmount,
        amountPaid: salesReturn.totalRefundAmount,
        balanceDue: 0,
        currency: issuer.currency,
      },
      notes: `Credit Note issued for returned goods. Reason: ${salesReturn.reason || 'Customer Return'}`,
    };
  },

  // -------------------------------------------------------------
  // 10. CUSTOMER STATEMENT OF ACCOUNT
  // -------------------------------------------------------------
  async generateCustomerStatement(
    tenantId: string,
    partyId: string,
    options?: { startDate?: string; endDate?: string }
  ): Promise<IBusinessDocument> {
    const issuer = await this.getIssuerInfo(tenantId);
    const party = await Party.findOne({
      _id: new mongoose.Types.ObjectId(partyId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    }).lean();

    if (!party) throw new NotFoundError('Customer / Party not found');

    const recipient: IDocumentPartyInfo = {
      name: party.displayName,
      type: party.type,
      address: party.billingAddress || party.shippingAddress,
      phone: party.phone || party.mobile,
      email: party.email,
      taxNumber: party.taxNumber,
      balanceDue: party.customerDetails?.currentBalance || 0,
    };

    // Build chronological ledger statement
    const rawTxList = party.transactions || [];
    let runningBalance = 0;
    const statementTransactions: IStatementTransaction[] = [];

    let totalDebit = 0;
    let totalCredit = 0;

    for (const tx of rawTxList) {
      const isDebit = tx.type === 'INVOICE' || tx.type === 'PURCHASE';
      const debit = isDebit ? tx.amount : 0;
      const credit = !isDebit ? tx.amount : 0;
      
      runningBalance += (debit - credit);
      totalDebit += debit;
      totalCredit += credit;

      statementTransactions.push({
        date: new Date(tx.date).toISOString().split('T')[0],
        type: tx.type,
        reference: tx.reference || tx.transactionNumber,
        description: tx.description || `${tx.type} ${tx.transactionNumber}`,
        debit,
        credit,
        balance: Number(runningBalance.toFixed(2)),
      });
    }

    return {
      documentType: 'CUSTOMER_STATEMENT',
      title: 'STATEMENT OF ACCOUNT',
      documentNumber: `STM-${party.displayName.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      issuer,
      recipient,
      items: [],
      statementTransactions,
      totals: {
        subtotal: totalDebit,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: totalDebit,
        amountPaid: totalCredit,
        balanceDue: Number(runningBalance.toFixed(2)),
        currency: issuer.currency,
      },
      notes: 'Statement reflects all invoiced debits and credited payments.',
      terms: 'Please make payment to the banking details listed on your invoices.',
    };
  },

  // -------------------------------------------------------------
  // 11. UNIVERSAL RESPONSIVE & PRINTABLE HTML TEMPLATE ENGINE
  // -------------------------------------------------------------
  renderDocumentHtml(doc: IBusinessDocument): string {
    const cur = doc.totals.currency || '$';

    const renderAddress = (addr?: any) => {
      if (!addr) return '';
      const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
      return parts.join(', ');
    };

    const statusBadgeClass =
      doc.status === 'PAID' || doc.status === 'COMPLETED'
        ? 'badge-success'
        : doc.status === 'PARTIALLY_PAID' || doc.status === 'IN_PROGRESS'
        ? 'badge-warning'
        : 'badge-neutral';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} - ${doc.documentNumber}</title>
  <style>
    :root {
      --primary: #2563eb;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg: #ffffff;
      --surface: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      background: #f1f5f9;
      padding: 24px 12px;
      font-size: 14px;
      line-height: 1.5;
    }
    .doc-container {
      max-width: 820px;
      margin: 0 auto;
      background: var(--bg);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 40px;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 20px;
    }
    .issuer-logo {
      max-height: 60px;
      max-width: 180px;
      margin-bottom: 8px;
    }
    .issuer-name {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
    }
    .issuer-details, .recipient-details {
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.4;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
      color: var(--text);
    }
    .doc-number {
      font-family: monospace;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-muted);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-neutral { background: #f1f5f9; color: #475569; }

    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      background: var(--surface);
      padding: 18px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .party-card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: var(--surface);
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-table {
      width: 320px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 10px;
      border: none;
      font-size: 13px;
    }
    .grand-total-row {
      border-top: 2px solid var(--border) !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      color: var(--primary) !important;
    }

    .doc-footer {
      border-top: 1px dashed var(--border);
      padding-top: 20px;
      margin-top: 20px;
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }

    @media print {
      body { background: #fff; padding: 0; }
      .doc-container { box-shadow: none; padding: 0; width: 100%; max-width: 100%; }
      .action-bar { display: none; }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <div style="font-weight: 600; color: var(--text-muted);">
      ${doc.title} &bull; ${doc.documentNumber}
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-secondary" onclick="window.history.back()">← Back</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
  </div>

  <div class="doc-container">
    
    <!-- Header -->
    <div class="doc-header">
      <div>
        ${doc.issuer.logoUrl ? `<img src="${doc.issuer.logoUrl}" class="issuer-logo" alt="Logo">` : ''}
        <div class="issuer-name">${doc.issuer.name}</div>
        <div class="issuer-details">
          ${renderAddress(doc.issuer.address)}<br>
          ${doc.issuer.phone ? `Phone: ${doc.issuer.phone} &bull; ` : ''}
          ${doc.issuer.email ? `Email: ${doc.issuer.email}` : ''}<br>
          ${doc.issuer.taxNumber ? `Tax Reg: <strong>${doc.issuer.taxNumber}</strong>` : ''}
        </div>
      </div>

      <div class="doc-meta">
        <div class="doc-title">${doc.title}</div>
        <div class="doc-number">${doc.documentNumber}</div>
        <div style="margin-top: 6px; font-size: 13px;">Date: <strong>${doc.date}</strong></div>
        ${doc.dueDate ? `<div style="font-size: 13px;">Due Date: <strong>${doc.dueDate}</strong></div>` : ''}
        <span class="badge ${statusBadgeClass}">${doc.status}</span>
      </div>
    </div>

    <!-- Recipient & Transaction Info -->
    <div class="party-grid">
      <div>
        <div class="party-card-title">${doc.documentType === 'PURCHASE_ORDER' || doc.documentType === 'SUPPLIER_BILL' ? 'Supplier Details' : 'Bill To / Customer'}</div>
        <div class="party-name">${doc.recipient.name}</div>
        <div class="recipient-details">
          ${renderAddress(doc.recipient.address)}<br>
          ${doc.recipient.phone ? `Phone: ${doc.recipient.phone}<br>` : ''}
          ${doc.recipient.email ? `Email: ${doc.recipient.email}<br>` : ''}
          ${doc.recipient.taxNumber ? `Tax ID: ${doc.recipient.taxNumber}` : ''}
        </div>
      </div>

      <div>
        <div class="party-card-title">Document Reference</div>
        <div style="font-size: 13px;">
          Document No: <strong>${doc.documentNumber}</strong><br>
          ${doc.referenceNumber ? `Reference: <strong>${doc.referenceNumber}</strong><br>` : ''}
          Currency: <strong>${cur}</strong>
        </div>
      </div>
    </div>

    <!-- Items Table (If Standard Document) -->
    ${doc.items && doc.items.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th style="width: 40px;" class="text-center">#</th>
            <th>Item & Description</th>
            <th class="text-center" style="width: 80px;">Qty</th>
            <th class="text-right" style="width: 100px;">Price</th>
            ${doc.items.some((i) => i.discountAmount > 0) ? `<th class="text-right" style="width: 80px;">Disc</th>` : ''}
            ${doc.items.some((i) => i.taxRatePercent > 0) ? `<th class="text-right" style="width: 80px;">Tax</th>` : ''}
            <th class="text-right" style="width: 110px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${doc.items.map((it) => `
            <tr>
              <td class="text-center" style="color: var(--text-muted);">${it.itemNumber}</td>
              <td>
                <strong>${it.name}</strong>
                ${it.sku ? `<span style="font-family: monospace; font-size: 11px; color: var(--text-muted); display: block;">SKU: ${it.sku}</span>` : ''}
              </td>
              <td class="text-center">${it.quantity} ${it.unit || ''}</td>
              <td class="text-right">${cur} ${it.unitPrice.toFixed(2)}</td>
              ${doc.items.some((i) => i.discountAmount > 0) ? `<td class="text-right">${it.discountAmount > 0 ? `-${cur} ${it.discountAmount.toFixed(2)}` : '—'}</td>` : ''}
              ${doc.items.some((i) => i.taxRatePercent > 0) ? `<td class="text-right">${it.taxRatePercent > 0 ? `${it.taxRatePercent}%` : '0%'}</td>` : ''}
              <td class="text-right" style="font-weight: 700;">${cur} ${it.lineTotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    <!-- Statement Ledger Table (If Customer Statement) -->
    ${doc.statementTransactions && doc.statementTransactions.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Reference</th>
            <th>Description</th>
            <th class="text-right">Debit (+)</th>
            <th class="text-right">Credit (-)</th>
            <th class="text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${doc.statementTransactions.map((tx) => `
            <tr>
              <td>${tx.date}</td>
              <td><span class="badge badge-neutral">${tx.type}</span></td>
              <td style="font-family: monospace;">${tx.reference}</td>
              <td>${tx.description}</td>
              <td class="text-right">${tx.debit > 0 ? `${cur} ${tx.debit.toFixed(2)}` : '—'}</td>
              <td class="text-right" style="color: #166534;">${tx.credit > 0 ? `${cur} ${tx.credit.toFixed(2)}` : '—'}</td>
              <td class="text-right" style="font-weight: 700;">${cur} ${tx.balance.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    <!-- Totals Summary -->
    <div class="totals-wrapper">
      <table class="totals-table">
        ${doc.totals.subtotal > 0 ? `
          <tr>
            <td class="text-right">Subtotal:</td>
            <td class="text-right" style="font-weight: 600;">${cur} ${doc.totals.subtotal.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${doc.totals.discountTotal > 0 ? `
          <tr>
            <td class="text-right">Discount:</td>
            <td class="text-right" style="color: #dc2626;">-${cur} ${doc.totals.discountTotal.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${doc.totals.taxTotal > 0 ? `
          <tr>
            <td class="text-right">Tax / VAT:</td>
            <td class="text-right">${cur} ${doc.totals.taxTotal.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr class="grand-total-row">
          <td class="text-right">Grand Total:</td>
          <td class="text-right">${cur} ${doc.totals.grandTotal.toFixed(2)}</td>
        </tr>
        ${doc.totals.amountPaid > 0 ? `
          <tr>
            <td class="text-right" style="color: #166534;">Amount Paid:</td>
            <td class="text-right" style="font-weight: 700; color: #166534;">${cur} ${doc.totals.amountPaid.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${doc.totals.balanceDue !== 0 ? `
          <tr style="font-weight: 800;">
            <td class="text-right">Balance Due:</td>
            <td class="text-right" style="color: #dc2626;">${cur} ${doc.totals.balanceDue.toFixed(2)}</td>
          </tr>
        ` : ''}
      </table>
    </div>

    <!-- Payments Section -->
    ${doc.payments && doc.payments.length > 0 ? `
      <div style="background: var(--surface); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
        <div style="font-weight: 700; margin-bottom: 4px;">Payments Applied:</div>
        ${doc.payments.map((p) => `
          <div style="display:flex; justify-content:space-between; color: var(--text-muted);">
            <span>${p.date} &bull; ${p.paymentMethod} ${p.reference ? `(Ref: ${p.reference})` : ''}</span>
            <span style="font-weight:600; color: var(--text);">${cur} ${p.amount.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Notes, Terms & Footer -->
    <div class="doc-footer">
      ${doc.notes ? `<div><strong>Notes:</strong> ${doc.notes}</div>` : ''}
      ${doc.terms ? `<div><strong>Terms & Conditions:</strong> ${doc.terms}</div>` : ''}
      ${doc.issuer.receiptFooter ? `<div>${doc.issuer.receiptFooter}</div>` : ''}
      <div style="text-align: center; margin-top: 12px; font-size: 11px; opacity: 0.7;">
        Generated by Universal ERP Operating System &bull; Document ID: ${doc.documentNumber}
      </div>
    </div>

  </div>

</body>
</html>
    `;
  },
};
