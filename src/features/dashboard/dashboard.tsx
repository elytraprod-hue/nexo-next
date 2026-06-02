"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clapperboard,
  FileText,
  Gauge,
  MessageSquareReply,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, PRODUCTION_PIPELINE } from "@/lib/constants";
import { calculateMaturity, getClientName } from "@/lib/workspace-state";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

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
  const { state, metrics } = useWorkspaceState();
  const maturity = calculateMaturity(state);
  const nextProjects = state.projects.slice(0, 3);
  const nextClient = state.clients.find((client) => client.status === "lead") ?? state.clients[0];
  const privacy = state.privacyMode;

  return (
    <AppShell
      eyebrow="Visão atual"
      primaryAction={{ href: "/clientes", label: "Novo cliente" }}
      subtitle="Seu dia começa aqui: o que responder, o que produzir, o que receber e o que entregar."
      title="Hoje"
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_420px]">
        <Surface className="overflow-hidden">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge color="var(--blue)">Sistema operacional audiovisual</Badge>
              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] sm:text-6xl">
                Menos planilha, menos WhatsApp perdido, mais produção andando.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400"
              href="/projetos"
            >
              Abrir produção
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Clientes para responder", value: metrics.clientsToAnswer, color: "var(--orange)" },
              { label: "Projetos ativos", value: metrics.activeProjects, color: "var(--violet)" },
              { label: "Docs salvos", value: metrics.savedDocs, color: "var(--cyan)" },
              { label: "A receber", value: formatCurrency(metrics.receivable, privacy), color: "#facc15" },
            ].map((metric) => (
              <div key={metric.label} className="min-h-36 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <div className="h-2 w-8 rounded-full" style={{ background: metric.color }} />
                <div
                  className="mt-6 max-w-full break-words text-4xl font-black leading-none tracking-normal sm:text-5xl"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{metric.label}</p>
              </div>
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
                  <p className="mt-1 text-sm text-zinc-500">{item.done ? "Pronto" : "Abrir e resolver em poucos cliques"}</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">{item.done ? "OK" : "Abrir"}</span>
              </Link>
            ))}
          </div>
        </Surface>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Surface>
          <div className="flex items-center gap-3">
            <Sparkles className="text-orange-400" />
            <h2 className="text-xl font-black">Próxima melhor ação</h2>
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
                    <Badge color="var(--violet)">{formatDate(project.deadline)}</Badge>
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
    </AppShell>
  );
}
