import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        partner: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
    }

    if (contract.status !== 'SIGNED') {
      return NextResponse.json({ error: 'El contrato no ha sido firmado' }, { status: 400 })
    }

    // Generate HTML document for printing/saving as PDF
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato - ${contract.partner.companyName}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    .header h1 {
      font-size: 18pt;
      margin: 0 0 10px 0;
      color: #1a1a1a;
    }
    .header p {
      font-size: 10pt;
      color: #666;
      margin: 5px 0;
    }
    .contract-info {
      background: #f9f9f9;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .contract-info table {
      width: 100%;
      border-collapse: collapse;
    }
    .contract-info td {
      padding: 5px 10px;
      font-size: 10pt;
    }
    .contract-info td:first-child {
      font-weight: bold;
      width: 150px;
      color: #555;
    }
    .content {
      white-space: pre-wrap;
      font-size: 11pt;
      margin: 30px 0;
      text-align: justify;
    }
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #ccc;
    }
    .signature-section h3 {
      font-size: 14pt;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .signature-box {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .signature-box h4 {
      font-size: 11pt;
      margin: 0 0 10px 0;
      color: #555;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .signature-box p {
      font-size: 10pt;
      margin: 5px 0;
    }
    .signature-box .label {
      color: #777;
      font-size: 9pt;
    }
    .signature-box .value {
      font-weight: bold;
      color: #333;
    }
    .legal-note {
      margin-top: 40px;
      padding: 15px;
      background: #f5f5f5;
      border-left: 3px solid #666;
      font-size: 9pt;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 9pt;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE COLABORACION</h1>
    <p>${contract.template?.name || 'Contrato de Partnership'}</p>
    <p>Referencia: ${contract.id.substring(0, 8).toUpperCase()}</p>
  </div>

  <div class="contract-info">
    <table>
      <tr>
        <td>Partner:</td>
        <td>${contract.partner.companyName}</td>
      </tr>
      <tr>
        <td>Contacto:</td>
        <td>${contract.partner.contactName}</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td>${contract.partner.email}</td>
      </tr>
      <tr>
        <td>Estado:</td>
        <td><strong style="color: green;">FIRMADO</strong></td>
      </tr>
      <tr>
        <td>Fecha de firma:</td>
        <td>${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</td>
      </tr>
      <tr>
        <td>Valido desde:</td>
        <td>${contract.validFrom ? new Date(contract.validFrom).toLocaleDateString('es-ES') : 'N/A'}</td>
      </tr>
      <tr>
        <td>Valido hasta:</td>
        <td>${contract.validUntil ? new Date(contract.validUntil).toLocaleDateString('es-ES') : 'N/A'}</td>
      </tr>
    </table>
  </div>

  <div class="content">${escapeHtml(contract.content)}</div>

  <div class="signature-section">
    <h3>Datos de la Firma Digital</h3>
    <div class="signature-grid">
      <div class="signature-box">
        <h4>Firmante</h4>
        <p><span class="label">Nombre:</span> <span class="value">${contract.signatoryName || 'N/A'}</span></p>
        <p><span class="label">DNI/NIE:</span> <span class="value">${contract.signatoryDni || 'N/A'}</span></p>
        <p><span class="label">Cargo:</span> <span class="value">${contract.signatoryPosition || 'N/A'}</span></p>
      </div>
      <div class="signature-box">
        <h4>Empresa</h4>
        <p><span class="label">CIF:</span> <span class="value">${contract.companyCif || 'N/A'}</span></p>
        <p><span class="label">Direccion:</span> <span class="value">${contract.companyAddress || 'N/A'}</span></p>
      </div>
    </div>
  </div>

  <div class="legal-note">
    <strong>Nota Legal:</strong> Este documento ha sido firmado electronicamente el dia ${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('es-ES') : 'N/A'}
    a las ${contract.signedAt ? new Date(contract.signedAt).toLocaleTimeString('es-ES') : 'N/A'}.
    La firma electronica tiene la misma validez legal que una firma manuscrita segun la legislacion vigente.
    ${contract.signatureIp ? `IP: ${contract.signatureIp}` : ''}
  </div>

  <div class="footer">
    <p>Documento generado automaticamente por OmniPartners</p>
    <p>Este documento es una copia del contrato firmado digitalmente</p>
  </div>

  <script class="no-print">
    // Auto-trigger print dialog for PDF generation
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating contract PDF:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
