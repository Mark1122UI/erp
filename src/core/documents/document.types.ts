export type DocumentType =
  | 'INVOICE'
  | 'RECEIPT'
  | 'QUOTE'
  | 'PURCHASE_ORDER'
  | 'SUPPLIER_BILL'
  | 'DELIVERY_NOTE'
  | 'CREDIT_NOTE'
  | 'CUSTOMER_STATEMENT';

export interface IDocumentAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IDocumentPartyInfo {
  name: string;
  type?: 'CUSTOMER' | 'SUPPLIER' | 'ORGANIZATION' | 'INDIVIDUAL';
  contactPerson?: string;
  address?: IDocumentAddress;
  phone?: string;
  email?: string;
  taxNumber?: string;
  balanceDue?: number;
}

export interface IDocumentIssuerInfo {
  name: string;
  logoUrl?: string;
  address?: IDocumentAddress;
  phone?: string;
  email?: string;
  taxNumber?: string;
  currency: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export interface IDocumentLineItem {
  itemNumber: number;
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface IDocumentTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
}

export interface IDocumentPaymentEntry {
  paymentMethod: string;
  amount: number;
  reference?: string;
  date: string;
  changeAmount?: number;
}

export interface IStatementTransaction {
  date: string;
  type: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface IBusinessDocument {
  documentType: DocumentType;
  title: string;
  documentNumber: string;
  referenceNumber?: string;
  date: string;
  dueDate?: string;
  status: string;
  issuer: IDocumentIssuerInfo;
  recipient: IDocumentPartyInfo;
  items: IDocumentLineItem[];
  totals: IDocumentTotals;
  payments?: IDocumentPaymentEntry[];
  statementTransactions?: IStatementTransaction[];
  notes?: string;
  terms?: string;
  issuedBy?: string;
}
