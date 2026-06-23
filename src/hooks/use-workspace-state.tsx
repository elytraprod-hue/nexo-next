"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadCloudWorkspace } from "@/services/workspace-service";
import type { User } from "@supabase/supabase-js";
import type { WorkspaceState, WorkspaceStateActions } from "@/lib/workspace-state";

interface WorkspaceContextType {
  ready: boolean;
  user: User | null;
  workspaceState: WorkspaceState | null;
  workspaceRole: string | null;
  workspaceMemberStatus: string | null;
  syncMessage: string | null;
  supabaseConfigured: boolean;
  actions: WorkspaceStateActions;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null);
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const [workspaceMemberStatus, setWorkspaceMemberStatus] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const loadWorkspaceState = useCallback(async () => {
    if (!supabase) {
      setSyncMessage("Supabase não configurado.");
      setReady(true);
      return;
    }

    setSupabaseConfigured(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setReady(true);
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, status")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        console.error("[WorkspaceProvider] Erro ao buscar member:", memberError);
        setSyncMessage("Erro ao carregar workspace.");
        setReady(true);
        return;
      }

      if (!member) {
        setWorkspaceMemberStatus("local");
        setWorkspaceRole(null);
        setReady(true);
        return;
      }

      setWorkspaceRole(member.role);
      setWorkspaceMemberStatus(member.status);

      if (member.status !== "active") {
        setSyncMessage("Sua conta está pendente de aprovação.");
        setReady(true);
        return;
      }

      const state = await loadCloudWorkspace(supabase, user);

      if (state) {
        setWorkspaceState(state);
      } else {
        setWorkspaceState({
          businessProfile: {
            name: "",
            cnpj: "",
            email: "",
            phone: "",
            siteUrl: "",
            logoUrl: "",
          },
          clients: [],
          projects: [],
          documents: [],
          finance: [],
          lastSync: new Date().toISOString(),
        });
      }

      setReady(true);
    } catch (err) {
      console.error("[WorkspaceProvider] Erro:", err);
      setSyncMessage("Erro inesperado ao carregar dados.");
      setReady(true);
    }
  }, [supabase]);

  useEffect(() => {
    loadWorkspaceState();
  }, [loadWorkspaceState]);

  const signInWithGitHub = async () => {
    if (!supabase) return;
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setWorkspaceState(null);
    setWorkspaceRole(null);
    setWorkspaceMemberStatus(null);
    window.location.href = "/auth/login";
  };

  const actions: WorkspaceStateActions = {
    signInWithGitHub,
    signOut,
    loadWorkspaceState,
  };

  const value: WorkspaceContextType = {
    ready,
    user,
    workspaceState,
    workspaceRole,
    workspaceMemberStatus,
    syncMessage,
    supabaseConfigured,
    actions,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceState() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceState deve ser usado dentro de WorkspaceProvider");
  }
  return context;
}
