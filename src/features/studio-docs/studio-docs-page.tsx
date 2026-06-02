"use client";

import { useMemo, useState } from "react";
import { Download, FileText, History, Save, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, DOC_FIELD_CONFIG, STUDIO_DOCUMENTS, type StudioDocId, presetById, studioDocById } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { buildDocumentSummary, getClientName } from "@/lib/workspace-state";

type Payload = Record<string, string>;

export function StudioDocsPage() {
  const { state, actions } = useWorkspaceState();
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

  return (
    <AppShell
      eyebrow="Studio Docs"
      primaryAction={{ href: "/projetos", label: "Novo projeto" }}
      subtitle="Documentos pensados para audiovisual, com campos próprios e histórico salvo."
      title="Documentos"
    >
      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <FileText className="text-cyan-300" />
              <h2 className="text-xl font-black">Tipo de documento</h2>
            </div>
            <div className="mt-5 grid gap-2">
              {STUDIO_DOCUMENTS.map((item) => (
                <button
                  key={item.id}
                  className={`focus-ring rounded-2xl border p-4 text-left transition ${
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
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{item.description}</p>
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
                <h2 className="mt-4 text-3xl font-black">{config.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{config.tone}</p>
              </div>
              <Button onClick={generateDocument}>
                <Save size={17} />
                Salvar no histórico
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Cliente
                <select
                  className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
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
                  className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
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
                  className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
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

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {config.fields.map((field) => (
                <label key={field.key} className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  {field.label}
                  <input
                    className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                    placeholder={field.placeholder}
                    type={field.type ?? "text"}
                    value={payload[field.label] ?? ""}
                    onChange={(event) => setPayloadValue(field.label, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {config.areas.map((area) => (
                <label key={area.key} className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  {area.label}
                  <textarea
                    className="focus-ring min-h-32 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                    placeholder={area.placeholder}
                    value={payload[area.label] ?? ""}
                    onChange={(event) => setPayloadValue(area.label, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </Surface>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Surface>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-orange-400" />
                  <h2 className="text-xl font-black">Preview do documento</h2>
                </div>
                <button className="inline-flex items-center gap-2 text-sm font-black text-zinc-400" type="button">
                  <Download size={16} />
                  PDF em breve
                </button>
              </div>
              {latestId ? <p className="mt-3 text-sm font-bold text-emerald-300">Documento salvo no histórico.</p> : null}
              <pre className="mt-5 whitespace-pre-wrap rounded-3xl border border-white/10 bg-black/35 p-5 text-sm leading-7 text-zinc-200">{preview}</pre>
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
                      <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <Badge color={item.color}>{item.label}</Badge>
                        <h3 className="mt-3 font-black">{record.title}</h3>
                        <p className="mt-2 text-xs text-zinc-500">{new Date(record.createdAt).toLocaleString("pt-BR")}</p>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-6 text-zinc-500">
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
