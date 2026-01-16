import { createTransport, Transporter } from 'nodemailer'

// ============================================
// EMAIL CONFIGURATION
// ============================================

interface EmailConfig {
  host: string
  port: number
  user: string
  password: string
  fromEmail: string
  fromName: string
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  // If no SMTP host is configured, email is disabled
  if (!host) {
    return null
  }

  return {
    host,
    port: parseInt(port || '587', 10),
    user: user || '',
    password: password || '',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@omnipartners.com',
    fromName: process.env.SMTP_FROM_NAME || 'Omniwallet Partners',
  }
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) {
    return transporter
  }

  const config = getEmailConfig()
  if (!config) {
    return null
  }

  transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user ? {
      user: config.user,
      pass: config.password,
    } : undefined,
  })

  return transporter
}

// ============================================
// EMAIL TEMPLATES
// ============================================

interface AffiliateApprovalEmailData {
  recipientEmail: string
  recipientName: string
  companyName: string
  temporaryPassword: string
  parentPartnerName: string
  loginUrl: string
}

function getAffiliateApprovalEmailHtml(data: AffiliateApprovalEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Omniwallet Partners</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0a2540 0%, #1a365d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Omniwallet Partners</h1>
    <p style="color: #a0aec0; margin: 10px 0 0;">Tu cuenta de afiliado ha sido aprobada</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 20px;">Hola <strong>${data.recipientName}</strong>,</p>

    <p style="margin: 0 0 20px;">
      ¡Excelentes noticias! Tu cuenta de afiliado para <strong>${data.companyName}</strong> ha sido aprobada.
      Ahora formas parte de la red de partners de <strong>${data.parentPartnerName}</strong>.
    </p>

    <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px; color: #2d3748; font-size: 16px;">Tus credenciales de acceso:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #718096;">Email:</td>
          <td style="padding: 8px 0; font-family: monospace; background: #edf2f7; padding: 8px; border-radius: 4px;">
            ${data.recipientEmail}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Contraseña:</td>
          <td style="padding: 8px 0; font-family: monospace; background: #edf2f7; padding: 8px; border-radius: 4px;">
            ${data.temporaryPassword}
          </td>
        </tr>
      </table>
    </div>

    <div style="background: #fefcbf; border: 1px solid #f6e05e; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #744210; font-size: 14px;">
        <strong>Importante:</strong> Esta es una contraseña temporal. Te recomendamos cambiarla la primera vez que inicies sesión.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #0a2540 0%, #1a365d 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Iniciar Sesión
      </a>
    </div>

    <p style="margin: 20px 0 0; color: #718096; font-size: 14px;">
      ¿Necesitas ayuda? Responde a este email o contacta con tu partner principal.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Omniwallet Partners. Todos los derechos reservados.</p>
  </div>
</body>
</html>
  `
}

function getAffiliateApprovalEmailText(data: AffiliateApprovalEmailData): string {
  return `
Bienvenido a Omniwallet Partners

Hola ${data.recipientName},

¡Excelentes noticias! Tu cuenta de afiliado para ${data.companyName} ha sido aprobada.
Ahora formas parte de la red de partners de ${data.parentPartnerName}.

Tus credenciales de acceso:
- Email: ${data.recipientEmail}
- Contraseña: ${data.temporaryPassword}

IMPORTANTE: Esta es una contraseña temporal. Te recomendamos cambiarla la primera vez que inicies sesión.

Accede al portal: ${data.loginUrl}

¿Necesitas ayuda? Responde a este email o contacta con tu partner principal.

© ${new Date().getFullYear()} Omniwallet Partners. Todos los derechos reservados.
  `.trim()
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

export async function sendAffiliateApprovalEmail(data: AffiliateApprovalEmailData): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter()
  const config = getEmailConfig()

  if (!transport || !config) {
    console.log('[Email] SMTP not configured - skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await transport.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: data.recipientEmail,
      subject: '¡Tu cuenta de afiliado ha sido aprobada! - Omniwallet Partners',
      text: getAffiliateApprovalEmailText(data),
      html: getAffiliateApprovalEmailHtml(data),
    })

    console.log(`[Email] Affiliate approval email sent to ${data.recipientEmail}`)
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send affiliate approval email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Utility to check if email is configured
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null
}
