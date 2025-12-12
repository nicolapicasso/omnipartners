import { z } from 'zod'

// ============================================
// AUTH VALIDATIONS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerPartnerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  companyName: z.string().min(2, 'El nombre de la empresa es requerido'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  phone: z.string().optional(),
  country: z.string().min(2, 'El país es requerido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre es requerido'),
  role: z.enum(['ADMIN', 'PARTNER_OWNER', 'PARTNER_USER']),
  partnerId: z.string().optional(),
})

// ============================================
// LEAD VALIDATIONS
// ============================================

export const contactSchema = z.object({
  id: z.string().optional(), // Para edición de contactos existentes
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  phoneCountryCode: z.string().optional(), // Código de país (+34, etc.)
  jobTitle: z.string().optional(), // Cargo
  isPrimary: z.boolean().default(false),
})

export const createLeadSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa es requerido'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  phoneCountryCode: z.string().optional(), // Código de país del teléfono
  jobTitle: z.string().optional(), // Cargo del contacto principal
  country: z.string().min(2, 'El país es requerido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  partnerId: z.string().optional(), // Admin can assign to specific partner
  contacts: z.array(contactSchema).optional(), // Contactos adicionales
})

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(['LEAD', 'PROSPECT', 'CLIENT']).optional(),
  commissionType: z.enum(['AGENCY_PARTNER', 'TECH_PARTNER', 'REFERRAL', 'CUSTOM']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
})

// ============================================
// CONTENT VALIDATIONS
// ============================================

export const createContentSchema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  description: z.string().optional(),
  type: z.enum(['COMMERCIAL', 'TECHNICAL', 'STRATEGIC', 'DOCUMENT', 'CONTRACT', 'VIDEO', 'CERTIFICATION']),
  category: z.string().optional(),
  fileUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  order: z.number().default(0),
})

// ============================================
// TYPES
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type CreateContentInput = z.infer<typeof createContentSchema>
