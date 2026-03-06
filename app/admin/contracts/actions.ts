'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getRequirementsForPartner } from '@/app/admin/requirements/actions'

// ============================================
// CONTRACT TEMPLATES
// ============================================

export async function getContractTemplates() {
  try {
    const templates = await prisma.contractTemplate.findMany({
      orderBy: [
        { partnerCategory: 'asc' },
        { order: 'asc' },
      ],
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    })
    return { success: true, data: templates }
  } catch (error) {
    console.error('Error fetching contract templates:', error)
    return { success: false, error: 'Error al obtener las plantillas' }
  }
}

export async function createContractTemplate(data: {
  name: string
  partnerCategory: string | null
  content: string
  content_en?: string
  content_it?: string
  content_fr?: string
  content_de?: string
  content_pt?: string
  includeRequirements: boolean
  isDefault: boolean
}) {
  try {
    // If setting as default, unset other defaults for same category
    if (data.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: {
          partnerCategory: data.partnerCategory,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const template = await prisma.contractTemplate.create({
      data: {
        name: data.name,
        partnerCategory: data.partnerCategory,
        content: data.content,
        content_en: data.content_en || null,
        content_it: data.content_it || null,
        content_fr: data.content_fr || null,
        content_de: data.content_de || null,
        content_pt: data.content_pt || null,
        includeRequirements: data.includeRequirements,
        isDefault: data.isDefault,
        isActive: true,
      },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: template }
  } catch (error) {
    console.error('Error creating contract template:', error)
    return { success: false, error: 'Error al crear la plantilla' }
  }
}

export async function updateContractTemplate(
  id: string,
  data: {
    name?: string
    partnerCategory?: string | null
    content?: string
    content_en?: string | null
    content_it?: string | null
    content_fr?: string | null
    content_de?: string | null
    content_pt?: string | null
    includeRequirements?: boolean
    isDefault?: boolean
    isActive?: boolean
    order?: number
  }
) {
  try {
    // If setting as default, unset other defaults for same category
    if (data.isDefault) {
      const currentTemplate = await prisma.contractTemplate.findUnique({
        where: { id },
        select: { partnerCategory: true },
      })
      if (currentTemplate) {
        await prisma.contractTemplate.updateMany({
          where: {
            partnerCategory: data.partnerCategory ?? currentTemplate.partnerCategory,
            isDefault: true,
            NOT: { id },
          },
          data: { isDefault: false },
        })
      }
    }

    const template = await prisma.contractTemplate.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: template }
  } catch (error) {
    console.error('Error updating contract template:', error)
    return { success: false, error: 'Error al actualizar la plantilla' }
  }
}

export async function deleteContractTemplate(id: string) {
  try {
    // Check if template has contracts
    const contractCount = await prisma.contract.count({
      where: { templateId: id },
    })

    if (contractCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar: hay ${contractCount} contrato(s) usando esta plantilla`,
      }
    }

    await prisma.contractTemplate.delete({
      where: { id },
    })

    revalidatePath('/admin/contracts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting contract template:', error)
    return { success: false, error: 'Error al eliminar la plantilla' }
  }
}

// ============================================
// CONTRACTS
// ============================================

export async function getContracts(filters?: {
  status?: string
  partnerId?: string
}) {
  try {
    const where: Record<string, unknown> = {}
    if (filters?.status) where.status = filters.status
    if (filters?.partnerId) where.partnerId = filters.partnerId

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            partnerCategory: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return { success: true, data: contracts }
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return { success: false, error: 'Error al obtener los contratos' }
  }
}

export async function createContractForPartner(
  partnerId: string,
  templateId: string
) {
  try {
    // Get the partner
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        address: true,
        partnerCategory: true,
      },
    })

    if (!partner) {
      return { success: false, error: 'Partner no encontrado' }
    }

    // Get the template
    const template = await prisma.contractTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return { success: false, error: 'Plantilla no encontrada' }
    }

    // Check if partner already has a pending or signed contract
    const existingContract = await prisma.contract.findFirst({
      where: {
        partnerId,
        status: { in: ['PENDING_SIGNATURE', 'SIGNED'] },
      },
    })

    if (existingContract) {
      return {
        success: false,
        error: 'El partner ya tiene un contrato activo o pendiente',
      }
    }

    // Replace variables in template content
    const today = new Date()
    let content = replaceTemplateVariables(template.content, {
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email,
      address: partner.address || '',
      date: today.toLocaleDateString('es-ES'),
      year: today.getFullYear().toString(),
    })

    // If template includes requirements, append them to the contract
    if (template.includeRequirements) {
      const reqResult = await getRequirementsForPartner(partnerId)
      if (reqResult.success && reqResult.data) {
        const req = reqResult.data
        const requirementsText = generateRequirementsText(req)
        content = content + '\n\n' + requirementsText
      }
    }

    // Create the contract
    const contract = await prisma.contract.create({
      data: {
        partnerId,
        templateId,
        content,
        status: 'PENDING_SIGNATURE',
      },
    })

    revalidatePath('/admin/contracts')
    revalidatePath('/partner')
    return { success: true, data: contract }
  } catch (error) {
    console.error('Error creating contract:', error)
    return { success: false, error: 'Error al crear el contrato' }
  }
}

export async function cancelContract(contractId: string) {
  try {
    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'CANCELLED' },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    console.error('Error cancelling contract:', error)
    return { success: false, error: 'Error al cancelar el contrato' }
  }
}

export async function getContractForPartner(partnerId: string) {
  try {
    // Get active or pending contract
    const contract = await prisma.contract.findFirst({
      where: {
        partnerId,
        status: { in: ['PENDING_SIGNATURE', 'SIGNED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        template: {
          select: { name: true },
        },
      },
    })
    return { success: true, data: contract }
  } catch (error) {
    console.error('Error fetching partner contract:', error)
    return { success: false, error: 'Error al obtener el contrato' }
  }
}

// ============================================
// PARTNER SIGNATURE
// ============================================

export async function signContract(
  contractId: string,
  signatureData: {
    signatoryName: string
    signatoryDni: string
    signatoryPosition: string
    companyCif: string
    companyAddress: string
    termsAccepted: boolean
    privacyAccepted: boolean
    dataProcessingAccepted: boolean
    ip: string
    userAgent: string
  }
) {
  try {
    // Validate all acceptances
    if (!signatureData.termsAccepted || !signatureData.privacyAccepted || !signatureData.dataProcessingAccepted) {
      return { success: false, error: 'Debe aceptar todos los términos' }
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { partner: true },
    })

    if (!contract) {
      return { success: false, error: 'Contrato no encontrado' }
    }

    if (contract.status !== 'PENDING_SIGNATURE') {
      return { success: false, error: 'El contrato no está pendiente de firma' }
    }

    const now = new Date()
    const validUntil = new Date(now)
    validUntil.setFullYear(validUntil.getFullYear() + 1) // 1 year validity

    // Update contract with signature data
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'SIGNED',
        signatoryName: signatureData.signatoryName,
        signatoryDni: signatureData.signatoryDni,
        signatoryPosition: signatureData.signatoryPosition,
        companyCif: signatureData.companyCif,
        companyAddress: signatureData.companyAddress,
        acceptanceData: JSON.stringify({
          termsAccepted: signatureData.termsAccepted,
          privacyAccepted: signatureData.privacyAccepted,
          dataProcessingAccepted: signatureData.dataProcessingAccepted,
        }),
        signedAt: now,
        signatureIp: signatureData.ip,
        signatureUserAgent: signatureData.userAgent,
        validFrom: now,
        validUntil,
      },
    })

    // Update partner's contractUrl field (marks requirement as complete)
    await prisma.partner.update({
      where: { id: contract.partnerId },
      data: {
        contractUrl: `/api/contracts/${contractId}/pdf`,
      },
    })

    revalidatePath('/admin/contracts')
    revalidatePath('/partner')
    revalidatePath('/partner/requirements')
    return { success: true, data: updatedContract }
  } catch (error) {
    console.error('Error signing contract:', error)
    return { success: false, error: 'Error al firmar el contrato' }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

function generateRequirementsText(req: {
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
  leadsLabel?: string | null
  prospectsLabel?: string | null
  clientsLabel?: string | null
  eventsLabel?: string | null
}): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push('ANEXO: REQUISITOS DEL PARTNER')
  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push('')
  lines.push('El Partner se compromete a cumplir con los siguientes requisitos')
  lines.push('durante el periodo de vigencia del presente contrato:')
  lines.push('')

  // Performance requirements
  lines.push('OBJETIVOS DE RENDIMIENTO ANUAL:')
  lines.push('───────────────────────────────────────────────────────────────')

  if (req.leadsPerYear > 0) {
    const label = req.leadsLabel || `Registrar ${req.leadsPerYear} leads cualificados`
    lines.push(`  • ${label}`)
  }

  if (req.prospectsPerYear > 0) {
    const label = req.prospectsLabel || `Convertir ${req.prospectsPerYear} leads a prospects`
    lines.push(`  • ${label}`)
  }

  if (req.clientsPerYear > 0) {
    const label = req.clientsLabel || `Cerrar ${req.clientsPerYear} clientes`
    lines.push(`  • ${label}`)
  }

  if (req.eventsPerYear > 0) {
    const label = req.eventsLabel || `Participar en ${req.eventsPerYear} evento(s) conjunto(s)`
    lines.push(`  • ${label}`)
  }

  lines.push('')

  // Other requirements
  const otherReqs: string[] = []
  if (req.certificationRequired) {
    otherReqs.push('Completar la certificacion oficial de Partner')
  }
  if (req.omniwalletRequired) {
    otherReqs.push('Mantener una cuenta activa de Omniwallet Partner')
  }

  if (otherReqs.length > 0) {
    lines.push('REQUISITOS ADICIONALES:')
    lines.push('───────────────────────────────────────────────────────────────')
    otherReqs.forEach(r => lines.push(`  • ${r}`))
    lines.push('')
  }

  lines.push('El incumplimiento reiterado de estos requisitos podra dar lugar')
  lines.push('a la revision de las condiciones del presente acuerdo.')
  lines.push('')
  lines.push('═══════════════════════════════════════════════════════════════')

  return lines.join('\n')
}

// Get default template for a partner category
export async function getDefaultTemplateForCategory(category: string) {
  try {
    // First try to find a default template for this specific category
    let template = await prisma.contractTemplate.findFirst({
      where: {
        partnerCategory: category,
        isDefault: true,
        isActive: true,
      },
    })

    // If not found, try to find a generic default (null category)
    if (!template) {
      template = await prisma.contractTemplate.findFirst({
        where: {
          partnerCategory: null,
          isDefault: true,
          isActive: true,
        },
      })
    }

    return { success: true, data: template }
  } catch (error) {
    console.error('Error fetching default template:', error)
    return { success: false, error: 'Error al obtener la plantilla' }
  }
}
