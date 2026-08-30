import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from './errors.js';
import { env } from '../../config/env.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export class MemoryStore {
  private hits: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up expired keys every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.hits.get(key);

    if (!existing || existing.resetTime <= now) {
      const record: RateLimitRecord = { count: 1, resetTime: now + windowMs };
      this.hits.set(key, record);
      return record;
    }

    existing.count += 1;
    return existing;
  }

  reset(key?: string): void {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (record.resetTime <= now) {
        this.hits.delete(key);
      }
    }
  }
}

export const defaultStore = new MemoryStore();

export function createRateLimiter(options: RateLimiterOptions, store: MemoryStore = defaultStore) {
  const {
    windowMs,
    max,
    message = 'Too many requests from this IP, please try again later',
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || '127.0.0.1',
    skip = () => false,
  } = options;

  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const { count, resetTime } = store.increment(key, windowMs);
    const remaining = Math.max(0, max - count);
    const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000);

    res.setHeader('RateLimit-Limit', max.toString());
    res.setHeader('RateLimit-Remaining', remaining.toString());
    res.setHeader('RateLimit-Reset', resetSeconds.toString());

    if (count > max) {
      res.setHeader('Retry-After', resetSeconds.toString());
      next(new TooManyRequestsError(message, { retryAfterSeconds: resetSeconds }));
      return;
    }

    next();
  };
}

// -------------------------------------------------------------
// PRE-CONFIGURED LIMITERS
// -------------------------------------------------------------

// Strict rate limiter for Authentication endpoints (Login, Register, Password Reset)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 min
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  keyGenerator: (req) => `auth_${req.ip || '127.0.0.1'}_${req.originalUrl}`,
  skip: (req) => {
    // In development or test, skip unless explicitly testing rate limits
    if (env.NODE_ENV === 'development') return true;
    return env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
  },
});

// General API protection limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min
  message: 'API rate limit exceeded. Please slow down your requests.',
  keyGenerator: (req) => `api_${req.ip || '127.0.0.1'}`,
  skip: (req) => {
    if (env.NODE_ENV === 'development') return true;
    return env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
  },
});

// Export & heavy report generator limiter
export const exportRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 exports per 15 min
  message: 'Export generation rate limit exceeded. Please wait before generating more reports.',
  keyGenerator: (req) => `export_${req.ip || '127.0.0.1'}`,
  skip: (req) => {
    if (env.NODE_ENV === 'development') return true;
    return env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
  },
});
