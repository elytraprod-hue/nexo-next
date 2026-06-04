"use client";

import { CloudOff, LogIn } from "lucide-react";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { canAccessAdmin, canAccessInternal, normalizeRole } from "@/lib/auth/roles";

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { actions, ready, supabaseConfigured, syncMessage, user, workspaceMemberStatus, workspaceRole } = useWorkspaceState();

  if (!ready) {
    return (
      <main className="app-bg grid min-h-screen place-items-center px-6 text-center text-zinc-200">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Carregando sessão</p>
          <h1 className="mt-3 text-2xl font-black">Validando acesso...</h1>
          <p className="mt-3 text-sm text-zinc-400">Aguarde enquanto confirmamos sua autenticação e permissões.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-bg grid min-h-screen place-items-center px-6 text-center text-zinc-200">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-orange-500 text-xl font-black text-black">N</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-orange-300">Acesso interno</p>
          <h1 className="mt-3 text-2xl font-black">Entrar no NEXO Studio OS</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Use GitHub para restaurar seu workspace, permissões e dados conectados ao Supabase.</p>
          <button
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!supabaseConfigured}
            type="button"
            onClick={actions.signInWithGithub}
          >
            {supabaseConfigured ? <LogIn size={18} /> : <CloudOff size={18} />}
            {supabaseConfigured ? "Entrar com GitHub" : "Supabase não configurado"}
          </button>
          {syncMessage ? <p className="mt-3 text-xs font-bold leading-5 text-zinc-500">{syncMessage}</p> : null}
        </div>
      </main>
    );
  }

  if (!canAccessInternal(workspaceRole, workspaceMemberStatus)) {
    return (
      <main className="app-bg grid min-h-screen place-items-center px-6 text-center text-zinc-200">
        <div className="max-w-md rounded-2xl border border-orange-400/25 bg-orange-500/10 p-6 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Permissão</p>
          <h1 className="mt-3 text-2xl font-black">Acesso limitado</h1>
          <p className="mt-3 text-sm text-zinc-300">
            Seu perfil atual é {normalizeRole(workspaceRole)} com status {workspaceMemberStatus ?? "local"}. Peça liberação para acessar os módulos internos.
          </p>
        </div>
      </main>
    );
  }

  if (requireAdmin && !canAccessAdmin(workspaceRole, workspaceMemberStatus)) {
    return (
      <main className="app-bg grid min-h-screen place-items-center px-6 text-center text-zinc-200">
        <div className="max-w-md rounded-2xl border border-orange-400/25 bg-orange-500/10 p-6 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Admin</p>
          <h1 className="mt-3 text-2xl font-black">Permissão de administrador necessária</h1>
          <p className="mt-3 text-sm text-zinc-300">A área de gestão de usuários está restrita a owner/admin.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
