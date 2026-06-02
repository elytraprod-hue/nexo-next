"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Clapperboard,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  MessageSquareReply,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { OperationsTimeline } from "@/features/dashboard/operations-timeline";
import { SmartAlerts } from "@/features/dashboard/smart-alerts";
import { AUDIOVISUAL_PRESETS, PRODUCTION_PIPELINE } from "@/lib/constants";
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
  const privacy = state.privacyMode;
  const activeProjects = state.projects.filter((project) => project.status !== "entregue");
  const nextProjects = activeProjects.slice(0, 3);
  const leads = state.clients.filter((client) => client.status === "lead");
  const nextClient = leads[0] ?? state.clients[0];
  const docsMissing = state.documents.length === 0;
  const nextDeadline = [...activeProjects].filter((project) => project.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const quote = useMemo(() => directionQuotes[new Date().getDay() % directionQuotes.length], []);
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "criador";

  const primaryAction = useMemo(() => {
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
  }, [docsMissing, leads.length, nextDeadline]);

  const compactMetrics = [
    { label: "Responder", value: metrics.clientsToAnswer, color: "var(--orange)", href: "/clientes" },
    { label: "Produção aberta", value: metrics.activeProjects, color: "var(--violet)", href: "/projetos" },
    { label: "Docs salvos", value: metrics.savedDocs, color: "var(--cyan)", href: "/studio" },
    { label: "A receber", value: formatCurrency(metrics.receivable, privacy), color: "#facc15", href: "/financeiro", money: true },
  ];

  return (
    <AppShell
      eyebrow="Centro operacional"
      primaryAction={{ href: "/clientes", label: "Novo cliente" }}
      subtitle="O que precisa de decisão agora, sem transformar a abertura do sistema em painel administrativo."
      title="Hoje"
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Surface className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Badge color={syncStatus === "cloud" ? "var(--green)" : "var(--orange)"}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </Badge>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[0.95] sm:text-5xl">Bom trabalho, {displayName}.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">&ldquo;{quote}&rdquo;</p>
            </div>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-zinc-300 transition hover:text-white"
              type="button"
              onClick={actions.togglePrivacy}
            >
              {privacy ? <Eye size={17} /> : <EyeOff size={17} />}
              {privacy ? "Mostrar valores" : "Ocultar valores"}
            </button>
          </div>

          <div className="mt-7 rounded-[26px] border border-orange-400/25 bg-orange-500/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: primaryAction.color }}>O que fazer agora</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">{primaryAction.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">{primaryAction.text}</p>
              </div>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400"
                href={primaryAction.href}
              >
                {primaryAction.label}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {compactMetrics.map((metric) => (
              <Link key={metric.label} className="min-h-32 rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.075]" href={metric.href}>
                <div className="h-2 w-8 rounded-full" style={{ background: metric.color }} />
                <div
                  className={`mt-5 max-w-full break-words font-black leading-none tracking-normal ${metric.money ? "text-[clamp(1.65rem,3vw,2.35rem)]" : "text-4xl"}`}
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{metric.label}</p>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Score de maturidade</p>
              <h3 className="mt-2 text-3xl font-black">{maturity}% Studio OS</h3>
            </div>
            <Gauge className="text-emerald-300" size={38} />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: "CRM com clientes", done: state.clients.length > 0, href: "/clientes" },
              { label: "Projetos com pipeline", done: state.projects.length > 0, href: "/projetos" },
              { label: "Documentos no histórico", done: state.documents.length > 0, href: "/studio" },
              { label: "Financeiro previsível", done: state.financeEntries.length > 0, href: "/financeiro" },
              { label: "Review profissional", done: true, href: "/review/demo" },
            ].map((item) => (
              <Link key={item.label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0" href={item.href}>
                <div>
                  <p className={`font-black ${item.done ? "text-emerald-300" : "text-zinc-200"}`}>{item.done ? "✓" : "○"} {item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.done ? "Pronto" : "Resolver em poucos cliques"}</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">{item.done ? "OK" : "Abrir"}</span>
              </Link>
            ))}
          </div>
        </Surface>
      </section>

      <section className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Surface>
          <div className="flex items-center gap-3">
            <Sparkles className="text-orange-400" />
            <h2 className="text-xl font-black">Começar rápido</h2>
          </div>

          {nextClient ? (
            <div className="mt-5 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Comercial</p>
              <h3 className="mt-3 text-2xl font-black">{nextClient.name}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{nextClient.nextAction}</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-300" href="/clientes">
                Resolver agora
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : null}

          <div className="mt-4 grid gap-2">
            {AUDIOVISUAL_PRESETS.slice(0, 4).map((preset) => (
              <Link
                key={preset.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm transition hover:bg-white/[0.08]"
                href="/projetos"
              >
                <span className="font-black">{preset.label}</span>
                <span className="text-zinc-500">{formatCurrency(preset.value, privacy)}</span>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clapperboard className="text-violet-300" />
              <h2 className="text-xl font-black">Produção em andamento</h2>
            </div>
            <Link href="/review/demo" className="inline-flex items-center gap-2 text-sm font-black text-cyan-300">
              <MessageSquareReply size={17} />
              Review
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {nextProjects.map((project) => {
              const done = PRODUCTION_PIPELINE.filter((step) => project.pipeline[step.key]).length;
              const percent = Math.round((done / PRODUCTION_PIPELINE.length) * 100);

              return (
                <Link key={project.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" href="/projetos">
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
            })}
          </div>
        </Surface>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <OperationsTimeline state={state} />
        <SmartAlerts state={state} />
      </section>

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
                  className="group soft-panel min-h-60 rounded-[26px] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                  href={module.href}
                >
                  <Icon size={24} style={{ color: module.color }} />
                  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{module.label}</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">{module.title}</h3>
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
