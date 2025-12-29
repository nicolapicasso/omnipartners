import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/badge/[partnerId] - Returns badge data as JSON
export async function GET(
  request: Request,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { partnerId } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') // 'json' or 'js'
    const theme = searchParams.get('theme') || 'light' // 'light' or 'dark'

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
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
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

    const badgeData = {
      partnerId: partner.id,
      partnerName: partner.companyName,
      isCertified: partner.isCertified,
      isValid,
      isExpired,
      certifiedAt: partner.certifiedAt,
      expiresAt: partner.certificationExpiresAt,
      bestScore,
      badgeUrl: badgeUrl || null,
      hoverText,
      altText: settings?.badgeAltText || 'Partner Certificado Omniwallet',
      landingUrl: partner.partnerLandingUrl || null,
      website: partner.website || null,
    }

    // If format is 'js', return JavaScript
    if (format === 'js') {
      const referer = request.headers.get('referer') || ''
      const origin = request.headers.get('origin') || ''

      // Domain validation (good faith - check if domain matches partner website)
      let domainValid = true
      if (partner.website) {
        try {
          const partnerDomain = new URL(partner.website).hostname.replace('www.', '')
          const requestDomain = referer
            ? new URL(referer).hostname.replace('www.', '')
            : origin
              ? new URL(origin).hostname.replace('www.', '')
              : ''

          domainValid = !requestDomain || requestDomain.includes(partnerDomain) || partnerDomain.includes(requestDomain)
        } catch {
          domainValid = true // If URL parsing fails, allow it
        }
      }

      const effectiveValid = isValid && domainValid
      const displayStatus = !effectiveValid ? 'expired' : 'valid'

      const jsCode = `
(function() {
  var badgeData = ${JSON.stringify({
    ...badgeData,
    isValid: effectiveValid,
    status: displayStatus,
  })};

  var container = document.currentScript.parentElement;
  if (!container) {
    container = document.body;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'omniwallet-badge-wrapper';
  wrapper.style.cssText = 'display:inline-block;position:relative;';

  var link = document.createElement('a');
  link.href = badgeData.landingUrl || 'https://omniwallet.com';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.cssText = 'display:inline-block;text-decoration:none;';

  var img = document.createElement('img');
  img.src = badgeData.badgeUrl || '';
  img.alt = badgeData.altText;
  img.style.cssText = 'height:60px;width:auto;transition:opacity 0.2s;' +
    (badgeData.status === 'expired' ? 'filter:grayscale(100%);opacity:0.5;' : '');

  var tooltip = document.createElement('div');
  tooltip.className = 'omniwallet-badge-tooltip';
  tooltip.textContent = badgeData.status === 'expired'
    ? 'Certificación caducada'
    : badgeData.hoverText;
  tooltip.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);' +
    'background:#333;color:#fff;padding:8px 12px;border-radius:4px;font-size:12px;' +
    'white-space:nowrap;opacity:0;transition:opacity 0.2s;pointer-events:none;margin-bottom:8px;z-index:1000;';

  wrapper.onmouseenter = function() { tooltip.style.opacity = '1'; };
  wrapper.onmouseleave = function() { tooltip.style.opacity = '0'; };

  link.appendChild(img);
  wrapper.appendChild(link);
  wrapper.appendChild(tooltip);
  container.appendChild(wrapper);
})();
`

      return new NextResponse(jsCode, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Default: return JSON
    return NextResponse.json(badgeData, {
      headers: {
        'Cache-Control': 'no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Error fetching badge data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
