import Link from "next/link";
import { ArrowRight, CheckCircle2, Clapperboard, FileText, MessageSquareReply, Sparkles, WalletCards } from "lucide-react";

const SALES_WHATSAPP = "5548998050267";

const modules = [
  {
    title: "Comercial audiovisual",
    text: "Cliente, recorrente, permuta e freelancer com origem, demanda, verba e próximo passo já claros.",
    icon: Sparkles,
  },
  {
    title: "Produção conectada",
    text: "Do briefing ao aceite: roteiro, decupagem, callsheet, checklist, revisão e entrega no mesmo fluxo.",
    icon: Clapperboard,
  },
  {
    title: "Studio Docs",
    text: "Proposta, briefing, contrato, recibo e checklist com dados e marca da produtora automaticamente.",
    icon: FileText,
  },
  {
    title: "Review profissional",
    text: "Link público, comentários por segundo, marcadores na timeline, status de aprovação e versões.",
    icon: MessageSquareReply,
  },
  {
    title: "Financeiro previsível",
    text: "A receber, pagos, custos, atrasos e previsão de caixa conectados à operação.",
    icon: WalletCards,
  },
];

const plans = [
  {
    name: "Solo",
    price: "R$79",
    period: "/mês",
    audience: "Criador independente",
    color: "#10b981",
    promise: "CRM, propostas e projetos audiovisuais para sair do improviso.",
    deliverables: ["Workspace individual", "CRM pipeline completo", "Projetos com fluxo Briefing-Roteiro-Entrega", "Checklist audiovisual por projeto", "Financeiro de recebidos e pendentes"],
    limits: "Ideal para até 25 clientes ativos e operação de uma pessoa.",
  },
  {
    name: "Pro",
    price: "R$149",
    period: "/mês",
    audience: "Freelancer premium",
    color: "#f97316",
    highlight: true,
    promise: "Studio OS completo para vender, documentar, produzir e receber melhor.",
    deliverables: ["Score de maturidade operacional", "Briefing, roteiro, callsheet e checklist em PDF", "Histórico de documentos restaurável", "Templates de produção e rotina", "Backup criptografado"],
    limits: "Ideal para freelancer premium com recorrência, propostas e pipeline ativo.",
  },
  {
    name: "Studio",
    price: "R$399",
    period: "/mês",
    audience: "Pequena equipe/agência",
    color: "#8b5cf6",
    promise: "Operação criativa com pipeline, documentos, receita e equipe no mesmo mapa.",
    deliverables: ["Modelos por nicho criativo", "Checklist premium de câmera, áudio, luz, produção, dados e pós", "Pipeline visual por projeto", "Relatórios para reunião com cliente", "Setup assistido de operação"],
    limits: "Ideal para times pequenos que precisam padronizar entrega e cobrança.",
  },
  {
    name: "White Label",
    price: "Sob consulta",
    period: "",
    audience: "Mentorias, escolas e comunidades",
    color: "#3b82f6",
    promise: "NEXO com sua marca para vender metodologia, operação e documentos profissionais.",
    deliverables: ["Marca e cor do parceiro", "Templates proprietários", "Documentos PDF com identidade própria", "Pacote de implantação", "Modelo comercial de revenda"],
    limits: "Ideal para quem quer vender NEXO como método ou sistema próprio.",
  },
];

