import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clapperboard,
  FileText,
  Gauge,
  PanelRightOpen,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, PRODUCTION_PIPELINE } from "@/lib/constants";
import { formatCurrencyCompact } from "@/lib/utils/format";

const metrics = [
  { label: "Clientes para responder", value: "0", color: "var(--orange)" },
  { label: "Projetos ativos", value: "0", color: "var(--violet)" },
  { label: "Docs salvos", value: "0", color: "var(--cyan)" },
  { label: "A receber", value: formatCurrencyCompact(6350), color: "#facc15" },
];

const modules = [
  {
    href: "/clientes",
    icon: BriefcaseBusiness,
    label: "Comercial",
    title: "Clientes, parcerias e freelancers",
    text: "Cadastro guiado e próxima ação clara.",
    color: "var(--green)",
  },
  {
    href: "/projetos",
    icon: Clapperboard,
    label: "Produção",
    title: "Pipeline visual por projeto",
    text: "Da venda à entrega sem perder contexto.",
    color: "var(--violet)",
  },
  {
    href: "/studio",
    icon: FileText,
    label: "Studio Docs",
    title: "Documentos profissionais",
    text: "Campos únicos para cada tipo de documento.",
    color: "var(--cyan)",
  },
  {
    href: "/financeiro",
    icon: WalletCards,
    label: "Financeiro",
    title: "Valores protegidos e legíveis",
    text: "Cards responsivos e prontos para privacidade.",
    color: "#facc15",
  },
];

export function Dashboard() {
  return (
    <main className="app-bg px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-black/30 p-5 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl border border-orange-400/30 bg-orange-500/15 text-2xl font-black text-orange-400">
              N
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-400">Studio OS</p>
              <h1 className="text-2xl font-black leading-tight sm:text-4xl">NEXO Central</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Next.js + TypeScript</Badge>
            <Badge color="var(--green)">Base nova separada</Badge>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <Surface className="overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Badge color="var(--blue)">Visão atual</Badge>
                <h2 className="mt-4 text-4xl font-black leading-[0.95] sm:text-6xl">
                  Operação clara, modular e pronta para escala.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                  Esta é a primeira fundação da migração: dashboard mais limpo, módulos separados, review profissional e
                  Supabase preparado para evoluir por migrations.
                </p>
              </div>
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-400"
                href="/review/demo"
              >
                Testar review
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
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
                <h3 className="mt-2 text-2xl font-black">83% Studio OS</h3>
              </div>
              <Gauge className="text-emerald-300" size={34} />
            </div>
            <div className="mt-6 space-y-4">
              {["CRM com clientes", "Propostas no histórico", "Produção mapeada", "Financeiro previsível", "Negócio configurado"].map(
                (item, index) => (
                  <div key={item} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0">
                    <div>
                      <p className={`font-black ${index === 1 ? "text-zinc-200" : "text-emerald-300"}`}>
                        {index === 1 ? "○" : "✓"} {item}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">{index === 1 ? "Crie uma proposta vinculada ao cliente" : "Pronto"}</p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                      {index === 1 ? "Abrir" : "OK"}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Surface>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                className="group soft-panel min-h-64 rounded-[26px] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                href={module.href}
              >
                <div className="flex items-center justify-between">
                  <Icon size={24} style={{ color: module.color }} />
                  <PanelRightOpen className="text-zinc-600 transition group-hover:text-zinc-200" size={20} />
                </div>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{module.label}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{module.text}</p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Surface>
            <div className="flex items-center gap-3">
              <Sparkles className="text-orange-400" />
              <h2 className="text-xl font-black">Presets audiovisuais</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {AUDIOVISUAL_PRESETS.slice(0, 6).map((preset) => (
                <div key={preset.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{preset.label}</h3>
                    <span className="whitespace-nowrap text-sm font-black text-orange-300">{formatCurrencyCompact(preset.value)}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{preset.type}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-emerald-300" />
              <h2 className="text-xl font-black">Pipeline padrão</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {PRODUCTION_PIPELINE.map((step, index) => (
                <div key={step.key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: step.color }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-black">{step.label}</h3>
                  <p className="mt-2 text-sm text-zinc-500">Documento: {step.docType}</p>
                </div>
              ))}
            </div>
          </Surface>
        </section>
      </div>
    </main>
  );
}
