import mongoose, { Schema, Document } from 'mongoose';
import { SystemRole } from '../rbac/permissions.js';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';

export interface IUserMembership {
  tenantId: mongoose.Types.ObjectId;
  role: SystemRole;
  status: UserStatus;
  invitedBy?: mongoose.Types.ObjectId;
  invitedAt?: Date;
  joinedAt?: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  pinHash?: string;
  memberships: IUserMembership[];
  currentTenantId?: mongoose.Types.ObjectId;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  invitationToken?: string;
  invitationExpires?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

const UserMembershipSchema = new Schema<IUserMembership>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    role: {
      type: String,
      enum: ['Owner', 'Manager', 'Sales', 'Cashier', 'Inventory Manager', 'Accountant', 'Staff'],
      default: 'Staff',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED'],
      default: 'ACTIVE',
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    invitedAt: { type: Date },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    pinHash: { type: String },
    memberships: [UserMembershipSchema],
    currentTenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    invitationToken: { type: String, index: true },
    invitationExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.index({ 'memberships.tenantId': 1, 'memberships.status': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