const flow = [
  ["Contato", "Origem, demanda, verba e próxima ação."],
  ["Proposta", "Escopo nasce do CRM e fica no histórico."],
  ["Projeto", "Pipeline, checklist e produção guiada."],
  ["Review", "Cliente aprova vídeo sem perder contexto."],
  ["Recebimento", "Financeiro conectado à entrega."],
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-zinc-100">
      <section
        className="relative min-h-[92svh] overflow-hidden bg-cover bg-center px-4 py-5 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,8,8,.94) 0%, rgba(8,8,8,.78) 42%, rgba(8,8,8,.36) 100%), url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=85')",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid size-12 place-items-center rounded-2xl bg-orange-500 text-2xl font-black text-black">N</span>
            <span>
              <span className="block text-xl font-black leading-none">NEXO</span>
              <span className="block text-xs font-black uppercase tracking-[0.28em] text-orange-300">Studio OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-2xl px-4 py-3 text-sm font-black text-zinc-300 transition hover:text-white sm:inline-flex" href="#modulos">
              Módulos
            </Link>
            <Link className="hidden rounded-2xl px-4 py-3 text-sm font-black text-zinc-300 transition hover:text-white sm:inline-flex" href="#planos">
              Planos
            </Link>
            <Link className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400" href="/dashboard">
              Entrar
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid min-h-[calc(92svh-84px)] max-w-7xl items-center gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">Sistema operacional para audiovisual</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] sm:text-7xl lg:text-8xl">NEXO Studio OS</h1>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-zinc-300">
              Venda, produção, documentos, financeiro e aprovação de vídeo em um ambiente feito para filmmakers e produtoras que precisam operar sem virar administradores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400" href="#planos">
                Ver planos
                <ArrowRight size={17} />
              </Link>
              <Link className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-black/35 px-5 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/10" href="/dashboard">
                Entrar no workspace
              </Link>
            </div>
          </div>

          <aside className="hidden rounded-[32px] border border-white/10 bg-black/45 p-5 shadow-2xl backdrop-blur-2xl lg:block">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-400">Modelo de operação</p>
              <span className="rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">ao vivo</span>
            </div>
            <div className="mt-5 grid gap-3">
              {flow.map(([title, text], index) => (
                <div key={title} className="grid grid-cols-[54px_1fr_10px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-orange-500/15 text-sm font-black text-orange-300">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-sm font-black text-white">{title}</span>
                    <span className="mt-1 block text-xs font-bold leading-5 text-zinc-500">{text}</span>
                  </span>
                  <span className={index < 2 ? "size-2 rounded-full bg-orange-400" : "size-2 rounded-full bg-white/25"} />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["CRM", "vendas vivas"],
                ["PDF", "docs prontos"],
                ["REV", "aprovação"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
      </section>

      <section id="modulos" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Operação completa</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Um produto para o dia real de uma produtora.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <Icon className="text-orange-300" size={24} />
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm font-bold leading-6 text-zinc-500">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[32px] border border-orange-400/20 bg-orange-500/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Diferencial</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">Não é CRM genérico. É a mesa de operação da produtora.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Menos digitação com presets",
              "Documentos com branding",
              "Review sem login para cliente",
              "Pipeline de produção integrado",
              "Dados da produtora como fonte central",
              "Próximas ações sempre visíveis",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <CheckCircle2 className="shrink-0 text-emerald-300" size={20} />
                <p className="font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">Planos</p>
          <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Comece simples. Cresça por operação.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative overflow-hidden rounded-[28px] border p-6 backdrop-blur-xl ${
                  plan.highlight ? "border-orange-400/45 bg-orange-500/10 shadow-[0_24px_90px_rgba(249,115,22,0.10)]" : "border-white/10 bg-white/[0.045]"
                }`}
              >
                <div className="absolute -right-10 -top-10 size-28 rounded-full opacity-10" style={{ background: plan.color }} />
                <div className="relative">
                  <span className="inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]" style={{ borderColor: `${plan.color}55`, color: plan.color, background: `${plan.color}14` }}>
                    {plan.audience}
                  </span>
                  <h3 className="mt-5 text-2xl font-black">{plan.name}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">{plan.promise}</p>
                  <div className="mt-5">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="ml-1 text-sm font-black text-zinc-500">{plan.period}</span>
                  </div>
                  <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: `${plan.color}36`, background: `${plan.color}0d` }}>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: plan.color }}>Entregáveis reais</p>
                    <div className="grid gap-2">
                      {plan.deliverables.map((item) => (
                        <p key={item} className="flex gap-2 text-xs font-bold leading-5 text-zinc-400">
                          <span style={{ color: plan.color }}>✓</span>
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-bold leading-5 text-zinc-500">{plan.limits}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400" href="/dashboard">
              Entrar no workspace
              <ArrowRight size={17} />
            </Link>
            <a
              className="inline-flex min-h-12 items-center rounded-2xl border border-white/15 bg-white/[0.045] px-5 text-sm font-black text-white transition hover:bg-white/10"
              href={`https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent("Olá, quero entender qual plano do NEXO faz sentido para minha operação audiovisual.")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Falar com vendas
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
