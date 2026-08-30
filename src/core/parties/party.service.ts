import mongoose from 'mongoose';
import { Party, IParty, PartyRole, PartyType, IAddress } from './party.model.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface CreatePartyDTO {
  type: PartyType;
  roles: PartyRole[];
  firstName?: string;
  lastName?: string;
  salutation?: string;
  companyName?: string;
  taxNumber?: string;
  website?: string;
  industry?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  customerDetails?: {
    creditLimit?: number;
    paymentTermsDays?: number;
    priceTier?: string;
    taxExempt?: boolean;
  };
  supplierDetails?: {
    defaultPaymentTermsDays?: number;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      routingCode?: string;
    };
  };
  tags?: string[];
  initialNote?: string;
}

export interface UpdatePartyDTO extends Partial<CreatePartyDTO> {
  isActive?: boolean;
}

export interface ListPartiesFilter {
  role?: PartyRole;
  search?: string;
  isArchived?: boolean;
  hasBalance?: boolean; // For customers: balance > 0 ("owes you money"); for suppliers: balance > 0 ("you owe")
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function computeDisplayName(data: {
  type: PartyType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}): string {
  if (data.type === 'ORGANIZATION') {
    return data.companyName?.trim() || 'Unnamed Organization';
  }
  const full = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  return full || data.companyName?.trim() || 'Unnamed Person';
}

export const partyService = {
  async createParty(
    tenantId: string,
    data: CreatePartyDTO,
    userId: string,
    userName: string
  ): Promise<IParty> {
    if (!data.roles || data.roles.length === 0) {
      throw new BadRequestError('At least one relationship role (e.g. Customer or Supplier) is required');
    }

    const displayName = computeDisplayName(data);

    const initialActivities = [
      {
        type: 'PARTY_CREATED',
        title: `Created as ${data.roles.join(' & ')}`,
        description: `Profile established by ${userName}`,
        performedBy: userName,
        createdAt: new Date(),
      },
    ];

    const initialNotes = data.initialNote
      ? [
          {
            content: data.initialNote,
            authorId: new mongoose.Types.ObjectId(userId),
            authorName: userName,
            createdAt: new Date(),
          },
        ]
      : [];

    const party = await Party.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      type: data.type,
      roles: data.roles,
      displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      salutation: data.salutation,
      companyName: data.companyName,
      taxNumber: data.taxNumber,
      website: data.website,
      industry: data.industry,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      customerDetails: data.customerDetails
        ? {
            creditLimit: data.customerDetails.creditLimit || 0,
            paymentTermsDays: data.customerDetails.paymentTermsDays || 0,
            currentBalance: 0,
            totalSpend: 0,
            priceTier: data.customerDetails.priceTier || 'STANDARD',
            taxExempt: data.customerDetails.taxExempt || false,
          }
        : undefined,
      supplierDetails: data.supplierDetails
        ? {
            defaultPaymentTermsDays: data.supplierDetails.defaultPaymentTermsDays || 30,
            currentBalance: 0,
            totalPurchased: 0,
            bankDetails: data.supplierDetails.bankDetails,
          }
        : undefined,
      notes: initialNotes,
      activities: initialActivities,
      tags: data.tags || [],
      isArchived: false,
      isActive: true,
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Party',
      entityId: party.id,
      metadata: {
        displayName: party.displayName,
        roles: party.roles,
        type: party.type,
      },
    });

