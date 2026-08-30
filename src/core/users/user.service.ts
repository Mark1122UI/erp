import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, IUser, UserStatus } from '../identity/user.model.js';
import { SystemRole } from '../rbac/permissions.js';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface InviteUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  role: SystemRole;
}

export interface UpdateUserRoleDTO {
  role: SystemRole;
}

export interface UpdateUserStatusDTO {
  status: UserStatus;
}

export const userService = {
  async listTenantUsers(tenantId: string) {
    const users = await User.find({
      'memberships.tenantId': new mongoose.Types.ObjectId(tenantId),
    }).lean();

    return users.map((u) => {
      const membership = u.memberships.find((m) => m.tenantId.toString() === tenantId);
      return {
        id: u._id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: membership?.role,
        status: membership?.status,
        joinedAt: membership?.joinedAt,
        invitedAt: membership?.invitedAt,
        lastLoginAt: u.lastLoginAt,
        isActive: u.isActive,
      };
    });
  },

  async inviteUser(tenantId: string, data: InviteUserDTO, invitedByUserId: string) {
    const normalizedEmail = data.email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (user) {
      // Check if already member
      const existingMembership = user.memberships.find((m) => m.tenantId.toString() === tenantId);
      if (existingMembership) {
        if (existingMembership.status === 'ACTIVE') {
          throw new ConflictError('User is already an active member of this business');
        }
        // Re-invite
        existingMembership.role = data.role;
        existingMembership.status = 'INVITED';
        existingMembership.invitedAt = new Date();
      } else {
        user.memberships.push({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          role: data.role,
          status: 'INVITED',
          invitedBy: new mongoose.Types.ObjectId(invitedByUserId),
          invitedAt: new Date(),
        });
      }

      user.invitationToken = invitationToken;
      user.invitationExpires = invitationExpires;
      await user.save();
    } else {
      // Create pending invited user with temporary placeholder password
      const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = await User.create({
        email: normalizedEmail,
        passwordHash: tempHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        memberships: [
          {
            tenantId: new mongoose.Types.ObjectId(tenantId),
            role: data.role,
            status: 'INVITED',
            invitedBy: new mongoose.Types.ObjectId(invitedByUserId),
            invitedAt: new Date(),
          },
        ],
        invitationToken,
        invitationExpires,
        isActive: true,
      });
    }

    await auditService.log({
      tenantId,
      userId: invitedByUserId,
      action: 'PERMISSION_CHANGE',
      entity: 'UserInvitation',
      entityId: user.id,
      metadata: { invitedEmail: user.email, assignedRole: data.role },
    });

    return {
      userId: user.id,
      email: user.email,
      role: data.role,
      invitationToken,
    };
  },

  async acceptInvitation(token: string, password?: string, firstName?: string, lastName?: string) {
    const user = await User.findOne({
      invitationToken: token,
      invitationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invitation token is invalid or has expired');
    }

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(password, salt);
    }
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();

    // Activate membership for all pending invited tenants
    for (const membership of user.memberships) {
      if (membership.status === 'INVITED') {
        membership.status = 'ACTIVE';
        membership.joinedAt = new Date();
      }
    }

    user.invitationToken = undefined;
    user.invitationExpires = undefined;
    await user.save();

    return {
      message: 'Invitation accepted successfully',
      email: user.email,
    };
  },

  async updateUserRole(
    tenantId: string,
    targetUserId: string,
    newRole: SystemRole,
    performedByUserId: string
  ) {
    const user = await User.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found');

    const membership = user.memberships.find((m) => m.tenantId.toString() === tenantId);
    if (!membership) throw new NotFoundError('User is not a member of this business');

    // Prevent removing the last active Owner
    if (membership.role === 'Owner' && newRole !== 'Owner') {
      const ownerCount = await User.countDocuments({
        memberships: {
          $elemMatch: { tenantId: new mongoose.Types.ObjectId(tenantId), role: 'Owner', status: 'ACTIVE' },
        },
      });
      if (ownerCount <= 1) {
        throw new BadRequestError('Cannot demote the sole business Owner. Appoint another Owner first.');
      }
    }

    const previousRole = membership.role;
    membership.role = newRole;
    await user.save();

    await auditService.log({
      tenantId,
      userId: performedByUserId,
      action: 'PERMISSION_CHANGE',
      entity: 'UserRole',
      entityId: user.id,
      metadata: { targetUserEmail: user.email, previousRole, newRole },
    });

    return {
      userId: user.id,
      email: user.email,
      role: newRole,
    };
  },

  async updateUserStatus(
    tenantId: string,
    targetUserId: string,
    newStatus: UserStatus,
    performedByUserId: string
  ) {
    const user = await User.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found');

    const membership = user.memberships.find((m) => m.tenantId.toString() === tenantId);
    if (!membership) throw new NotFoundError('User is not a member of this business');

    if (membership.role === 'Owner' && newStatus !== 'ACTIVE') {
      const ownerCount = await User.countDocuments({
        memberships: {
          $elemMatch: { tenantId: new mongoose.Types.ObjectId(tenantId), role: 'Owner', status: 'ACTIVE' },
        },
      });
      if (ownerCount <= 1) {
        throw new BadRequestError('Cannot deactivate or suspend the sole business Owner.');
      }
    }

    const previousStatus = membership.status;
    membership.status = newStatus;
    await user.save();

    await auditService.log({
      tenantId,
      userId: performedByUserId,
      action: 'UPDATE',
      entity: 'UserStatus',
      entityId: user.id,
      metadata: { targetUserEmail: user.email, previousStatus, newStatus },
    });

    return {
      userId: user.id,
      email: user.email,
      status: newStatus,
    };
  },
};
