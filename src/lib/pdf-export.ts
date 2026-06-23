"use client";

import html2pdf from "html2pdf.js";
import type { BusinessProfile } from "@/lib/workspace-state";

interface PdfOptions {
  filename: string;
  businessProfile: BusinessProfile;
  title: string;
  subtitle?: string;
  contentHtml: string;
  watermark?: string;
}

function buildPdfTemplate(options: PdfOptions): string {
  const { businessProfile, title, subtitle, contentHtml, watermark } = options;

  const logoSection = businessProfile.logoUrl 
    ? `<img src="${businessProfile.logoUrl}" alt="${businessProfile.name}" style="max-height:48px;max-width:160px;object-fit:contain;" />`
    : `<div style="font-size:24px;font-weight:900;color:#f97316;">${businessProfile.name}</div>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
    color: #1a1a1a; 
    line-height: 1.6; 
    font-size: 11pt;
    background: white;
  }
  .page { 
    width: 210mm; 
    min-height: 297mm; 
    padding: 0; 
    position: relative;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* Header */
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding-bottom: 16px; 
    border-bottom: 2px solid #f97316;
    margin-bottom: 24px;
  }
  .header-info { text-align: right; font-size: 9pt; color: #666; }
  .header-info div { margin-bottom: 2px; }

  /* Title */
  .doc-title { 
    font-size: 22pt; 
    font-weight: 900; 
    color: #1a1a1a; 
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }
  .doc-subtitle { 
    font-size: 11pt; 
    color: #f97316; 
    font-weight: 600; 
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Content */
  .content { 
    font-size: 10.5pt; 
    line-height: 1.7;
    color: #333;
  }
  .content h2 { 
    font-size: 13pt; 
    font-weight: 700; 
    color: #1a1a1a; 
    margin-top: 24px; 
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e5e5;
  }
  .content h3 { 
    font-size: 11pt; 
    font-weight: 700; 
    color: #333; 
    margin-top: 16px; 
    margin-bottom: 8px;
  }
  .content p { margin-bottom: 12px; }
  .content ul { margin-bottom: 12px; padding-left: 20px; }
  .content li { margin-bottom: 4px; }
  .content strong { color: #1a1a1a; }
  .content table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 16px 0; 
    font-size: 10pt;
  }
  .content th { 
    background: #f97316; 
    color: white; 
    padding: 8px 12px; 
    text-align: left; 
    font-weight: 600;
  }
  .content td { 
    padding: 8px 12px; 
    border-bottom: 1px solid #e5e5e5; 
  }
  .content tr:nth-child(even) { background: #fafafa; }

  /* Signature block */
  .signature-block { 
    margin-top: 48px; 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 40px;
  }
  .signature-line { 
    border-top: 1px solid #333; 
    padding-top: 8px; 
    margin-top: 48px;
    font-size: 9pt;
    color: #666;
  }

  /* Footer */
  .footer { 
    position: fixed; 
    bottom: 0; 
    left: 0; 
    right: 0; 
    padding: 12px 18mm; 
    font-size: 8pt; 
    color: #999;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand { font-weight: 700; color: #f97316; }

  /* Watermark */
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 60pt;
    font-weight: 900;
    color: rgba(249, 115, 22, 0.08);
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
  }

  /* Cover page */
  .cover { 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    min-height: 257mm;
    text-align: center;
  }
  .cover-logo { margin-bottom: 32px; }
  .cover-title { font-size: 28pt; font-weight: 900; color: #1a1a1a; margin-bottom: 8px; }
  .cover-subtitle { font-size: 12pt; color: #f97316; font-weight: 600; }
  .cover-meta { 
    margin-top: 48px; 
    font-size: 10pt; 
    color: #666; 
    line-height: 2;
  }

  /* Price table */
  .price-table { 
    width: 100%; 
    margin: 24px 0; 
    border: 1px solid #e5e5e5;
  }
  .price-table .total-row { 
    background: #f97316; 
    color: white; 
    font-weight: 700;
  }
  .price-table .total-row td { border: none; }
</style>
</head>
<body>
  ${watermark ? `<div class="watermark">${watermark}</div>` : ''}

  <div class="page">
    <div class="header">
      <div>${logoSection}</div>
      <div class="header-info">
        <div><strong>${businessProfile.name}</strong></div>
        <div>${businessProfile.email}</div>
        <div>${businessProfile.phone}</div>
        <div>${businessProfile.siteUrl}</div>
      </div>
    </div>

    <div class="doc-title">${title}</div>
    ${subtitle ? `<div class="doc-subtitle">${subtitle}</div>` : ''}

    <div class="content">
      ${contentHtml}
    </div>

    <div class="footer">
      <span class="footer-brand">${businessProfile.name}</span>
      <span>Documento gerado via NEXO Studio OS — ${new Date().toLocaleDateString('pt-BR')}</span>
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  </div>
</body>
</html>`;
}

export async function generatePdf(options: PdfOptions): Promise<void> {
  const html = buildPdfTemplate(options);

  const opt = {
    margin: [0, 0, 0, 0],
    filename: options.filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
    },
  };

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(element);
  }
}

export async function generatePdfBlob(options: PdfOptions): Promise<Blob> {
  const html = buildPdfTemplate(options);

  const opt = {
    margin: [0, 0, 0, 0],
    filename: options.filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  try {
    const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
    return pdf;
  } finally {
    document.body.removeChild(element);
  }
}
