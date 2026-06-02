"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clapperboard, FileText, LayoutGrid, ListChecks, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, PRODUCTION_PIPELINE, type PipelineKey, type StudioDocId } from "@/lib/constants";
import { addDaysInput, getClientName, type ProjectRecord } from "@/lib/workspace-state";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const statusColumns = [
  { key: "briefing", label: "Briefing" },
  { key: "producao", label: "Produção" },
  { key: "review", label: "Review" },
  { key: "entregue", label: "Entregue" },
] as const;

type StagePrompt = {
  projectId: string;
  docType: StudioDocId;
  label: string;
} | null;

export function ProjectsPage() {
  const { state, actions, ready } = useWorkspaceState();
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "");
  const [presetId, setPresetId] = useState("institucional");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [view, setView] = useState<"lista" | "kanban">("lista");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [stagePrompt, setStagePrompt] = useState<StagePrompt>(null);
  const [lastDocumentTitle, setLastDocumentTitle] = useState("");

  const selectedPreset = AUDIOVISUAL_PRESETS.find((preset) => preset.id === presetId) ?? AUDIOVISUAL_PRESETS[1];
  const projectsByStatus = useMemo(
    () => ({
      briefing: state.projects.filter((project) => project.status === "briefing"),
      producao: state.projects.filter((project) => project.status === "producao"),
      review: state.projects.filter((project) => project.status === "review"),
      entregue: state.projects.filter((project) => project.status === "entregue"),
    }),
    [state.projects],
  );

  function addProject() {
    if (!ready) return;
    const fallbackClient = clientId || state.clients[0]?.id;
    if (!fallbackClient) return;
    const project = actions.addProject({
      clientId: fallbackClient,
      presetId,
      title,
      deadline: deadline || addDaysInput(14),
      budget: selectedPreset.value,
    });
    setTitle("");
    setExpandedProjectId(project.id);
    setStagePrompt({ projectId: project.id, docType: "briefing", label: "Briefing" });
    setLastDocumentTitle("");
  }

  function handleTogglePipeline(projectId: string, key: PipelineKey) {
    if (!ready) return;
    const project = state.projects.find((item) => item.id === projectId);
    const step = PRODUCTION_PIPELINE.find((item) => item.key === key);
    if (!project || !step) return;

    const willComplete = !project.pipeline[key];
    actions.togglePipeline(projectId, key);
    setLastDocumentTitle("");
    setStagePrompt(willComplete ? { projectId, docType: step.docType, label: step.label } : null);
  }

  function generateStageDocument(prompt: NonNullable<StagePrompt>) {
    if (!ready) return;
    const project = state.projects.find((item) => item.id === prompt.projectId);
    if (!project) return;

    const record = actions.saveDocument({
      docType: prompt.docType,
      clientId: project.clientId,
      projectId: project.id,
      presetId: project.presetId,
      payload: {
        fase: prompt.label,
        cliente: getClientName(state, project.clientId),
        projeto: project.title,
        prazo: project.deadline,
        proximoPasso: `Validar ${prompt.label.toLowerCase()} e liberar próxima etapa do pipeline.`,
      },
    });
    setLastDocumentTitle(record.title);
    setStagePrompt(null);
  }

  function getProjectProgress(project: ProjectRecord) {
    const done = PRODUCTION_PIPELINE.filter((step) => project.pipeline[step.key]).length;
    const percent = Math.round((done / PRODUCTION_PIPELINE.length) * 100);
    const nextStep = PRODUCTION_PIPELINE.find((step) => !project.pipeline[step.key]);
    return { done, percent, nextStep };
  }

  function renderProjectCard(project: ProjectRecord, compact = false) {
    const { done, percent, nextStep } = getProjectProgress(project);
    const checklistDone = project.checklist.filter((item) => item.done).length;
    const expanded = expandedProjectId === project.id;

    return (
      <article key={project.id} className={`rounded-[28px] border border-white/10 bg-black/20 ${compact ? "p-4" : "p-5"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge color="var(--violet)">{project.type}</Badge>
              <Badge color="#facc15">
                <CalendarDays size={13} />
                {formatDate(project.deadline)}
              </Badge>
              <Badge color="var(--green)">
                {done}/{PRODUCTION_PIPELINE.length} etapas
              </Badge>
            </div>
            <h3 className="mt-4 break-words text-2xl font-black">{project.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{getClientName(state, project.clientId)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Orçamento</p>
              <p className="mt-1 max-w-40 truncate text-xl font-black text-emerald-300">{formatCurrency(project.budget, state.privacyMode)}</p>
            </div>
            <button
              aria-label={`Excluir ${project.title}`}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
              type="button"
              onClick={() => actions.removeProject(project.id)}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
            <span>Pipeline</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-violet-400" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {PRODUCTION_PIPELINE.map((step) => (
            <button
              key={step.key}
              className={`focus-ring rounded-2xl border px-3 py-3 text-left text-xs font-black transition ${
                project.pipeline[step.key] ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-300" : "border-white/10 bg-white/[0.04] text-zinc-500"
              }`}
              type="button"
              disabled={!ready}
              onClick={() => handleTogglePipeline(project.id, step.key)}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {nextStep ? (
            <Button disabled={!ready} variant="success" onClick={() => handleTogglePipeline(project.id, nextStep.key)}>
              Avançar para {nextStep.label}
              <ArrowRight size={17} />
            </Button>
          ) : (
            <Button disabled={!ready} variant="success" onClick={() => setStagePrompt({ projectId: project.id, docType: "entrega", label: "Entrega" })}>
              Preparar entrega
              <FileText size={17} />
            </Button>
          )}
          <Button disabled={!ready} variant="ghost" onClick={() => setExpandedProjectId(expanded ? null : project.id)}>
            <ListChecks size={17} />
            {expanded ? "Ocultar checklist" : `Checklist ${checklistDone}/${project.checklist.length}`}
          </Button>
        </div>

        {expanded ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {project.checklist.map((item, index) => (
              <button
                key={`${project.id}-${item.text}`}
                className={`focus-ring flex items-center gap-3 rounded-2xl border p-3 text-left text-sm transition ${
                  item.done ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : "border-white/10 bg-white/[0.035] text-zinc-400"
                }`}
                type="button"
                disabled={!ready}
                onClick={() => actions.toggleChecklist(project.id, index)}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs">{item.done ? "✓" : ""}</span>
                {item.text}
              </button>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <AppShell
      eyebrow="Operação audiovisual"
      primaryAction={{ href: "/studio", label: "Gerar doc" }}
      subtitle="Um projeto nasce com pipeline, entregáveis, briefing base e checklist. Nada de começar do zero."
      title="Produção"
    >
      <section className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <Clapperboard className="text-violet-300" />
              <h2 className="text-xl font-black">Novo projeto por preset</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Escolha cliente + tipo de produção. O resto nasce preenchido.</p>

            <div className="mt-5 grid gap-3">
              <select
                className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                {state.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <input
                className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                placeholder={selectedPreset.title}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <div className="grid gap-2 sm:grid-cols-2">
                {AUDIOVISUAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`focus-ring rounded-2xl border p-3 text-left transition ${
                      presetId === preset.id ? "border-violet-300 bg-violet-300/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                    type="button"
                    onClick={() => {
                      setPresetId(preset.id);
                      setDeadline(addDaysInput(preset.id === "stories" ? 5 : preset.id === "doc" ? 21 : 14));
                    }}
                  >
                    <p className="text-sm font-black">{preset.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{preset.defaultBriefing.format}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "5d", days: 5 },
                  { label: "14d", days: 14 },
                  { label: "21d", days: 21 },
                  { label: "30d", days: 30 },
                ].map((option) => (
                  <button
                    key={option.days}
                    className="focus-ring rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-black text-zinc-300 transition hover:border-violet-300/30 hover:text-white"
                    type="button"
                    onClick={() => setDeadline(addDaysInput(option.days))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Entrega prevista
                <input
                  className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white"
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                />
              </label>

              <Button className="w-full" disabled={!state.clients.length || !ready} onClick={addProject}>
                <Plus size={17} />
                {ready ? "Criar projeto completo" : "Restaurando workspace"}
              </Button>
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Preset selecionado</p>
            <h3 className="mt-3 text-2xl font-black">{selectedPreset.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{selectedPreset.defaultBriefing.objective}</p>
            <div className="mt-4 grid gap-2">
              {selectedPreset.deliverables.map((deliverable) => (
                <div key={deliverable} className="flex items-center gap-2 rounded-2xl bg-white/[0.045] p-3 text-sm text-zinc-300">
                  <CheckCircle2 className="text-emerald-300" size={17} />
                  {deliverable}
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="grid gap-4">
          <Surface>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Pipeline</p>
                <h2 className="mt-2 text-3xl font-black">{state.projects.length} projetos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-black sm:grid-cols-4">
                {statusColumns.map((status) => (
                  <div key={status.key} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <span className="text-zinc-500">{status.label}</span>
                    <span className="ml-2 text-white">{projectsByStatus[status.key].length}</span>
                  </div>
                ))}
              </div>
            </div>

            {stagePrompt || lastDocumentTitle ? (
              <div className="mt-5 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                {stagePrompt ? (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Documento sugerido</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">A etapa {stagePrompt.label} foi marcada. Gere a base do documento sem abrir outro formulário.</p>
                    </div>
                    <Button disabled={!ready} variant="success" onClick={() => generateStageDocument(stagePrompt)}>
                      <FileText size={17} />
                      Gerar documento
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-emerald-200">Documento salvo: {lastDocumentTitle}</p>
                )}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant={view === "lista" ? "primary" : "ghost"} onClick={() => setView("lista")}>
                <ListChecks size={17} />
                Lista operacional
              </Button>
              <Button variant={view === "kanban" ? "primary" : "ghost"} onClick={() => setView("kanban")}>
                <LayoutGrid size={17} />
                Kanban
              </Button>
            </div>

            {view === "lista" ? (
              <div className="mt-6 grid gap-4">
                {state.projects.map((project) => renderProjectCard(project))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-4">
                {statusColumns.map((status) => (
                  <div key={status.key} className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-3 flex items-center justify-between px-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{status.label}</p>
                      <span className="ml-2 text-white">{projectsByStatus[status.key].length}</span>
                    </div>
                    <div className="grid gap-3">
                      {projectsByStatus[status.key].map((project) => renderProjectCard(project, true))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>
        </div>
      </section>
    </AppShell>
  );
}
