import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  permissions?: string[];
  organizationId?: string;
  branchId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const contextProvider = {
  run<R>(context: RequestContext, callback: () => R): R {
    return asyncLocalStorage.run(context, callback);
  },

  get(): RequestContext {
    return asyncLocalStorage.getStore() || {};
  },

  getTenantId(): string | undefined {
    return asyncLocalStorage.getStore()?.tenantId;
  },

  getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  },

  getRequiredTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant context missing in current execution thread');
    }
    return tenantId;
  },

  set(partialContext: Partial<RequestContext>): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      Object.assign(store, partialContext);
    }
  }
};
