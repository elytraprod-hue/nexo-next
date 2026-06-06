"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clapperboard, ExternalLink, FileText, LayoutGrid, ListChecks, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
  const [briefing, setBriefing] = useState("");
  const [referencesText, setReferencesText] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [crewText, setCrewText] = useState("");
  const [priority, setPriority] = useState<ProjectRecord["priority"]>("normal");
  const [linksText, setLinksText] = useState("");
  const [view, setView] = useState<"lista" | "kanban">("lista");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [stagePrompt, setStagePrompt] = useState<StagePrompt>(null);
  const [lastDocumentTitle, setLastDocumentTitle] = useState("");

  const selectedPreset = AUDIOVISUAL_PRESETS.find((preset) => preset.id === presetId) ?? AUDIOVISUAL_PRESETS[1];
  const canCreateProject = ready && Boolean(state.clients.length);
  const projectsByStatus = useMemo(
    () => ({
      briefing: state.projects.filter((project) => project.status === "briefing"),
      producao: state.projects.filter((project) => project.status === "producao"),
      review: state.projects.filter((project) => project.status === "review"),
      entregue: state.projects.filter((project) => project.status === "entregue"),
    }),
    [state.projects],
  );

  function splitList(value: string) {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function addProject() {
    if (!canCreateProject) return;
    const fallbackClient = clientId || state.clients[0]?.id;
    if (!fallbackClient) return;
    const project = actions.addProject({
      clientId: fallbackClient,
      presetId,
      title,
      briefing,
      references: splitList(referencesText),
      shootDate,
      deadline: deadline || addDaysInput(14),
      deliveryDate: deadline || addDaysInput(14),
      budget: selectedPreset.value,
      crew: splitList(crewText),
      priority,
      links: splitList(linksText),
    });
    setTitle("");
    setBriefing("");
    setReferencesText("");
    setShootDate("");
    setCrewText("");
    setPriority("normal");
    setLinksText("");
    setExpandedProjectId(project.id);
    setStagePrompt({ projectId: project.id, docType: "briefing", label: "Briefing" });
    setLastDocumentTitle("");
    setProjectModalOpen(false);
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
        briefing: project.briefing || "Briefing ainda não detalhado",
        gravacao: project.shootDate || "Data de gravação não definida",
        prazo: project.deliveryDate || project.deadline,
        prioridade: project.priority,
        equipe: project.crew.join(", ") || "Equipe ainda não definida",
        referencias: project.references.join("\n") || "Sem referências vinculadas",
        links: project.links.join("\n") || "Sem links vinculados",
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

  function removeProject(project: ProjectRecord) {
    const confirmed = window.confirm(`Excluir ${project.title}? Documentos e lançamentos vinculados também serão removidos.`);
    if (!confirmed) return;
    actions.removeProject(project.id);
  }

  function renderProjectCard(project: ProjectRecord, compact = false) {
    const { done, percent, nextStep } = getProjectProgress(project);
    const checklistDone = project.checklist.filter((item) => item.done).length;
    const expanded = expandedProjectId === project.id;

    return (
      <article key={project.id} className={`rounded-xl border border-white/10 bg-black/20 ${compact ? "p-3" : "p-4"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge color="var(--violet)">{project.type}</Badge>
              <Badge color={project.priority === "urgente" ? "#ef4444" : project.priority === "alta" ? "var(--orange)" : "var(--cyan)"}>
                {project.priority}
              </Badge>
              <Badge color="#facc15">
                <CalendarDays size={13} />
                {formatDate(project.deliveryDate || project.deadline)}
              </Badge>
              <Badge color="var(--green)">
                {done}/{PRODUCTION_PIPELINE.length} etapas
              </Badge>
            </div>
            <h3 className="mt-3 break-words text-xl font-black">{project.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{getClientName(state, project.clientId)}</p>
            {project.briefing ? <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-zinc-400">{project.briefing}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Orçamento</p>
              <p className="mt-1 max-w-36 truncate text-lg font-black text-emerald-300">{formatCurrency(project.budget, state.privacyMode)}</p>
            </div>
            <button
              aria-label={`Excluir ${project.title}`}
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
              type="button"
              onClick={() => removeProject(project)}
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
              className={`focus-ring rounded-lg border px-3 py-3 text-left text-xs font-black transition ${
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
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["Gravação", project.shootDate ? formatDate(project.shootDate) : "Não definida"],
                ["Entrega", formatDate(project.deliveryDate || project.deadline)],
                ["Equipe", project.crew.length ? project.crew.join(", ") : "Não definida"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-zinc-300">{value}</p>
                </div>
              ))}
            </div>

            {project.references.length || project.links.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {project.references.length ? (
                  <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Referências</p>
                    <div className="mt-2 grid gap-2">
                      {project.references.map((reference) => (
                        <a key={reference} className="inline-flex items-center gap-2 break-all text-sm font-bold leading-6 text-cyan-100" href={reference} rel="noopener noreferrer" target="_blank">
                          <ExternalLink size={14} />
                          {reference}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
                {project.links.length ? (
                  <div className="rounded-lg border border-violet-300/15 bg-violet-300/[0.06] p-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">Links e arquivos</p>
                    <div className="mt-2 grid gap-2">
                      {project.links.map((link) => (
                        <a key={link} className="inline-flex items-center gap-2 break-all text-sm font-bold leading-6 text-violet-100" href={link} rel="noopener noreferrer" target="_blank">
                          <ExternalLink size={14} />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-2 md:grid-cols-2">
              {project.checklist.map((item, index) => (
                <button
                  key={`${project.id}-${item.text}`}
                  className={`focus-ring flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition ${
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
      <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <Clapperboard className="text-violet-300" />
              <h2 className="text-xl font-black">Novo projeto</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Abra uma janela focada para criar projeto sem esmagar o pipeline na mesma tela.</p>
            <Button className="mt-5 w-full" disabled={!canCreateProject} onClick={() => setProjectModalOpen(true)}>
              <Plus size={17} />
              Criar projeto guiado
            </Button>
            {!state.clients.length ? (
              <div className="mt-4">
                <EmptyState
                  description="Projetos precisam nascer vinculados a um cliente para manter briefing, aprovação, financeiro e documentos conectados."
                  icon={Clapperboard}
                  label="Pré-requisito"
                  title="Crie um cliente antes do projeto"
                />
              </div>
            ) : null}
          </Surface>

          {projectModalOpen ? (
            <div className="workspace-overlay fixed inset-0 z-50 grid place-items-center p-3 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Novo projeto guiado">
              <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto">
                <Surface className="workspace-window border-violet-300/20">
                  <div className="flex items-center gap-3">
                    <Clapperboard className="text-violet-300" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Projeto guiado</p>
                      <h2 className="mt-1 text-xl font-black">Novo projeto por preset</h2>
                    </div>
                    <button
                      aria-label="Fechar projeto"
                      className="premium-control ml-auto grid size-10 place-items-center rounded-lg text-zinc-400 transition hover:text-white"
                      type="button"
                      onClick={() => setProjectModalOpen(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-500">Escolha cliente + tipo de produção. O resto nasce preenchido.</p>

            <div className="mt-5 grid gap-3">
              <select
                className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold text-white"
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
                className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                placeholder={selectedPreset.title}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <textarea
                className="focus-ring min-h-28 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                placeholder={selectedPreset.defaultBriefing.objective}
                value={briefing}
                onChange={(event) => setBriefing(event.target.value)}
              />

              <div className="grid gap-2 sm:grid-cols-2">
                {AUDIOVISUAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`focus-ring rounded-lg border p-3 text-left transition ${
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
                    className="focus-ring rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-black text-zinc-300 transition hover:border-violet-300/30 hover:text-white"
                    type="button"
                    onClick={() => setDeadline(addDaysInput(option.days))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Gravação
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white"
                    type="date"
                    value={shootDate}
                    onChange={(event) => setShootDate(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Entrega prevista
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white"
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Prioridade
                  <select
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as ProjectRecord["priority"])}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Equipe
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                    placeholder="Direção, câmera, editor..."
                    value={crewText}
                    onChange={(event) => setCrewText(event.target.value)}
                  />
                </label>
              </div>

              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Referências
                <textarea
                  className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold normal-case leading-6 tracking-normal text-white placeholder:text-zinc-600"
                  placeholder="Links, estilos, vídeos de referência. Um por linha."
                  value={referencesText}
                  onChange={(event) => setReferencesText(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Links e arquivos
                <textarea
                  className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold normal-case leading-6 tracking-normal text-white placeholder:text-zinc-600"
                  placeholder="Pasta do projeto, Drive, roteiro, assets, contrato. Um por linha."
                  value={linksText}
                  onChange={(event) => setLinksText(event.target.value)}
                />
              </label>

              <Button className="w-full" disabled={!canCreateProject} onClick={addProject}>
                <Plus size={17} />
                {ready ? "Criar projeto completo" : "Restaurando workspace"}
              </Button>
            </div>
                </Surface>
              </div>
            </div>
          ) : null}

          <Surface>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Preset selecionado</p>
            <h3 className="mt-3 text-xl font-black">{selectedPreset.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{selectedPreset.defaultBriefing.objective}</p>
            <div className="mt-4 grid gap-2">
              {selectedPreset.deliverables.map((deliverable) => (
                <div key={deliverable} className="flex items-center gap-2 rounded-lg bg-white/[0.045] p-3 text-sm text-zinc-300">
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
                <h2 className="mt-2 text-2xl font-black">{state.projects.length} projetos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-black sm:grid-cols-4">
                {statusColumns.map((status) => (
                  <div key={status.key} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    <span className="text-zinc-500">{status.label}</span>
                    <span className="ml-2 text-white">{projectsByStatus[status.key].length}</span>
                  </div>
                ))}
              </div>
            </div>

            {stagePrompt || lastDocumentTitle ? (
              <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
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
                {state.projects.length ? (
                  state.projects.map((project) => renderProjectCard(project))
                ) : (
                  <EmptyState
                    description="Escolha um cliente e um preset audiovisual. O projeto nasce com pipeline, checklist e documento sugerido."
                    icon={Clapperboard}
                    label="Produção"
                    title="Nenhum projeto criado ainda"
                  />
                )}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-4">
                {statusColumns.map((status) => (
                  <div key={status.key} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-3 flex items-center justify-between px-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{status.label}</p>
                      <span className="ml-2 text-white">{projectsByStatus[status.key].length}</span>
                    </div>
                    <div className="grid gap-3">
                      {projectsByStatus[status.key].length ? (
                        projectsByStatus[status.key].map((project) => renderProjectCard(project, true))
                      ) : (
                        <div className="rounded-lg border border-dashed border-white/10 p-4 text-sm font-bold leading-6 text-zinc-600">Sem projetos nesta etapa.</div>
                      )}
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
