"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, History, Save, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, DOC_FIELD_CONFIG, STUDIO_DOCUMENTS, type StudioDocId, presetById, studioDocById } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { buildDocumentSummary, getClientName } from "@/lib/workspace-state";
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

  const doc = studioDocById(docType);
  const config = DOC_FIELD_CONFIG[docType];
  const preset = presetById(presetId);
  const project = state.projects.find((item) => item.id === projectId);
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

  const preview = useMemo(
    () =>
      buildDocumentSummary({
        docLabel: doc.label,
        tone: config.tone,
        clientName,
        projectTitle: project?.title || preset.title,
        presetTitle: preset.title,
        payload,
      }),
    [clientName, config.tone, doc.label, payload, preset.title, project?.title],
  );
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
  }

  function exportPdf() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(previewHtml);
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
      <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface className="xl:sticky xl:top-32">
            <div className="flex items-center gap-3">
              <FileText className="text-cyan-300" />
              <h2 className="text-xl font-black">Tipo de documento</h2>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
              <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2 py-2 text-cyan-300">1. Tipo</span>
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2">2. Base</span>
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2">3. PDF</span>
            </div>
            <div className="mt-5 grid gap-3">
              {STUDIO_DOCUMENTS.map((item) => (
                <button
                  key={item.id}
                  className={`focus-ring rounded-lg border p-3 text-left transition ${
                    docType === item.id ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                  type="button"
                  onClick={() => {
                    setDocType(item.id);
                    setPayload({});
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{item.label}</h3>
                    <span className="mt-1 h-2 w-8 rounded-full" style={{ background: item.color }} />
                  </div>
                  <p className="mt-2 text-xs font-bold leading-5 text-zinc-500">{item.description}</p>
                </button>
              ))}
            </div>
          </Surface>
        </div>

        <div className="grid gap-4">
          <Surface>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge color={doc.color}>{doc.label}</Badge>
                <h2 className="mt-3 text-2xl font-black">{config.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{config.tone}</p>
              </div>
              <Button onClick={generateDocument}>
                <Save size={17} />
                Salvar no histórico
              </Button>
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

          <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <Surface>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-orange-400" />
                  <h2 className="text-xl font-black">Preview do documento</h2>
                </div>
                <button className="inline-flex items-center gap-2 text-sm font-black text-orange-300" type="button" onClick={exportPdf}>
                  <Download size={16} />
                  Exportar PDF
                </button>
              </div>
              {latestId ? <p className="mt-3 text-sm font-bold text-emerald-300">Documento salvo no histórico.</p> : null}
              <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/35">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  <span>Preview PDF</span>
                  <span className="text-orange-300">{preset.label}</span>
                </div>
                <iframe className="h-[620px] w-full bg-[#f6f1e8]" title="Preview do documento" srcDoc={previewHtml} />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <summary className="cursor-pointer text-sm font-black text-zinc-300">Ver texto estruturado</summary>
                <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{preview}</pre>
              </details>
            </Surface>

            <Surface>
              <div className="flex items-center gap-3">
                <History className="text-cyan-300" />
                <h2 className="text-xl font-black">Histórico</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {state.documents.length ? (
                  state.documents.slice(0, 6).map((record) => {
                    const item = studioDocById(record.docType);

                    return (
                      <article key={record.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <Badge color={item.color}>{item.label}</Badge>
                        <h3 className="mt-3 font-black">{record.title}</h3>
                        <p className="mt-2 text-xs text-zinc-500">{new Date(record.createdAt).toLocaleString("pt-BR")}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black text-zinc-200 transition hover:text-white" href={`/studio/documentos/${record.id}`}>
                            Abrir
                          </Link>
                          <Link className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/15" href={`/studio?document=${record.id}`}>
                            Restaurar
                          </Link>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm leading-6 text-zinc-500">
                    Gere o primeiro documento para criar histórico por cliente/projeto.
                  </div>
                )}
              </div>
            </Surface>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
