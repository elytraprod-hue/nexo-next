"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, History, Plus, Save, Sparkles, Wand2, X } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, DOC_FIELD_CONFIG, STUDIO_DOCUMENTS, type StudioDocId, presetById, studioDocById } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { getClientName } from "@/lib/workspace-state";
import { buildStudioDocumentHtml } from "@/lib/studio-document-html";

type Payload = Record<string, string>;

export function StudioDocsPage() {
  const { state, actions } = useWorkspaceState();
  const searchParams = useSearchParams();
  const [docType, setDocType] = useState<StudioDocId>("briefing");
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "");
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? "");
  const [presetId, setPresetId] = useState("institucional");
  const [payload, setPayload] = useState<Payload>({});
  const [latestId, setLatestId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const doc = studioDocById(docType);
  const config = DOC_FIELD_CONFIG[docType];
  const preset = presetById(presetId);
  const project = state.projects.find((item) => item.id === projectId);
  const selectedDocument = state.documents.find((item) => item.id === (selectedDocumentId || latestId || state.documents[0]?.id)) ?? null;
  const clientName = getClientName(state, clientId || project?.clientId);
  const restoredDocument = useMemo(() => {
    const documentId = searchParams.get("document");
    return documentId ? state.documents.find((item) => item.id === documentId) ?? null : null;
  }, [searchParams, state.documents]);

  useEffect(() => {
    if (!restoredDocument) return;

    setDocType(restoredDocument.docType);
    setClientId(restoredDocument.clientId ?? "");
    setProjectId(restoredDocument.projectId ?? "");
    setPresetId(restoredDocument.presetId);
    setPayload(restoredDocument.payload);
    setLatestId(restoredDocument.id);
  }, [restoredDocument]);

  const previewHtml = useMemo(
    () =>
      buildStudioDocumentHtml({
        businessProfile: state.businessProfile,
        docLabel: doc.label,
        docColor: doc.color,
        title: project?.title || `${doc.label} · ${preset.title}`,
        subtitle: config.tone,
        clientName,
        projectTitle: project?.title || preset.title,
        presetTitle: preset.title,
        payload,
      }),
    [clientName, config.tone, doc.color, doc.label, payload, preset.title, project?.title, state.businessProfile],
  );

  function setPayloadValue(key: string, value: string) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  function chooseProject(nextProjectId: string) {
    const nextProject = state.projects.find((item) => item.id === nextProjectId);
    setProjectId(nextProjectId);
    if (nextProject) {
      setClientId(nextProject.clientId);
      setPresetId(nextProject.presetId);
    }
  }

  function generateDocument() {
    const record = actions.saveDocument({
      docType,
      clientId,
      projectId,
      presetId,
      payload,
    });
    setLatestId(record.id);
    setSelectedDocumentId(record.id);
    setComposerOpen(false);
  }

  function prefillCommercialProposal() {
    const activeProject = state.projects.find((item) => item.id === projectId) ?? state.projects[0];
    const activePreset = presetById(activeProject?.presetId || presetId);
    const activeClientId = activeProject?.clientId || clientId || state.clients[0]?.id || "";

    if (activeProject) {
      setProjectId(activeProject.id);
      setClientId(activeProject.clientId);
      setPresetId(activeProject.presetId);
    } else if (activeClientId) {
      setClientId(activeClientId);
    }

    setDocType("proposta");
    setPayload({
      Investimento: String(activeProject?.budget || activePreset.value || ""),
      Condições: "50% na aprovação da proposta e 50% na entrega final.",
      Validade: "",
      "Próximo passo": "Aprovar proposta, confirmar briefing e iniciar pré-produção.",
      "Prazo de produção": activeProject?.deliveryDate ? `Entrega prevista em ${new Date(activeProject.deliveryDate).toLocaleDateString("pt-BR")}` : "Prazo definido após briefing aprovado.",
      "Rodadas inclusas": "2 rodadas de ajustes inclusas após o primeiro corte.",
      "Escopo incluído": activeProject?.briefing || `${activePreset.service} para ${activePreset.defaultBriefing.objective}`,
      Entregáveis: activePreset.deliverables.join("\n"),
      "Fluxo de produção": "Briefing\nPré-produção\nCaptação\nEdição\nRevisão com link público\nEntrega final",
      "Extras e premissas": "Deslocamento, urgência, novas diárias, mídia paga, locações e alterações fora do escopo podem ser orçados à parte.",
    });
    setComposerOpen(true);
  }

  function exportPdf(html = previewHtml) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    window.setTimeout(() => printWindow.print(), 500);
  }

  return (
    <AppShell
      eyebrow="Studio Docs"
      primaryAction={{ href: "/projetos", label: "Novo projeto" }}
      subtitle="Documentos pensados para audiovisual, com campos próprios e histórico salvo."
      title="Documentos"
    >
      <section className="flex flex-col gap-3 rounded-[18px] border border-white/[0.075] bg-white/[0.026] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <Badge color="var(--cyan)">Biblioteca da produtora</Badge>
          <h2 className="mt-2 text-xl font-black leading-tight">Documentos, propostas e PDFs em um só lugar.</h2>
          <p className="mt-1 max-w-3xl text-sm font-bold leading-6 text-zinc-500">
            Selecione um histórico, monte uma proposta com dados da empresa ou abra a janela para criar outro documento.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="success" onClick={prefillCommercialProposal}>
            <Wand2 size={17} />
            Proposta comercial
          </Button>
          <Button variant="ghost" onClick={() => setComposerOpen(true)}>
            <Plus size={17} />
            Novo documento
          </Button>
        </div>
      </section>

      {composerOpen ? (
        <div className="workspace-overlay fixed inset-0 z-50 grid place-items-center p-3 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Criar documento">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto">
            <Surface className="workspace-window border-cyan-300/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge color={doc.color}>{doc.label}</Badge>
                <h2 className="mt-3 text-2xl font-black">{config.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{config.tone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateDocument}>
                  <Save size={17} />
                  Salvar no histórico
                </Button>
                <Button variant="ghost" onClick={() => exportPdf(previewHtml)}>
                  <Download size={17} />
                  Exportar PDF
                </Button>
                <button className="premium-control grid size-11 place-items-center rounded-lg text-zinc-400 hover:text-white" type="button" onClick={() => setComposerOpen(false)} aria-label="Fechar documento">
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.032] p-4">
              <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Tipo de documento
                  <select
                    className="focus-ring min-h-12 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                    value={docType}
                    onChange={(event) => {
                      setDocType(event.target.value as StudioDocId);
                      setPayload({});
                    }}
                  >
                    {STUDIO_DOCUMENTS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-10 rounded-full" style={{ background: doc.color }} />
                    <p className="text-sm font-black text-white">{doc.label}</p>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">{doc.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Base do documento</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Escolha cliente, projeto e tipo de produção. O restante do documento usa essas escolhas como contexto.</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Cliente
                <select
                  className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                >
                  {state.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Projeto
                <select
                  className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                  value={projectId}
                  onChange={(event) => chooseProject(event.target.value)}
                >
                  {state.projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Base
                <select
                  className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                  value={presetId}
                  onChange={(event) => setPresetId(event.target.value)}
                >
                  {AUDIOVISUAL_PRESETS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Informações específicas</p>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {config.fields.map((field) => (
                  <label key={field.key} className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    {field.label}
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                      placeholder={field.placeholder}
                      type={field.type ?? "text"}
                      value={payload[field.label] ?? ""}
                      onChange={(event) => setPayloadValue(field.label, event.target.value)}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {config.areas.map((area) => (
                  <label key={area.key} className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    {area.label}
                    <textarea
                      className="focus-ring min-h-36 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                      placeholder={area.placeholder}
                      value={payload[area.label] ?? ""}
                      onChange={(event) => setPayloadValue(area.label, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
            </Surface>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Surface className="xl:sticky xl:top-28">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <History className="text-cyan-300" />
              <h2 className="text-xl font-black">Histórico</h2>
            </div>
            <Button onClick={() => setComposerOpen(true)}>
              <Plus size={17} />
              Novo
            </Button>
          </div>
          <div className="mt-5 grid gap-2">
            {state.documents.length ? (
              state.documents.map((record) => {
                const item = studioDocById(record.docType);
                const active = selectedDocument?.id === record.id;

                return (
                  <button key={record.id} className={`focus-ring rounded-xl border p-3 text-left transition ${active ? "border-cyan-300/45 bg-cyan-300/10" : "border-white/10 bg-white/[0.032] hover:bg-white/[0.055]"}`} type="button" onClick={() => setSelectedDocumentId(record.id)}>
                    <Badge color={item.color}>{item.label}</Badge>
                    <h3 className="mt-3 font-black leading-tight">{record.title}</h3>
                    <p className="mt-2 text-xs text-zinc-500">{new Date(record.createdAt).toLocaleString("pt-BR")}</p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm leading-6 text-zinc-500">
                Gere o primeiro documento para criar histórico por cliente/projeto.
              </div>
            )}
          </div>
        </Surface>

        <Surface>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="text-orange-400" />
              <div>
                <h2 className="text-xl font-black">{selectedDocument?.title ?? "Preview do documento"}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedDocument ? "Documento salvo com dados da empresa, cliente e projeto." : "Crie ou selecione um documento para visualizar o PDF."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDocument ? (
                <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-zinc-200" href={`/studio/documentos/${selectedDocument.id}`}>
                  Abrir
                </Link>
              ) : null}
              <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-black" type="button" onClick={() => exportPdf(selectedDocument?.html ?? previewHtml)}>
                <Download size={16} />
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                <span>Preview PDF</span>
                <span className="text-orange-300">{state.businessProfile.name}</span>
              </div>
              <iframe className="h-[720px] w-full bg-[#f6f1e8]" title="Preview do documento" srcDoc={selectedDocument?.html ?? previewHtml} />
            </div>
            <aside className="premium-card rounded-xl p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Branding automático</p>
              <h3 className="mt-3 text-lg font-black">{state.businessProfile.name}</h3>
              <div className="mt-4 grid gap-3 text-sm font-bold leading-6 text-zinc-400">
                <p>Assinatura: {state.businessProfile.defaultSignature || "Não configurada"}</p>
                <p>E-mail: {state.businessProfile.email || "Não informado"}</p>
                <p>Site: {state.businessProfile.siteUrl || "Não informado"}</p>
                <p>Cliente: {selectedDocument ? getClientName(state, selectedDocument.clientId) : clientName}</p>
              </div>
            </aside>
          </div>
        </Surface>
      </section>
    </AppShell>
  );
}
