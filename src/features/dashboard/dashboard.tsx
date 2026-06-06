"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  CircleDot,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  MessageSquareReply,
  PanelTop,
  Target,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { PRODUCTION_PIPELINE } from "@/lib/constants";
import { buildGuidedWorkflow } from "@/lib/guided-workflows";
import { buildOperationalCockpit } from "@/lib/operational-engine";
import { calculateMaturity, getClientName } from "@/lib/workspace-state";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const directionQuotes = [
  "O caos gera ideias. A disciplina constrói o legado.",
  "Menos perfeição, mais progresso.",
  "Proteja sua energia criativa.",
  "Consistência vence motivação.",
];

const modules = [
  {
    href: "/clientes",
    icon: BriefcaseBusiness,
    label: "Comercial",
    title: "Clientes, parcerias e freelancers",
    text: "Cadastro guiado, próxima ação e relacionamento em um lugar.",
    color: "var(--green)",
  },
  {
    href: "/projetos",
    icon: Clapperboard,
    label: "Produção",
    title: "Pipeline visual por projeto",
    text: "Briefing, roteiro, decupagem, callsheet, checklist e entrega.",
    color: "var(--violet)",
  },
  {
    href: "/studio",
    icon: FileText,
    label: "Studio Docs",
    title: "Documentos do audiovisual",
    text: "Cada documento tem campos próprios e histórico salvo.",
    color: "var(--cyan)",
  },
  {
    href: "/financeiro",
    icon: WalletCards,
    label: "Financeiro",
    title: "Operação em segundos",
    text: "Receber, pagar, recebido e lucro previsto com privacidade.",
    color: "#facc15",
  },
];

