import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

// Disable caching to ensure badge always shows latest settings
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BadgePage({
  params,
  searchParams,
}: {
  params: { partnerId: string }
  searchParams: { theme?: string }
}) {
  const { partnerId } = params
  const theme = searchParams.theme || 'light'

  // Get partner with certification attempts
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      certificationAttempts: {
        where: { passed: true },
        orderBy: { score: 'desc' },
        take: 1,
      },
    },
  })

  if (!partner) {
    notFound()
  }

  // Get certification settings
  const settings = await prisma.certificationSettings.findFirst()

  // Check if certification is valid
  const isExpired = partner.certificationExpiresAt
    ? new Date(partner.certificationExpiresAt) < new Date()
    : false

  const isValid = partner.isCertified && !isExpired

  // Get best score
  const bestScore = partner.certificationAttempts[0]?.score || null

  // Format expiration date
  const expirationDate = partner.certificationExpiresAt
    ? new Date(partner.certificationExpiresAt).toLocaleDateString('es-ES')
    : null

  // Replace variables in hover text
  let hoverText = settings?.badgeHoverText || '{partnerName} está certificado por Omniwallet'
  hoverText = hoverText
    .replace('{partnerName}', partner.companyName)
    .replace('{expirationDate}', expirationDate || 'N/A')
    .replace('{score}', bestScore ? `${bestScore.toFixed(0)}%` : 'N/A')

  const badgeUrl = theme === 'dark'
    ? settings?.badgeDarkUrl
    : settings?.badgeLightUrl

  const landingUrl = partner.partnerLandingUrl || 'https://omniwallet.com'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <title>Omniwallet Certified Partner</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 8px;
          }
          .badge-wrapper {
            position: relative;
            display: inline-block;
          }
          .badge-link {
            display: inline-block;
            text-decoration: none;
          }
          .badge-image {
            height: 60px;
            width: auto;
            transition: transform 0.2s, opacity 0.2s;
          }
          .badge-image.expired {
            filter: grayscale(100%);
            opacity: 0.5;
          }
          .badge-link:hover .badge-image {
            transform: scale(1.05);
          }
          .tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            margin-bottom: 8px;
            z-index: 1000;
          }
          .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: #333;
          }
          .badge-wrapper:hover .tooltip {
            opacity: 1;
          }
          .expired-text {
            color: #dc2626;
          }
        `}</style>
      </head>
      <body>
        <div className="badge-wrapper">
          <a
            href={landingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="badge-link"
          >
            {badgeUrl ? (
              <img
                src={badgeUrl}
                alt={settings?.badgeAltText || 'Partner Certificado Omniwallet'}
                className={`badge-image ${!isValid ? 'expired' : ''}`}
              />
            ) : (
              <div style={{
                padding: '12px 24px',
                background: isValid ? '#16a34a' : '#6b7280',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                {isValid ? '✓ Partner Certificado' : 'Certificación Caducada'}
              </div>
            )}
          </a>
          <div className="tooltip">
            {!isValid ? (
              <span className="expired-text">Certificación caducada</span>
            ) : (
              hoverText
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
