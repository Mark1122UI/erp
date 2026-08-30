import { Router } from 'express';
import { z } from 'zod';
import { authService } from './auth.service.js';
import { tokenService } from './token.service.js';
import { requireAuth } from './auth.middleware.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import { UnauthorizedError } from '../common/errors.js';
import { authRateLimiter } from '../common/rateLimiter.js';

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  phone: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().optional(),
});

const resetRequestSchema = z.object({
  email: z.string().email('Valid email address required'),
});

const resetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'),
});

// Routes
router.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(
        res,
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          },
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
            slug: result.tenant.slug,
            currency: result.tenant.currency,
          },
          role: 'Owner',
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(res, {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          currency: result.tenant.currency,
        },
        role: result.role,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', (req, res) => {
  tokenService.clearAuthCookies(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const result = await authService.refreshTokens(refreshToken);
    tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);

    sendSuccess(res, {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
      role: result.role,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/switch-business',
  requireAuth,
  validateRequest({ body: z.object({ tenantId: z.string() }) }),
  async (req, res, next) => {
    try {
      const userId = contextProvider.getUserId()!;
      const result = await authService.switchTenant(userId, req.body.tenantId);
      const refreshToken = tokenService.generateRefreshToken({ userId });

      tokenService.setAuthCookies(res, result.accessToken, refreshToken);

      sendSuccess(res, {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
        role: result.role,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest({ body: resetRequestSchema }),
  async (req, res, next) => {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      sendSuccess(res, {
        message: 'If the email exists, a password reset link has been generated',
        resetToken: result.resetToken, // Provided for testing & dev convenience
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest({ body: resetConfirmSchema }),
  async (req, res, next) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      sendSuccess(res, { message: 'Password has been successfully reset' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/pos-pin',
  requireAuth,
  validateRequest({ body: pinSchema }),
  async (req, res, next) => {
    try {
      const userId = contextProvider.getUserId()!;
      await authService.setPosPin(userId, req.body.pin);
      sendSuccess(res, { message: 'POS Quick-Unlock PIN set successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = contextProvider.getUserId()!;
    const tenantId = contextProvider.getRequiredTenantId();
    const profile = await authService.getCurrentUser(userId, tenantId);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

export default router;
