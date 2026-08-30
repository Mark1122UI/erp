import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { tenantResolverMiddleware } from './core/tenancy/middleware.js';
import { errorHandler } from './core/common/errorHandler.js';
import { NotFoundError } from './core/common/errors.js';
import { sendSuccess } from './core/common/response.js';

// Route Handlers
import authRoutes from './core/identity/auth.routes.js';
import tenantRoutes from './core/tenancy/tenant.routes.js';
import userRoutes from './core/users/user.routes.js';
import auditRoutes from './core/audit/audit.routes.js';
import { customerRouter, supplierRouter } from './core/parties/party.routes.js';
import productRoutes from './core/catalog/product.routes.js';
import inventoryRoutes from './core/inventory/inventory.routes.js';
import saleRoutes from './core/sales/sale.routes.js';
import purchaseRoutes from './core/purchasing/purchase.routes.js';
import moneyRoutes from './core/money/money.routes.js';
import posRoutes from './core/pos/pos.routes.js';
import documentRoutes from './core/documents/document.routes.js';
import taskRoutes from './core/tasks/task.routes.js';
import notificationRoutes from './core/notifications/notification.routes.js';
import searchRoutes from './core/search/search.routes.js';
import integrationRoutes from './core/integrations/integration.routes.js';
import reportRoutes from './core/reports/report.routes.js';

import { mongoSanitizer } from './core/common/sanitizer.js';
import { apiRateLimiter } from './core/common/rateLimiter.js';

const app = express();

// 1. Security & Body Parsers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline script evaluation for local PWA/embedded client
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' }, // Clickjacking protection
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
      if (!origin || env.CORS_ORIGIN.split(',').includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Input Sanitization (NoSQL Injection Prevention)
app.use(mongoSanitizer);

// 3. Global API Rate Limiting
app.use('/api', apiRateLimiter);

// 4. Tenant Context Resolution Middleware
app.use(tenantResolverMiddleware);

import mongoose from 'mongoose';

// 3. Health & Readiness Probes (Root and API paths for container orchestrators)
app.get(['/health', '/api/health'], (_req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    app: env.APP_NAME,
    environment: env.NODE_ENV,
  });
});

app.get(['/ready', '/api/ready'], (_req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (!isDbReady) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Application is not ready to accept traffic (database disconnected)',
      },
    });
    return;
  }

  sendSuccess(res, {
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// 4. API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/business', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/money', moneyRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/reports', reportRoutes);

// 5. Serve Static Client Bundle / Assets if available
app.use(express.static('public'));

// 6. Catch-All 404 Handler for API
app.use('/api/*', (req, res, next) => {
  next(new NotFoundError(`API endpoint '${req.originalUrl}' not found`));
});

// 7. SPA Fallback: Serve index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

// 8. Global Error Handler
app.use(errorHandler);

export default app;
