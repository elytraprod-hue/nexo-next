"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Clapperboard,
  FileText,
  Home,
  MessageSquareReply,
  Plus,
  Search,
  Settings,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/", label: "Hoje", icon: Home },
  { href: "/clientes", label: "Comercial", icon: BriefcaseBusiness },
  { href: "/projetos", label: "Produção", icon: Clapperboard },
  { href: "/studio", label: "Studio Docs", icon: FileText },
  { href: "/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/review/demo", label: "Review", icon: MessageSquareReply },
];

type AppShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
};

export function AppShell({ children, eyebrow = "Studio OS", title = "NEXO Central", subtitle, primaryAction }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="app-bg min-h-screen text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 px-3 py-3 sm:px-4 lg:px-5">
        <aside className="hidden w-[280px] shrink-0 flex-col gap-4 rounded-[32px] border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur-2xl lg:flex">
          <Link href="/" className="flex items-center gap-3 rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-3">
            <div className="grid size-14 place-items-center rounded-[20px] border border-orange-400/40 bg-orange-500 text-2xl font-black text-black shadow-[0_0_34px_rgba(255,106,0,0.35)]">
              N
            </div>
            <div>
              <p className="text-xl font-black leading-none tracking-wide">DNZ FILMS</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.28em] text-orange-400">Studio OS</p>
            </div>
          </Link>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-3">
            <p className="px-2 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">Acesso rápido</p>
            <nav className="mt-3 grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-black transition",
                      active ? "bg-orange-500 text-black shadow-[0_12px_30px_rgba(255,106,0,0.24)]" : "text-zinc-400 hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <Sparkles className="text-cyan-300" size={22} />
            <p className="mt-4 text-sm font-black">Regra do produto</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Menos cliques, menos digitação, mais operação audiovisual pronta.</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="sticky top-3 z-30 rounded-[28px] border border-white/10 bg-black/45 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-orange-400">{eyebrow}</p>
                <h1 className="mt-1 truncate text-2xl font-black leading-tight sm:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden min-h-11 min-w-[260px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-zinc-500 md:flex">
                  <Search size={17} />
                  Buscar cliente, projeto ou documento
                </div>
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-black text-black transition hover:bg-orange-400"
                  >
                    <Plus size={18} />
                    {primaryAction.label}
                  </Link>
                ) : null}
                <button
                  type="button"
                  aria-label="Configurações"
                  className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-zinc-400 transition hover:text-white"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-black transition",
                      active ? "bg-orange-500 text-black" : "bg-white/[0.055] text-zinc-400",
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {children}

          <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
            <Link
              href="/clientes"
              className="grid size-14 place-items-center rounded-2xl border border-orange-400/30 bg-orange-500 text-black shadow-[0_18px_50px_rgba(255,106,0,0.35)] transition hover:scale-105"
              title="Novo cliente guiado"
            >
              <Plus size={24} />
            </Link>
            <Link
              href="/financeiro"
              className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-black/60 text-zinc-300 shadow-xl backdrop-blur-xl transition hover:text-white"
              title="Indicadores"
            >
              <BarChart3 size={20} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
