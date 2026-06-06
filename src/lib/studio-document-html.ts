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

function formatPayloadValue(value: string) {
  const clean = String(value || "").trim();
  const lines = clean
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return `<ul>${lines.map((line) => `<li>${esc(line.replace(/^[-•]\s*/, ""))}</li>`).join("")}</ul>`;
  }

  return esc(clean);
}

function payloadRows(payload: Record<string, string>) {
  const rows = Object.entries(payload).filter(([, value]) => String(value || "").trim());
  if (!rows.length) {
    return '<div class="doc-note">Documento criado com presets. Complete apenas o que for necessario para esta producao.</div>';
  }

  return rows
    .map(
      ([label, value], index) => `
        <article class="doc-block">
          <div class="doc-block-number">${String(index + 1).padStart(2, "0")}</div>
          <div>
            <div class="doc-block-label">${esc(label)}</div>
            <div class="doc-block-value">${formatPayloadValue(value)}</div>
          </div>
        </article>`,
    )
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
    body{margin:0;background:#ebe7df;color:#151515;font-family:Arial,Helvetica,sans-serif}
    .doc-page{max-width:900px;min-height:100vh;margin:0 auto;padding:46px;background:#f8f6f0}
    .doc-header{display:grid;grid-template-columns:1fr 220px;gap:28px;align-items:start;padding-bottom:24px;border-bottom:4px solid ${input.docColor}}
    .doc-kicker{font-size:10px;color:${input.docColor};font-weight:900;letter-spacing:.2em;text-transform:uppercase}
    .doc-title{margin:10px 0 12px;font-size:38px;line-height:1;font-weight:900;color:#111;letter-spacing:-.02em}
    .doc-muted{color:#5f5f5f;line-height:1.55;font-size:13px;max-width:600px}
    .doc-brand{display:grid;justify-items:end;gap:10px;text-align:right;font-size:10px;color:#5f5f5f;text-transform:uppercase;letter-spacing:.12em;font-weight:900;line-height:1.5}
    .doc-logo{max-width:132px;max-height:62px;object-fit:contain}
    .doc-logo-fallback{display:grid;width:58px;height:58px;place-items:center;border-radius:16px;background:${input.docColor};color:#111;font-size:24px;font-weight:900}
    .doc-slate{margin-top:22px;padding:16px;border:1px solid #ded8cf;background:#fffdf8}
    .doc-slate-title{font-size:10px;color:#777;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px}
    .doc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .doc-field{border:1px solid #e3ddd4;background:#fffaf1;padding:12px;min-height:68px}
    .doc-field-label{font-size:9px;color:#777;font-weight:900;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
    .doc-field-value{font-size:12px;color:#171717;font-weight:800;line-height:1.45;white-space:pre-wrap;word-break:break-word}
    .doc-section{margin-top:26px}
    .doc-section-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #d8d1c6}
    .doc-section h2{margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:${input.docColor}}
    .doc-section small{color:#777;font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:900}
    .doc-list{display:grid;gap:10px}
    .doc-block{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:14px;border:1px solid #ded8cf;background:#fffdf8;break-inside:avoid}
    .doc-block-number{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#151515;color:${input.docColor};font-size:10px;font-weight:900;letter-spacing:.12em}
    .doc-block-label{font-size:10px;color:#777;font-weight:900;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px}
    .doc-block-value{font-size:13px;color:#181818;font-weight:700;line-height:1.55;white-space:pre-wrap}
    .doc-block-value ul{margin:0;padding-left:18px;display:grid;gap:5px}
    .doc-block-value li{padding-left:2px}
    .doc-note{font-size:12px;line-height:1.5;padding:12px 14px;border-left:4px solid ${input.docColor};background:#fffdf8;font-weight:700}
    .doc-signature{margin-top:34px;display:grid;gap:10px;max-width:380px;margin-left:auto}
    .doc-sign-line{height:1px;background:#1a1a1a;width:100%}
    .doc-sign-text{white-space:pre-wrap;color:#4e4e4e;font-size:12px;line-height:1.5;font-weight:800;text-align:right}
    .doc-footer{margin-top:42px;padding-top:18px;border-top:1px solid #d8cec0;display:flex;justify-content:space-between;gap:24px;color:#777;font-size:10px;text-transform:uppercase;letter-spacing:.1em;font-weight:900}
    @media print{body{background:#fff}.doc-page{max-width:none;padding:30px;background:#fff}.doc-section,.doc-block{break-inside:avoid}.doc-grid{grid-template-columns:1fr 1fr}.doc-header{grid-template-columns:1fr 180px}}
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

    <section class="doc-slate">
      <div class="doc-slate-title">Ficha de produção</div>
      <div class="doc-grid">
        <div class="doc-field"><div class="doc-field-label">Cliente</div><div class="doc-field-value">${esc(input.clientName)}</div></div>
        <div class="doc-field"><div class="doc-field-label">Projeto</div><div class="doc-field-value">${esc(input.projectTitle)}</div></div>
        <div class="doc-field"><div class="doc-field-label">Base audiovisual</div><div class="doc-field-value">${esc(input.presetTitle)}</div></div>
        <div class="doc-field"><div class="doc-field-label">Produtora</div><div class="doc-field-value">${esc(brand.name)}</div></div>
        <div class="doc-field"><div class="doc-field-label">Contato</div><div class="doc-field-value">${esc(contact || "Contato nao informado")}</div></div>
        <div class="doc-field"><div class="doc-field-label">Fiscal/Banco</div><div class="doc-field-value">${esc([brand.fiscalInfo, brand.bankInfo].filter(Boolean).join("\n") || "Dados sob demanda")}</div></div>
      </div>
    </section>

    <section class="doc-section">
      <div class="doc-section-head">
        <h2>Plano do documento</h2>
        <small>${esc(input.docLabel)} · ${generatedAt}</small>
      </div>
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
