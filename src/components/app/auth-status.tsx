"use client";

import { Cloud, CloudOff, Loader2, LogIn, LogOut } from "lucide-react";
import { useWorkspaceState } from "@/hooks/use-workspace-state";

const statusLabel = {
  local: "Local",
  loading: "Sincronizando",
  cloud: "Supabase",
  error: "Atenção",
};

export function AuthStatus() {
  const { user, syncStatus, syncMessage, actions } = useWorkspaceState();
  const connected = syncStatus === "cloud";
  const loading = syncStatus === "loading";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`hidden min-h-11 items-center gap-2 rounded-2xl border px-3 text-xs font-black md:flex ${
          connected
            ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
            : syncStatus === "error"
              ? "border-orange-300/25 bg-orange-300/10 text-orange-300"
              : "border-white/10 bg-white/[0.055] text-zinc-400"
        }`}
        title={syncMessage}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : connected ? <Cloud size={16} /> : <CloudOff size={16} />}
        {statusLabel[syncStatus]}
      </div>

      {user ? (
        <button
          className="inline-flex min-h-11 max-w-[220px] items-center gap-2 truncate rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-black text-zinc-300 transition hover:text-white"
          type="button"
          onClick={actions.signOut}
          title={user.email ?? "Sair"}
        >
          <LogOut size={16} />
          <span className="truncate">{user.email ?? "Sair"}</span>
        </button>
      ) : (
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-orange-400/25 bg-orange-500/15 px-3 text-sm font-black text-orange-300 transition hover:bg-orange-500 hover:text-black"
          type="button"
          onClick={actions.signInWithGithub}
        >
          <LogIn size={17} />
          Entrar GitHub
        </button>
      )}
    </div>
  );
}