    return party;
  },

  async updateParty(
    tenantId: string,
    partyId: string,
    data: UpdatePartyDTO,
    userId: string,
    userName: string
  ): Promise<IParty> {
    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new BadRequestError('Invalid record ID format');
    }

    const party = await Party.findOne({
      _id: new mongoose.Types.ObjectId(partyId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!party) {
      throw new NotFoundError('Contact record not found');
    }

    if (data.type) party.type = data.type;
    if (data.roles) party.roles = data.roles;
    if (data.firstName !== undefined) party.firstName = data.firstName;
    if (data.lastName !== undefined) party.lastName = data.lastName;
    if (data.salutation !== undefined) party.salutation = data.salutation;
    if (data.companyName !== undefined) party.companyName = data.companyName;
    if (data.taxNumber !== undefined) party.taxNumber = data.taxNumber;
    if (data.website !== undefined) party.website = data.website;
    if (data.industry !== undefined) party.industry = data.industry;
    if (data.email !== undefined) party.email = data.email;
    if (data.phone !== undefined) party.phone = data.phone;
    if (data.mobile !== undefined) party.mobile = data.mobile;
    if (data.billingAddress !== undefined) party.billingAddress = data.billingAddress;
    if (data.shippingAddress !== undefined) party.shippingAddress = data.shippingAddress;
    if (data.tags !== undefined) party.tags = data.tags;
    if (data.isActive !== undefined) party.isActive = data.isActive;

    party.displayName = computeDisplayName({
      type: party.type,
      firstName: party.firstName,
      lastName: party.lastName,
      companyName: party.companyName,
    });

    if (data.customerDetails) {
      party.customerDetails = {
        ...party.customerDetails,
        ...data.customerDetails,
        currentBalance: party.customerDetails?.currentBalance || 0,
        totalSpend: party.customerDetails?.totalSpend || 0,
      } as any;
    }

    if (data.supplierDetails) {
      party.supplierDetails = {
        ...party.supplierDetails,
        ...data.supplierDetails,
        currentBalance: party.supplierDetails?.currentBalance || 0,
        totalPurchased: party.supplierDetails?.totalPurchased || 0,
      } as any;
    }

    party.activities.push({
      type: 'PARTY_UPDATED',
      title: 'Profile Updated',
      description: `Updated by ${userName}`,
      performedBy: userName,
      createdAt: new Date(),
    });

    await party.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'Party',
      entityId: party.id,
      metadata: {
        displayName: party.displayName,
        updatedFields: Object.keys(data),
      },
    });

    return party;
  },

  async getPartyById(tenantId: string, partyId: string): Promise<IParty> {
    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new BadRequestError('Invalid record ID format');
    }

    const party = await Party.findOne({
      _id: new mongoose.Types.ObjectId(partyId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!party) {
      throw new NotFoundError('Contact record not found');
    }

    return party;
  },

  async addNote(
    tenantId: string,
    partyId: string,
    content: string,
    userId: string,
    userName: string
  ): Promise<IParty> {
    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new BadRequestError('Invalid record ID format');
    }

    const party = await Party.findOne({
      _id: new mongoose.Types.ObjectId(partyId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!party) {
      throw new NotFoundError('Contact record not found');
    }

    party.notes.unshift({
      content,
      authorId: new mongoose.Types.ObjectId(userId),
      authorName: userName,
      createdAt: new Date(),
    });

    party.activities.push({
      type: 'NOTE_ADDED',
      title: 'Added a note',
      description: content.substring(0, 100),
      performedBy: userName,
      createdAt: new Date(),
    });

    await party.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'PartyNote',
      entityId: party.id,
      metadata: { noteLength: content.length },
    });

    return party;
  },

  async recordTransaction(
    tenantId: string,
    partyId: string,
    transaction: {
      type: 'INVOICE' | 'PAYMENT' | 'BILL' | 'PURCHASE' | 'REFUND' | 'CREDIT_NOTE';
      amount: number;
      currency?: string;
      status?: 'PAID' | 'PENDING' | 'OVERDUE' | 'VOID';
      reference?: string;
      description?: string;
    },
    userId: string,
    userName: string
  ): Promise<IParty> {
    const party = await this.getPartyById(tenantId, partyId);

    const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    party.transactions.unshift({
      transactionNumber,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency || 'USD',
      status: transaction.status || 'PAID',
      reference: transaction.reference,
      description: transaction.description,
      date: new Date(),
    });

    // Update balances
    if (party.roles.includes('CUSTOMER')) {
      if (!party.customerDetails) {
        party.customerDetails = { creditLimit: 0, paymentTermsDays: 0, currentBalance: 0, totalSpend: 0 };
      }
      if (transaction.type === 'INVOICE') {
        party.customerDetails.currentBalance += transaction.amount;
        party.customerDetails.totalSpend += transaction.amount;
      } else if (transaction.type === 'PAYMENT') {
        party.customerDetails.currentBalance -= transaction.amount;
      }
    }

    if (party.roles.includes('SUPPLIER')) {
      if (!party.supplierDetails) {
        party.supplierDetails = { defaultPaymentTermsDays: 30, currentBalance: 0, totalPurchased: 0 };
      }
      if (transaction.type === 'BILL' || transaction.type === 'PURCHASE') {
        party.supplierDetails.currentBalance += transaction.amount;
        party.supplierDetails.totalPurchased += transaction.amount;
      } else if (transaction.type === 'PAYMENT') {
        party.supplierDetails.currentBalance -= transaction.amount;
      }
    }

    party.activities.push({
      type: 'TRANSACTION_RECORDED',
      title: `${transaction.type} recorded (${transaction.amount})`,
      description: transaction.description || `Ref: ${transaction.reference || transactionNumber}`,
      performedBy: userName,
      createdAt: new Date(),
    });

    await party.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'PAYMENT',
      entity: 'PartyTransaction',
      entityId: party.id,
      metadata: { transactionNumber, amount: transaction.amount, type: transaction.type },
    });

    return party;
  },

  async setArchiveStatus(
    tenantId: string,
    partyId: string,
    isArchived: boolean,
    userId: string,
    userName: string
  ): Promise<IParty> {
    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new BadRequestError('Invalid record ID format');
    }

    const party = await Party.findOne({
      _id: new mongoose.Types.ObjectId(partyId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!party) {
      throw new NotFoundError('Contact record not found');
    }

    party.isArchived = isArchived;
    party.activities.push({
      type: isArchived ? 'ARCHIVED' : 'RESTORED',
      title: isArchived ? 'Record Archived' : 'Record Restored to Active',
      performedBy: userName,
      createdAt: new Date(),
    });

    await party.save();

    await auditService.log({
      tenantId,
      userId,
      action: isArchived ? 'DELETE' : 'UPDATE',
      entity: 'Party',
      entityId: party.id,
      metadata: { displayName: party.displayName, isArchived },
    });

    return party;
  },

  async listParties(tenantId: string, filter: ListPartiesFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isArchived: filter.isArchived !== undefined ? filter.isArchived : false,
    };

    if (filter.role) {
      query.roles = filter.role;
    }

    if (filter.tag) {
      query.tags = filter.tag;
    }

    if (filter.hasBalance) {
      if (filter.role === 'CUSTOMER') {
        query['customerDetails.currentBalance'] = { $gt: 0 };
      } else if (filter.role === 'SUPPLIER') {
        query['supplierDetails.currentBalance'] = { $gt: 0 };
      }
    }

    // Reusable multi-field search (Name, Phone, Email, Organization)
    if (filter.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { displayName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { mobile: searchRegex },
        { companyName: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ];
    }

    const sortOptions: any = {};
    if (filter.sortBy) {
      sortOptions[filter.sortBy] = filter.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [parties, totalRecords] = await Promise.all([
      Party.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Party.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      parties,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
