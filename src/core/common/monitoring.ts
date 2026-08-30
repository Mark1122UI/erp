/**
 * Universal ERP — Production Error Monitoring & Safe Structured Logging Abstraction
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'jwt_secret',
  'cookie_secret',
  'authorization',
  'cookie',
  'set-cookie',
  'apikey',
  'secretkey',
  'creditcard',
  'cardnumber',
  'cvv',
  'cvc',
  'stripe_secret_key',
  'webhook_secret',
]);

/**
 * Deeply sanitizes objects to ensure sensitive secrets are never leaked in logs or error reports.
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret')) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeLogData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export interface IErrorMonitoringContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  extra?: Record<string, any>;
}

export const errorMonitor = {
  /**
   * Captures unhandled exceptions and dispatches sanitized metadata to monitoring services
   */
  captureException(error: Error | any, context?: IErrorMonitoringContext): void {
    const cleanContext = context ? sanitizeLogData(context) : {};
    
    // In production, integration hooks (e.g. Sentry / Datadog / CloudWatch) connect here
    if (process.env.NODE_ENV === 'production') {
      const payload = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        name: error?.name || 'Error',
        message: error?.message || 'Unknown error occurred',
        context: cleanContext,
      };
      // Format as single-line JSON for structured cloud log aggregators (ELK, CloudWatch, Datadog)
      console.error(JSON.stringify(payload));
    } else {
      console.error(`[MONITOR] ${error?.name || 'Error'}: ${error?.message}`, cleanContext);
    }
  },

  /**
   * Safe structured operational logger
   */
  log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: Record<string, any>): void {
    const cleanData = data ? sanitizeLogData(data) : undefined;
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(cleanData ? { data: cleanData } : {}),
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level}] ${message}`, cleanData || '');
    }
  },
};
