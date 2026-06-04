"use client";

import { AppShell } from "@/components/app/app-shell";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import type { MemberStatus, UserRole } from "@/lib/auth/roles";

export function AdminPage() {
  const { actions, user, workspaceMemberStatus, workspaceMembers, workspaceRole } = useWorkspaceState();

  function manageRole(memberId: string, role: UserRole) {
    actions.updateWorkspaceMemberRole(memberId, role);
  }

  function manageStatus(memberId: string, status: MemberStatus) {
    actions.updateWorkspaceMemberStatus(memberId, status);
  }

  return (
    <AppShell eyebrow="Admin" title="Usuários e permissões" subtitle="Gestão simples de acesso, aprovação e papéis para o workspace.">
      <Surface>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Conta principal</p>
            <h2 className="mt-2 text-2xl font-black text-white">{user?.email ?? "Sua conta"}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Função atual: {workspaceRole ?? "member"} · status {workspaceMemberStatus ?? "local"}. Esta tela agora usa permissões reais do Supabase.
            </p>
          </div>
          <span className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">owner/admin</span>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.04] text-zinc-300">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/10 text-zinc-200">
              {workspaceMembers.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 font-semibold">{entry.email}</td>
                  <td className="px-4 py-3">
                    <select value={entry.role} onChange={(event) => manageRole(entry.id, event.target.value as UserRole)} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100">
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                      <option value="client">client</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={entry.status} onChange={(event) => manageStatus(entry.id, event.target.value as MemberStatus)} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100">
                      <option value="active">ativo</option>
                      <option value="pending">pendente</option>
                      <option value="blocked">bloqueado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400">Atualize o perfil acima</td>
                </tr>
              ))}
              {!workspaceMembers.length && <tr><td className="px-4 py-6 text-zinc-400" colSpan={4}>Nenhum usuário foi carregado ainda. Aplique as migrations e faça login para popular o workspace.</td></tr>}
            </tbody>
          </table>
        </div>
      </Surface>
    </AppShell>
  );
}
