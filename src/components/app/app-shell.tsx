"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Bell,
  Clapperboard,
  Command,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Home,
  Lock,
  MessageSquareReply,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
  WalletCards,
} from "lucide-react";
import { CommandPalette } from "@/components/app/command-palette";
import { AuthStatus } from "@/components/app/auth-status";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { canAccessAdmin } from "@/lib/auth/roles";

const navigation = [
  { href: "/dashboard", label: "Hoje", icon: Home },
  { href: "/clientes", label: "Vender", icon: BriefcaseBusiness },
  { href: "/projetos", label: "Produzir", icon: Clapperboard },
  { href: "/studio", label: "Documentar", icon: FileText },
  { href: "/review", label: "Aprovar", icon: MessageSquareReply },
  { href: "/financeiro", label: "Receber", icon: WalletCards },
  { href: "/configuracoes", label: "Empresa", icon: Settings },
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
  const [commandOpen, setCommandOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(true);
  const [locked, setLocked] = useState(false);
  const [bootVisible, setBootVisible] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [intelHidden, setIntelHidden] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { state, metrics, ready, user, syncStatus, syncMessage, actions, workspaceMemberStatus, workspaceRole } = useWorkspaceState();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => setBootVisible(false), 620);
    const lastExit = localStorage.getItem("nexo_last_exit");
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "criador";
    const message = lastExit ? `${greeting}, ${name}. Sessão restaurada.` : `${greeting}, ${name}. NEXO pronto para operar.`;
    const welcome = window.setTimeout(() => setToast(message), 780);
    const hide = window.setTimeout(() => setToast(null), 3900);

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(welcome);
      window.clearTimeout(hide);
    };
  }, [ready, user]);

  useEffect(() => {
    const onHide = () => localStorage.setItem("nexo_last_exit", new Date().toISOString());
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    if (syncStatus === "error" && syncMessage) {
      setToast(syncMessage);
      const timeout = window.setTimeout(() => setToast(null), 4600);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [syncMessage, syncStatus]);

  const intel = [
    state.clients.filter((client) => client.status === "lead").length
      ? {
          id: "leads",
          label: `${state.clients.filter((client) => client.status === "lead").length} cliente(s) para responder`,
          href: "/clientes",
          color: "var(--orange)",
        }
      : null,
    state.projects.filter((project) => project.status === "review").length
      ? {
          id: "review",
          label: `${state.projects.filter((project) => project.status === "review").length} projeto(s) em aprovação`,
          href: "/review/demo",
          color: "var(--cyan)",
        }
      : null,
    state.projects.filter((project) => project.status !== "entregue" && project.deadline).length
      ? {
          id: "deadline",
          label: `Próxima entrega: ${formatDate(
            [...state.projects].filter((project) => project.status !== "entregue" && project.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline))[0]
              ?.deadline,
          )}`,
          href: "/projetos",
          color: "var(--violet)",
        }
      : null,
    metrics.receivable
      ? {
          id: "money",
          label: `${formatCurrency(metrics.receivable, state.privacyMode)} a receber`,
          href: "/financeiro",
          color: "#facc15",
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; href: string; color: string }[];
  const navigationItems = canAccessAdmin(workspaceRole, workspaceMemberStatus)
    ? [...navigation, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : navigation;

  return (
    <main className="app-bg min-h-screen text-zinc-100">
      {bootVisible ? (
        <div className="boot-loader">
          <div className="boot-card">
            <div className="boot-logo">N</div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">NEXO Studio OS</p>
            <h2 className="mt-3 text-2xl font-black leading-tight">Restaurando ambiente operacional</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Sessão, workspace, comandos e contexto do dia.</p>
            <div className="boot-line"><span /></div>
          </div>
        </div>
      ) : null}

      {locked ? (
        <div className="lock-screen" role="dialog" aria-modal="true" aria-label="Tela bloqueada">
          <div className="lock-card">
            <div className="grid size-14 place-items-center rounded-2xl bg-orange-500 text-2xl font-black text-black">N</div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-orange-300">Proteção ativa</p>
            <h2 className="mt-2 text-3xl font-black">Tela bloqueada</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Valores, clientes e operação ficam protegidos neste navegador. Desbloqueie para voltar ao workspace.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-black">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-zinc-400">Privacidade<br /><span className="text-orange-300">{state.privacyMode ? "Oculta" : "Manual"}</span></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-zinc-400">Cloud<br /><span className="text-emerald-300">{syncStatus === "cloud" ? "OK" : "Local"}</span></div>
            </div>
            <button className="mt-5 min-h-12 w-full rounded-2xl bg-orange-500 text-sm font-black text-black" type="button" onClick={() => setLocked(false)}>
              Desbloquear sessão
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="toast-premium" role="status" aria-live="polite">
          <div className="toast-accent" />
          <div className="toast-body">
            <p className="toast-title">Sistema</p>
            <p className="toast-msg">{toast}</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-3 py-4 sm:px-5 lg:px-6">
        <aside
          className={cn(
            "hidden shrink-0 flex-col gap-3 rounded-[22px] border border-white/[0.075] bg-black/42 p-3 shadow-2xl backdrop-blur-2xl transition-[width] duration-300 md:flex",
            sidebarCollapsed ? "w-[76px]" : "w-[236px]",
          )}
        >
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-orange-400/15 bg-orange-500/[0.08] p-3",
                sidebarCollapsed ? "justify-center" : "",
              )}
              title="NEXO Studio OS"
            >
            <div className="grid size-11 place-items-center rounded-xl border border-orange-400/40 bg-orange-500 text-xl font-black text-black shadow-[0_0_28px_rgba(255,106,0,0.25)]">
              {state.businessProfile.name.slice(0, 1) || "N"}
            </div>
            {!sidebarCollapsed ? <div className="min-w-0">
              <p className="display-font text-xl font-black leading-none">NEXO</p>
              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">{state.businessProfile.name} OS</p>
            </div> : null}
            </Link>
            {!sidebarCollapsed ? (
              <button
                aria-label="Recolher lateral"
                className="premium-control grid size-11 place-items-center rounded-xl text-zinc-400 transition hover:text-white"
                type="button"
                onClick={() => setSidebarCollapsed(true)}
              >
                <PanelLeftClose size={18} />
              </button>
            ) : null}
          </div>

          {sidebarCollapsed ? (
            <button
              aria-label="Expandir lateral"
              className="premium-control grid size-11 place-items-center rounded-xl text-zinc-400 transition hover:text-white"
              type="button"
              onClick={() => setSidebarCollapsed(false)}
            >
              <PanelLeftOpen size={18} />
            </button>
          ) : null}

          <div className="premium-card rounded-xl p-2">
            {!sidebarCollapsed ? <p className="px-2 pt-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Acesso rápido</p> : null}
            <nav className="mt-3 grid gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex min-h-10 items-center rounded-lg text-sm font-black transition",
                      sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                      active
                        ? "os-left-accent border border-orange-400/24 bg-orange-500/[0.12] text-orange-300 shadow-[0_12px_30px_rgba(255,106,0,0.1)]"
                        : "border border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.055] hover:text-white",
                    )}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed ? item.label : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {primaryAction ? (
            <Link
              href={primaryAction.href}
              title={primaryAction.label}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-black text-black transition hover:bg-orange-400",
                sidebarCollapsed ? "px-2" : "px-4",
              )}
            >
              <Plus size={18} />
              {!sidebarCollapsed ? primaryAction.label : null}
            </Link>
          ) : null}

          <div className={cn("premium-card rounded-xl p-3", sidebarCollapsed ? "grid justify-center gap-2" : "")}>
            {!sidebarCollapsed ? <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</p> : null}
            {!sidebarCollapsed ? <div className="mt-3 flex items-center justify-between gap-3 text-xs font-black">
              <span className="text-zinc-400">Workspace</span>
              <span className={syncStatus === "cloud" ? "text-emerald-300" : "text-orange-300"}>
                {syncStatus === "cloud" ? "Cloud OK" : "Local"}
              </span>
            </div> : null}
            <button
              className={cn(
                "premium-control inline-flex min-h-9 items-center justify-center gap-2 rounded-lg text-xs font-black text-zinc-300",
                sidebarCollapsed ? "size-10" : "mt-3 w-full",
              )}
              type="button"
              onClick={actions.togglePrivacy}
              title={state.privacyMode ? "Valores ocultos" : "Valores visíveis"}
            >
              {state.privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
              {!sidebarCollapsed ? (state.privacyMode ? "Valores ocultos" : "Valores visíveis") : null}
            </button>
          </div>

          {!sidebarCollapsed ? <div className="mt-auto rounded-xl border border-cyan-300/12 bg-cyan-300/[0.055] p-3">
            <Sparkles className="text-cyan-300" size={18} />
            <p className="mt-3 text-sm font-black">Regra do produto</p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">Menos cliques, menos digitação, mais operação pronta.</p>
          </div> : null}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="sticky top-4 z-30 rounded-[22px] border border-white/[0.075] bg-black/50 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">{eyebrow}</p>
                  <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                  {subtitle ? <p className="max-w-2xl truncate text-xs font-bold text-zinc-500">{subtitle}</p> : null}
                </div>
                <h1 className="mt-1 text-lg font-black leading-tight sm:text-xl">{title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="premium-control hidden min-h-10 min-w-[240px] items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-zinc-500 transition hover:text-zinc-300 xl:flex"
                  type="button"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search size={17} />
                  Comando rápido
                  <span className="ml-auto rounded-lg bg-white/10 px-2 py-1 text-[10px] text-zinc-400">⌘K</span>
                </button>
                <AuthStatus />
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto md:hidden">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-black transition",
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

          {intel.length && !intelHidden ? (
            <section className="notification-slide flex flex-col gap-2 rounded-[22px] border border-orange-400/16 bg-orange-500/[0.075] p-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-orange-500/15 text-orange-300">
                  <Bell size={17} />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Contexto ativo</p>
                  <p className="mt-1 text-sm font-bold text-zinc-300">{intel[0].label}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {intel.slice(0, 3).map((item) => (
                  <Link key={item.id} className="rounded-lg border px-3 py-2 text-xs font-black" href={item.href} style={{ borderColor: `${item.color}44`, color: item.color }}>
                    {item.label}
                  </Link>
                ))}
                <button className="grid size-9 place-items-center rounded-lg border border-white/10 text-zinc-500" type="button" onClick={() => setIntelHidden(true)} aria-label="Fechar contexto">
                  <X size={16} />
                </button>
              </div>
            </section>
          ) : null}

          {children}

          {dockOpen ? (
            <div className="quick-dock" aria-label="Controles rápidos">
              <button className="dock-btn active" aria-label="Esconder controles" type="button" onClick={() => setDockOpen(false)}>
                <X size={16} />
              </button>
              <button className="dock-btn" aria-label="Comando rápido" type="button" onClick={() => setCommandOpen(true)} title="Comando rápido">
                <Command size={17} />
              </button>
              <button className={`dock-btn ${state.privacyMode ? "active" : ""}`} aria-label="Privacidade de valores" type="button" onClick={actions.togglePrivacy} title="Privacidade de valores">
                {state.privacyMode ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              <button className="dock-btn" aria-label="Bloquear tela" type="button" onClick={() => setLocked(true)} title="Bloquear tela">
                <Lock size={17} />
              </button>
              <Link className="dock-btn" aria-label="Indicadores" href="/financeiro" title="Indicadores">
                <BarChart3 size={17} />
              </Link>
            </div>
          ) : (
            <button className="dock-toggle" aria-label="Mostrar controles rápidos" type="button" onClick={() => setDockOpen(true)} title="Mostrar controles">
              <Command size={20} />
            </button>
          )}

          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </section>
      </div>
    </main>
  );
}
