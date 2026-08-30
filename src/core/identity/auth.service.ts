import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User, IUser, UserStatus } from './user.model.js';
import { Tenant, ITenant } from '../tenancy/tenant.model.js';
import { tokenService, TokenPayload } from './token.service.js';
import { auditService } from '../audit/audit.service.js';
import { ROLE_PERMISSIONS, SystemRole } from '../rbac/permissions.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../common/errors.js';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone?: string;
  country?: string;
  currency?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  tenantId?: string;
}

export const authService = {
  async register(data: RegisterDTO): Promise<{
    user: IUser;
    tenant: ITenant;
    accessToken: string;
    refreshToken: string;
  }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 1. Create Business / Tenant
    const slug =
      data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30) +
      '-' +
      Math.random().toString(36).substring(2, 6);

    const tenant = await Tenant.create({
      name: data.businessName,
      slug,
      country: data.country || 'US',
      currency: data.currency || 'USD',
      timezone: 'UTC',
      businessType: 'HYBRID_RETAIL',
      email: normalizedEmail,
      phone: data.phone,
      isSetupComplete: false,
      activeModules: ['core', 'retail', 'ecommerce'],
    });

    // 2. Create User with Owner Membership
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      memberships: [
        {
          tenantId: tenant._id as mongoose.Types.ObjectId,
          role: 'Owner',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      ],
      currentTenantId: tenant._id as mongoose.Types.ObjectId,
      isActive: true,
      lastLoginAt: new Date(),
    });

    // 3. Log Audit
    await auditService.log({
      tenantId: tenant.id,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'UserRegistration',
      entityId: user.id,
      metadata: { businessName: tenant.name },
    });

    // 4. Generate Auth Tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      role: 'Owner',
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);
    const refreshToken = tokenService.generateRefreshToken({ userId: user.id });

    return { user, tenant, accessToken, refreshToken };
  },

  async login(data: LoginDTO): Promise<{
    user: IUser;
    tenant: ITenant;
    role: SystemRole;
    accessToken: string;
    refreshToken: string;
  }> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Resolve Tenant Membership
    let activeMembership = user.memberships.find(
      (m) =>
        (data.tenantId ? m.tenantId.toString() === data.tenantId : true) &&
        m.status === 'ACTIVE'
    );

    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships.find((m) => m.status === 'ACTIVE');
    }

    if (!activeMembership) {
      throw new ForbiddenError('No active business membership found for this user');
    }

    const tenant = await Tenant.findById(activeMembership.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new ForbiddenError('The business associated with this account is inactive');
    }

    user.currentTenantId = tenant._id as mongoose.Types.ObjectId;
    user.lastLoginAt = new Date();
    await user.save();

    // Log Login Audit
    await auditService.log({
      tenantId: tenant.id,
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN',
      entity: 'Auth',
      entityId: user.id,
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      role: activeMembership.role,
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);
    const refreshToken = tokenService.generateRefreshToken({ userId: user.id });

    return {
      user,
      tenant,
      role: activeMembership.role,
      accessToken,
      refreshToken,
    };
  },

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUser;
    tenant: ITenant;
    role: SystemRole;
  }> {
    try {
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User session expired or revoked');
      }

      const activeMembership = user.memberships.find(
        (m) =>
          user.currentTenantId &&
          m.tenantId.toString() === user.currentTenantId.toString() &&
          m.status === 'ACTIVE'
      ) || user.memberships.find((m) => m.status === 'ACTIVE');

      if (!activeMembership) {
        throw new UnauthorizedError('No active business membership found');
      }

      const tenant = await Tenant.findById(activeMembership.tenantId);
      if (!tenant || !tenant.isActive) {
        throw new UnauthorizedError('Business is inactive');
      }

      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        tenantId: tenant.id,
        role: activeMembership.role,
      };

      const newAccessToken = tokenService.generateAccessToken(tokenPayload);
      const newRefreshToken = tokenService.generateRefreshToken({ userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
        tenant,
        role: activeMembership.role,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },

  async switchTenant(userId: string, targetTenantId: string): Promise<{
    accessToken: string;
    tenant: ITenant;
    role: SystemRole;
  }> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const membership = user.memberships.find(
      (m) => m.tenantId.toString() === targetTenantId && m.status === 'ACTIVE'
    );

    if (!membership) {
      throw new ForbiddenError('You are not an active member of this business');
    }

    const tenant = await Tenant.findById(targetTenantId);
    if (!tenant || !tenant.isActive) {
      throw new ForbiddenError('Target business is inactive');
    }

    user.currentTenantId = tenant._id as mongoose.Types.ObjectId;
    await user.save();

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      role: membership.role,
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);

    return {
      accessToken,
      tenant,
      role: membership.role,
    };
  },

  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return safe success response to prevent email enumeration
      return { resetToken: 'mock_token_for_safety' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return { resetToken };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  },

  async setPosPin(userId: string, pin: string): Promise<void> {
    if (!/^\d{4,6}$/.test(pin)) {
      throw new BadRequestError('PIN must be 4 to 6 numeric digits');
    }
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);
    await User.findByIdAndUpdate(userId, { pinHash });
  },

  async verifyPosPin(userId: string, pin: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user || !user.pinHash) return false;
    return bcrypt.compare(pin, user.pinHash);
  },

  async getCurrentUser(userId: string, tenantId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw new NotFoundError('User not found');

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) throw new NotFoundError('Active business not found');

    const membership = user.memberships.find(
      (m: any) => m.tenantId.toString() === tenantId
    );

    const role = (membership?.role || 'Staff') as SystemRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Filter available tenants for switcher
    const tenantIds = user.memberships
      .filter((m: any) => m.status === 'ACTIVE')
      .map((m: any) => m.tenantId);

    const availableBusinesses = await Tenant.find({
      _id: { $in: tenantIds },
      isActive: true,
    }).select('name slug currency country isSetupComplete logoUrl');

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        hasPin: Boolean(user.pinHash),
      },
      currentBusiness: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        country: tenant.country,
        currency: tenant.currency,
        timezone: tenant.timezone,
        businessType: tenant.businessType,
        isSetupComplete: tenant.isSetupComplete,
        activeModules: tenant.activeModules,
        logoUrl: tenant.logoUrl,
      },
      membership: {
        role,
        status: membership?.status || 'ACTIVE',
        permissions,
      },
      availableBusinesses,
    };
  },
};
