"use client";

import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, Settings, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/studio", label: "Studio Docs", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, actions } = useWorkspaceState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="app-bg grid min-h-screen place-items-center">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-lg bg-orange-500 text-lg font-black text-black">N</div>
          <p className="mt-4 text-sm text-zinc-400">Carregando NEXO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-zinc-400">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded bg-orange-500 text-sm font-black text-black">N</div>
              <span className="hidden font-black text-white sm:inline">NEXO</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-zinc-500">{user.email}</span>
            )}
            <button onClick={actions.signOut} className="text-zinc-400 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className={`${mobileOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-zinc-950 pt-14 lg:static lg:block`}>
          <nav className="space-y-1 p-4">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    active ? "bg-orange-500 text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
