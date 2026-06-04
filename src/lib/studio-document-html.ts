import { presetById, studioDocById } from "@/lib/constants";
import { getClientName, type BusinessProfile, type StudioDocumentRecord, type WorkspaceState } from "@/lib/workspace-state";

type StudioDocumentHtmlInput = {
  businessProfile: BusinessProfile;
  docLabel: string;
  docColor: string;
  title: string;
  subtitle: string;
  clientName: string;
  projectTitle: string;
  presetTitle: string;
  payload: Record<string, string>;
};

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function payloadRows(payload: Record<string, string>) {
  const rows = Object.entries(payload).filter(([, value]) => String(value || "").trim());
  if (!rows.length) {
    return '<div class="doc-item">Documento criado com presets. Complete apenas o que for necessario para esta producao.</div>';
  }

  return rows
    .map(([label, value]) => `<div class="doc-field"><div class="doc-field-label">${esc(label)}</div><div class="doc-field-value">${esc(value)}</div></div>`)
    .join("");
}

export function buildStudioDocumentHtml(input: StudioDocumentHtmlInput) {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const brand = input.businessProfile;
  const logo = brand.logoUrl
    ? `<img class="doc-logo" src="${esc(brand.logoUrl)}" alt="Logo ${esc(brand.name)}" />`
    : `<div class="doc-logo-fallback">${esc(brand.name.slice(0, 1) || "N")}</div>`;
  const contact = [brand.email, brand.phone, brand.siteUrl, brand.socialInstagram].filter(Boolean).join(" · ");
  const footerDetails = [brand.legalName, brand.documentNumber, brand.address].filter(Boolean).join(" · ");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${esc(input.docLabel)} - ${esc(input.projectTitle)}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f6f1e8;color:#161616;font-family:Arial,sans-serif}
    .doc-page{max-width:860px;min-height:100vh;margin:0 auto;padding:44px;background:#f6f1e8}
    .doc-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:22px;border-bottom:3px solid ${input.docColor}}
    .doc-kicker{font-size:10px;color:${input.docColor};font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .doc-title{margin:10px 0 12px;font-size:40px;line-height:.96;font-weight:900;color:#111}
    .doc-muted{color:#626262;line-height:1.48;font-size:13px}
    .doc-brand{display:grid;justify-items:end;gap:9px;text-align:right;font-size:11px;color:#626262;text-transform:uppercase;letter-spacing:.12em;font-weight:900;line-height:1.5}
    .doc-logo{max-width:124px;max-height:58px;object-fit:contain}
    .doc-logo-fallback{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:${input.docColor};color:#111;font-size:24px;font-weight:900}
    .doc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:22px}
    .doc-field{border:1px solid #ddd4c8;background:#fffdf8;padding:11px}
    .doc-field-label{font-size:9px;color:#848484;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
    .doc-field-value{font-size:12px;color:#1a1a1a;font-weight:700;line-height:1.45;white-space:pre-wrap}
    .doc-section{margin-top:26px;padding-top:16px;border-top:1px solid #d8cec0}
    .doc-section h2{margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:${input.docColor}}
    .doc-list{display:grid;gap:7px}
    .doc-item{font-size:12px;line-height:1.5;padding:10px 12px;border-left:3px solid ${input.docColor};background:#fffdf8}
    .doc-signature{margin-top:30px;display:grid;gap:10px;max-width:360px}
    .doc-sign-line{height:1px;background:#1a1a1a;width:100%}
    .doc-sign-text{white-space:pre-wrap;color:#4e4e4e;font-size:12px;line-height:1.5;font-weight:700}
    .doc-footer{margin-top:42px;padding-top:18px;border-top:1px solid #d8cec0;display:flex;justify-content:space-between;gap:24px;color:#777;font-size:11px}
    @media print{body{background:#fff}.doc-page{max-width:none;padding:32px}.doc-section{break-inside:avoid}.doc-grid{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <main class="doc-page">
    <header class="doc-header">
      <div>
        <div class="doc-kicker">NEXO Studio · ${esc(input.docLabel)}</div>
        <h1 class="doc-title">${esc(input.title)}</h1>
        <div class="doc-muted">${esc(input.subtitle)}</div>
      </div>
      <div class="doc-brand">${logo}<div>${esc(brand.name)}<br>${esc(input.clientName)}<br>${generatedAt}</div></div>
    </header>

    <section class="doc-grid">
      <div class="doc-field"><div class="doc-field-label">Cliente</div><div class="doc-field-value">${esc(input.clientName)}</div></div>
      <div class="doc-field"><div class="doc-field-label">Projeto</div><div class="doc-field-value">${esc(input.projectTitle)}</div></div>
      <div class="doc-field"><div class="doc-field-label">Base audiovisual</div><div class="doc-field-value">${esc(input.presetTitle)}</div></div>
      <div class="doc-field"><div class="doc-field-label">Produtora</div><div class="doc-field-value">${esc(brand.name)}</div></div>
      <div class="doc-field"><div class="doc-field-label">Contato</div><div class="doc-field-value">${esc(contact || "Contato nao informado")}</div></div>
      <div class="doc-field"><div class="doc-field-label">Fiscal/Banco</div><div class="doc-field-value">${esc([brand.fiscalInfo, brand.bankInfo].filter(Boolean).join("\n") || "Dados sob demanda")}</div></div>
    </section>

    <section class="doc-section">
      <h2>Informacoes principais</h2>
      <div class="doc-list">${payloadRows(input.payload)}</div>
    </section>

    <section class="doc-signature">
      <div class="doc-sign-line"></div>
      <div class="doc-sign-text">${esc(brand.defaultSignature || brand.name)}</div>
    </section>

    <footer class="doc-footer">
      <div>${esc(footerDetails || brand.name)} · Documento operacional</div>
      <div>Gerado pelo NEXO Studio OS</div>
    </footer>
  </main>
</body>
</html>`;
}

export function buildStudioDocumentHtmlFromRecord(state: WorkspaceState, record: StudioDocumentRecord) {
  if (record.html) return record.html;

  const doc = studioDocById(record.docType);
  const preset = presetById(record.presetId);
  const project = state.projects.find((item) => item.id === record.projectId);
  const clientName = getClientName(state, record.clientId || project?.clientId);

  return buildStudioDocumentHtml({
    businessProfile: state.businessProfile,
    docLabel: doc.label,
    docColor: doc.color,
    title: record.title,
    subtitle: doc.description,
    clientName,
    projectTitle: project?.title || preset.title,
    presetTitle: preset.title,
    payload: record.payload,
  });
}