export function Dashboard() {
  const { state, metrics, actions, user, syncStatus } = useWorkspaceState();
  const [showDetails, setShowDetails] = useState(false);
  const maturity = calculateMaturity(state);
  const cockpit = useMemo(() => buildOperationalCockpit(state), [state]);
  const guided = useMemo(() => buildGuidedWorkflow(state), [state]);
  const privacy = state.privacyMode;
  const activeProjects = state.projects.filter((project) => project.status !== "entregue");
  const nextProjects = activeProjects.slice(0, 3);
  const leads = state.clients.filter((client) => client.status === "lead");
  const openProposals = [...state.proposals]
    .filter((proposal) => proposal.status === "draft" || proposal.status === "sent")
    .sort((a, b) => a.expectedCloseDate.localeCompare(b.expectedCloseDate));
  const nextClient = leads[0] ?? state.clients[0];
  const docsMissing = state.documents.length === 0;
  const nextDeadline = [...activeProjects].filter((project) => project.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const productionAgenda = [...activeProjects]
    .flatMap((project) => [
      project.shootDate
        ? {
            id: `${project.id}-shoot`,
            label: "Gravação",
            date: project.shootDate,
            title: project.title,
            client: getClientName(state, project.clientId),
            color: "var(--violet)",
          }
        : null,
      project.deliveryDate
        ? {
            id: `${project.id}-delivery`,
            label: "Entrega",
            date: project.deliveryDate,
            title: project.title,
            client: getClientName(state, project.clientId),
            color: "var(--orange)",
          }
        : null,
    ])
    .filter(Boolean)
    .sort((a, b) => a!.date.localeCompare(b!.date))
    .slice(0, 4) as { id: string; label: string; date: string; title: string; client: string; color: string }[];
  const quote = useMemo(() => directionQuotes[new Date().getDay() % directionQuotes.length], []);
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "criador";

  const primaryAction = useMemo(() => {
    if (cockpit.nextAction) {
      return {
        label: cockpit.nextAction.cta,
        title: cockpit.nextAction.title,
        text: cockpit.nextAction.description,
        href: cockpit.nextAction.href,
        color:
          cockpit.nextAction.type === "finance" ? "#facc15" :
          cockpit.nextAction.type === "review" ? "var(--cyan)" :
          cockpit.nextAction.type === "project" ? "var(--violet)" :
          cockpit.nextAction.type === "proposal" ? "var(--green)" :
          "var(--orange)",
      };
    }
    if (openProposals.length) {
      const proposal = openProposals[0];
      return {
        label: "Abrir comercial",
        title: "Fechar a próxima proposta",
        text: `${proposal.title} para ${getClientName(state, proposal.clientId)} tem fechamento previsto em ${formatDate(proposal.expectedCloseDate)}.`,
        href: "/clientes",
        color: "var(--green)",
      };
    }
    if (leads.length) {
      return {
        label: "Responder cliente agora",
        title: "Responder clientes pendentes",
        text: `${leads.length} contato${leads.length > 1 ? "s" : ""} precisa${leads.length > 1 ? "m" : ""} de próximo passo para virar proposta, diária ou produção.`,
        href: "/clientes",
        color: "var(--orange)",
      };
    }
    if (nextDeadline) {
      return {
        label: "Abrir produção",
        title: "Garantir a próxima entrega",
        text: `${nextDeadline.title} tem entrega em ${formatDate(nextDeadline.deadline)}. Confira pipeline, checklist e revisão.`,
        href: "/projetos",
        color: "var(--violet)",
      };
    }
    if (docsMissing) {
      return {
        label: "Gerar documento",
        title: "Criar o primeiro documento",
        text: "Briefing, proposta ou checklist salvo cria memória operacional e reduz retrabalho.",
        href: "/studio",
        color: "var(--cyan)",
      };
    }
    return {
      label: "Ver financeiro",
      title: "Conferir previsibilidade",
      text: "Acompanhe recebimentos, pendências e lucro previsto antes de assumir novos jobs.",
      href: "/financeiro",
      color: "#facc15",
    };
  }, [cockpit.nextAction, docsMissing, leads.length, nextDeadline, openProposals, state]);

  const compactMetrics = [
    { label: "Propostas abertas", value: metrics.openProposals, color: "var(--green)", href: "/clientes" },
    { label: "Receita prevista", value: formatCurrency(metrics.proposalForecast, privacy), color: "#facc15", href: "/clientes", money: true },
    { label: "Produção aberta", value: metrics.activeProjects, color: "var(--violet)", href: "/projetos" },
    { label: "Entregas próximas", value: metrics.projectsNearDelivery, color: "var(--orange)", href: "/projetos" },
  ];
  const commandItems = [
    { label: "Leads", value: cockpit.kpis.leads, href: "/clientes", color: "var(--orange)" },
    { label: "Propostas", value: cockpit.kpis.proposals, href: "/clientes", color: "var(--green)" },
    { label: "Reviews", value: cockpit.kpis.reviewsToOpen, href: "/review", color: "var(--cyan)" },
    { label: "Financeiro", value: cockpit.kpis.financeOpen, href: "/financeiro", color: "#facc15" },
  ];

  return (
    <AppShell
      eyebrow="Centro operacional"
      primaryAction={{ href: "/clientes", label: "Novo cliente" }}
      subtitle="O que precisa de decisão agora, sem transformar a abertura do sistema em painel administrativo."
      title="Hoje"
    >
      <Surface className="overflow-hidden border-emerald-300/14 bg-emerald-300/[0.035]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Badge color="var(--green)">Modo assistido</Badge>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">Uma produtora operando do lead ao recebimento.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{guided.summary}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/28 p-4 xl:w-[340px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ciclo operacional</p>
                <p className="mt-2 text-4xl font-black text-emerald-300">{guided.progress}%</p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-black text-black transition hover:bg-emerald-200"
                href={guided.currentStep.href}
              >
                {guided.currentStep.cta}
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${guided.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {guided.steps.map((step) => {
            const active = step.id === guided.currentStep.id && !step.done;
            const Icon = step.done ? CheckCircle2 : CircleDot;

            return (
              <Link
                key={step.id}
                className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                  step.done
                    ? "border-emerald-300/24 bg-emerald-300/[0.075]"
                    : active
                      ? "border-orange-400/35 bg-orange-500/[0.09]"
                      : step.blocked
                        ? "border-white/[0.06] bg-white/[0.02] opacity-70"
                        : "border-white/10 bg-white/[0.04]"
                }`}
                href={step.href}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{step.label}</span>
                  <Icon className={step.done ? "text-emerald-300" : active ? "text-orange-300" : "text-zinc-600"} size={18} />
                </div>
                <h3 className="mt-4 text-sm font-black leading-tight text-zinc-100">{step.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs font-bold leading-5 text-zinc-500">{step.description}</p>
                {active ? <p className="mt-4 text-xs font-black text-orange-300">{step.need}</p> : null}
              </Link>
            );
          })}
        </div>
      </Surface>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <Surface className="overflow-hidden border-orange-400/12 bg-orange-500/[0.035]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Badge color={syncStatus === "cloud" ? "var(--green)" : "var(--orange)"}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </Badge>
              <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight sm:text-3xl">Bom trabalho, {displayName}.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">&ldquo;{quote}&rdquo;</p>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-zinc-300 transition hover:text-white"
              type="button"
              onClick={actions.togglePrivacy}
            >
              {privacy ? <Eye size={17} /> : <EyeOff size={17} />}
              {privacy ? "Mostrar valores" : "Ocultar valores"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-400/18 bg-black/24 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: primaryAction.color }}>O que fazer agora</p>
                <h3 className="mt-2 text-xl font-black leading-tight sm:text-2xl">{primaryAction.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">{primaryAction.text}</p>
              </div>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400"
                href={primaryAction.href}
              >
                {primaryAction.label}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {commandItems.map((item) => (
              <Link key={item.label} className="premium-card rounded-xl p-4 transition hover:bg-white/[0.055]" href={item.href}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-3 text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface className="bg-white/[0.025]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Painel de comando</p>
              <h3 className="mt-2 text-xl font-black">Operação em tempo real</h3>
            </div>
            <PanelTop className="text-orange-300" size={28} />
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.055] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Maturidade</p>
                <p className="mt-2 text-4xl font-black">{maturity}%</p>
              </div>
              <Gauge className="text-emerald-300" size={34} />
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${maturity}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {compactMetrics.map((metric) => (
              <MetricCard key={metric.label} color={metric.color} href={metric.href} label={metric.label} value={metric.value} />
            ))}
          </div>
        </Surface>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Surface>
          <SectionHeading
            action={
              <Link href="/clientes" className="inline-flex items-center gap-2 text-sm font-black text-emerald-300">
                Comercial
                <ArrowRight size={16} />
              </Link>
            }
            description="Propostas, leads e fechamento previstos aparecem juntos para a produtora agir sem procurar."
            icon={Target}
            kicker="Receita"
            title="Comercial em movimento"
          />

          <div className="mt-5 grid gap-3">
            {openProposals.length ? openProposals.slice(0, 3).map((proposal) => (
              <Link key={proposal.id} className="premium-card rounded-xl p-4 transition hover:bg-emerald-300/10" href="/clientes">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">{getClientName(state, proposal.clientId)}</p>
                    <h3 className="mt-2 text-lg font-black leading-tight">{proposal.title}</h3>
                  </div>
                  <Badge color="var(--green)">{formatCurrency(proposal.amount, privacy)}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Fechamento previsto em {formatDate(proposal.expectedCloseDate)} · validade até {formatDate(proposal.validUntil)}
                </p>
              </Link>
            )) : nextClient ? (
              <div className="rounded-xl border border-orange-400/18 bg-orange-500/[0.075] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Próximo cliente</p>
                <h3 className="mt-2 text-xl font-black">{nextClient.name}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{nextClient.nextAction}</p>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-300" href="/clientes">
                  Resolver agora
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <EmptyState
                action={
                  <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-black transition hover:bg-orange-400" href="/clientes">
                    Criar primeiro contato
                    <ArrowRight size={16} />
                  </Link>
                }
                description="Comece por um contato. O NEXO cria próxima ação, preset comercial e base para projeto sem pedir tudo de uma vez."
                icon={BriefcaseBusiness}
                label="Primeiro uso"
                title="Sua operação ainda não tem clientes"
              />
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="premium-card rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Leads</p>
              <p className="mt-2 text-2xl font-black text-orange-300">{metrics.clientsToAnswer}</p>
            </div>
            <div className="premium-card rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">A fechar</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{metrics.proposalsToClose}</p>
            </div>
            <div className="premium-card rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">A receber</p>
              <p className="mt-2 truncate text-2xl font-black text-yellow-300">{formatCurrency(metrics.receivable, privacy)}</p>
            </div>
          </div>
        </Surface>

        <Surface>
          <SectionHeading
            action={
              <Link href="/review/demo" className="inline-flex items-center gap-2 text-sm font-black text-cyan-300">
                <MessageSquareReply size={17} />
                Review
              </Link>
            }
            description="Projetos ativos aparecem com etapa, prazo e checklist para evitar produção no escuro."
            icon={Clapperboard}
            kicker="Produção"
            title="Em andamento"
          />

          <div className="mt-5 grid gap-3">
            {nextProjects.length ? nextProjects.map((project) => {
              const done = PRODUCTION_PIPELINE.filter((step) => project.pipeline[step.key]).length;
              const percent = Math.round((done / PRODUCTION_PIPELINE.length) * 100);

              return (
                <Link key={project.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" href="/projetos">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{getClientName(state, project.clientId)}</p>
                      <h3 className="mt-2 text-xl font-black">{project.title}</h3>
                    </div>
                    <Badge color="var(--violet)">
                      <CalendarDays size={13} />
                      {formatDate(project.deadline)}
                    </Badge>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-violet-400" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRODUCTION_PIPELINE.map((step) => (
                      <span
                        key={step.key}
                        className={`rounded-full px-2 py-1 text-[11px] font-black ${project.pipeline[step.key] ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-zinc-500"}`}
                      >
                        {step.label}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            }) : (
              <EmptyState
                action={
                  <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-400 px-4 text-sm font-black text-black transition hover:bg-violet-300" href="/projetos">
                    Criar projeto
                    <ArrowRight size={16} />
                  </Link>
                }
                description="Depois do primeiro cliente, crie um projeto por preset para nascer com pipeline, briefing, checklist e prazo."
                icon={Clapperboard}
                title="Nenhuma produção aberta"
              />
            )}
          </div>
        </Surface>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Surface>
          <SectionHeading
            description="O sistema transforma lead, proposta, projeto, documento, review e financeiro em uma fila única de decisão."
            icon={Target}
            kicker="Motor operacional"
            title="Próximas ações"
          />
          <div className="mt-5 grid gap-3">
            {cockpit.actions.slice(0, 6).map((action) => (
              <Link key={action.id} className="premium-card rounded-xl p-4 transition hover:bg-white/[0.055]" href={action.href}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{action.type} · {action.priority}</p>
                    <h3 className="mt-2 font-black">{action.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{action.description}</p>
                  </div>
                  <span className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-black">{action.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </Surface>
        <Surface>
          <SectionHeading
            description="Histórico vivo do que está acontecendo na operação."
            icon={CalendarDays}
            kicker="Timeline"
            title="Atividade unificada"
          />
          <div className="mt-5 grid max-h-[620px] gap-3 overflow-auto pr-1">
            {cockpit.timeline.slice(0, 10).map((event) => (
              <Link key={event.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.06]" href={event.href}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">{event.type} · {formatDate(event.date)}</p>
                <h3 className="mt-2 font-black">{event.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{event.description}</p>
              </Link>
            ))}
          </div>
        </Surface>
      </section>

      {productionAgenda.length ? (
        <Surface className="bg-white/[0.025]">
          <SectionHeading
            description="Agenda resumida para visualizar gravações e entregas sem abrir o projeto inteiro."
            icon={CalendarDays}
            kicker="Agenda operacional"
            title="Próximos marcos"
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {productionAgenda.map((item) => (
              <Link key={item.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" href="/projetos">
                <Badge color={item.color}>{item.label}</Badge>
                <h3 className="mt-4 text-lg font-black leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{item.client}</p>
                <p className="mt-4 text-sm font-black text-zinc-300">{formatDate(item.date)}</p>
              </Link>
            ))}
          </div>
        </Surface>
      ) : null}

      <div className="flex justify-center">
        <button
          className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-zinc-300 transition hover:text-white"
          type="button"
          onClick={() => setShowDetails((value) => !value)}
        >
          {showDetails ? "Ocultar mapa completo" : "Ver mapa completo"}
        </button>
      </div>

      {showDetails ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  className="group soft-panel min-h-52 rounded-xl p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                  href={module.href}
                >
                  <Icon size={24} style={{ color: module.color }} />
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{module.label}</p>
                  <h3 className="mt-3 text-xl font-black leading-tight">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{module.text}</p>
                </Link>
              );
            })}
          </section>

          <Surface>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-emerald-300" />
              <h2 className="text-xl font-black">Pipeline padrão</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {PRODUCTION_PIPELINE.map((step, index) => (
                <div key={step.key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: step.color }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-black">{step.label}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{step.docType}</p>
                </div>
              ))}
            </div>
          </Surface>
        </>
      ) : null}
    </AppShell>
  );
}
