export type SearchEntityType =
  | 'PRODUCT'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'SALE'
  | 'INVOICE'
  | 'PURCHASE_ORDER'
  | 'SUPPLIER_BILL'
  | 'PAYMENT'
  | 'DOCUMENT'
  | 'TASK';

export interface IGlobalSearchResultItem {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
  badge?: string;
  url: string;
  date?: string;
  metadata?: Record<string, any>;
}

export interface IGlobalSearchResults {
  query: string;
  totalCount: number;
  resultsByEntity: {
    products: IGlobalSearchResultItem[];
    customers: IGlobalSearchResultItem[];
    suppliers: IGlobalSearchResultItem[];
    sales: IGlobalSearchResultItem[];
    purchases: IGlobalSearchResultItem[];
    bills: IGlobalSearchResultItem[];
    tasks: IGlobalSearchResultItem[];
  };
  results: IGlobalSearchResultItem[];
}
