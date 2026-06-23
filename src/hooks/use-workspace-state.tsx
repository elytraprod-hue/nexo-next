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
  state: (WorkspaceState & { privacyMode?: boolean }) | null;
  metrics: {
    totalClients: number;
    activeProjects: number;
    pendingReceivables: number;
    receivable: number;
    monthlyRevenue: number;
  };
  workspaceRole: string | null;
  workspaceMemberStatus: string | null;
  syncMessage: string | null;
  syncStatus: string | null;
  supabaseConfigured: boolean;
  actions: WorkspaceStateActions & { togglePrivacy?: () => void };
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const [workspaceMemberStatus, setWorkspaceMemberStatus] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const loadWorkspaceState = useCallback(async () => {
    if (!supabase) {
      setSupabaseConfigured(false);
      setReady(true);
      return;
    }

    setSupabaseConfigured(true);
    setSyncStatus("loading");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setReady(true);
        setSyncStatus("idle");
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, status")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        console.error("[WorkspaceProvider] Erro:", memberError);
        setSyncStatus("error");
        setReady(true);
        return;
      }

      if (!member) {
        setWorkspaceMemberStatus("local");
        setWorkspaceRole(null);
        setSyncStatus("idle");
        setReady(true);
        return;
      }

      setWorkspaceRole(member.role);
      setWorkspaceMemberStatus(member.status);

      if (member.status !== "active") {
        setSyncMessage("Sua conta está pendente de aprovação.");
        setSyncStatus("idle");
        setReady(true);
        return;
      }

      const state = await loadCloudWorkspace(supabase, user);

      if (state) {
        setWorkspaceState(state);
      } else {
        setWorkspaceState({
          businessProfile: { name: "", cnpj: "", email: "", phone: "", siteUrl: "", logoUrl: "" },
          clients: [],
          projects: [],
          documents: [],
          finance: [],
          lastSync: new Date().toISOString(),
        });
      }

      setSyncStatus("synced");
      setReady(true);
    } catch (err) {
      console.error("[WorkspaceProvider] Erro:", err);
      setSyncStatus("error");
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

  const togglePrivacy = () => setPrivacyMode(prev => !prev);

  const actions = {
    signInWithGitHub,
    signOut,
    loadWorkspaceState,
    togglePrivacy,
  };

  const pendingReceivables = workspaceState?.finance?.filter((f: { status?: string; type?: string }) => f.status === "pending" && f.type === "receivable")?.reduce((sum: number, f: { amount?: number }) => sum + (f.amount ?? 0), 0) ?? 0;

  const metrics = {
    totalClients: workspaceState?.clients?.length ?? 0,
    activeProjects: workspaceState?.projects?.filter((p: { status?: string }) => p.status === "active" || p.status === "in_progress")?.length ?? 0,
    pendingReceivables,
    receivable: pendingReceivables, // alias para AppShell
    monthlyRevenue: workspaceState?.finance?.filter((f: { status?: string; type?: string }) => f.status === "paid" && f.type === "receivable")?.reduce((sum: number, f: { amount?: number }) => sum + (f.amount ?? 0), 0) ?? 0,
  };

  const state = workspaceState ? { ...workspaceState, privacyMode } : null;

  const value: WorkspaceContextType = {
    ready,
    user,
    workspaceState,
    state,
    metrics,
    workspaceRole,
    workspaceMemberStatus,
    syncMessage,
    syncStatus,
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
