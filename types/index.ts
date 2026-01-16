import {
  Partner,
  User,
  Lead,
  Payment,
  Invoice,
  InvoicePayment,
  Content,
  ContentView,
  ContentFavorite,
  Notification,
} from '@prisma/client'

// Export Prisma types
export type {
  Partner,
  User,
  Lead,
  Payment,
  Invoice,
  InvoicePayment,
  Content,
  ContentView,
  ContentFavorite,
  Notification,
}

// ============================================
// ENUMS (for type safety, since SQLite doesn't support native enums)
// ============================================

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum PartnerCategory {
  AGENCY_PARTNER = 'AGENCY_PARTNER',
  TECH_PARTNER = 'TECH_PARTNER',
  REFERRAL = 'REFERRAL',
  CUSTOM = 'CUSTOM',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PARTNER_OWNER = 'PARTNER_OWNER',
  PARTNER_USER = 'PARTNER_USER',
}

export enum LeadStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  CLIENT = 'CLIENT',
  ARCHIVED = 'ARCHIVED',
}

export enum CommissionType {
  AGENCY_PARTNER = 'AGENCY_PARTNER',
  TECH_PARTNER = 'TECH_PARTNER',
  REFERRAL = 'REFERRAL',
  CUSTOM = 'CUSTOM',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
}

export enum ContentType {
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  GUIDE = 'GUIDE',
  CONTRACT = 'CONTRACT',
  CERTIFICATION = 'CERTIFICATION',
}

export enum ContentCategory {
  COMMERCIAL = 'COMMERCIAL',
  TECHNICAL = 'TECHNICAL',
  STRATEGIC = 'STRATEGIC',
  LEGAL = 'LEGAL',
  GENERAL = 'GENERAL',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum NotificationType {
  PARTNER_REGISTERED = 'PARTNER_REGISTERED',
  PARTNER_APPROVED = 'PARTNER_APPROVED',
  PARTNER_REJECTED = 'PARTNER_REJECTED',
  NEW_LEAD = 'NEW_LEAD',
  LEAD_CONVERTED = 'LEAD_CONVERTED',
  NEW_PAYMENT = 'NEW_PAYMENT',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  INVOICE_PAID = 'INVOICE_PAID',
  NEW_CONTENT = 'NEW_CONTENT',
  USER_INVITED = 'USER_INVITED',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
}

// ============================================
// INTERFACES
// ============================================

export interface DashboardStats {
  activePartners: number
  pendingPartners: number
  leads: number
  clients: number
}

export interface PartnerDashboardStats {
  totalLeads: number
  totalProspects: number
  totalClients: number
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
}

export interface AdminDashboardStats {
  totalPartners: number
  activePartners: number
  pendingPartners: number
  totalLeads: number
  totalClients: number
  totalRevenue: number
  totalCommissions: number
}

// Types with relations
export type PartnerWithRelations = Partner & {
  users?: User[]
  leads?: Lead[]
  invoices?: Invoice[]
}

export type LeadWithRelations = Lead & {
  partner?: Partner
  createdBy?: User
  payments?: Payment[]
}

export type PaymentWithRelations = Payment & {
  lead?: LeadWithRelations
  invoices?: InvoicePayment[]
}

export type InvoiceWithRelations = Invoice & {
  partner?: Partner
  payments?: InvoicePayment[]
}
