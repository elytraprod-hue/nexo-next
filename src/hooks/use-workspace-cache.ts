"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadCloudWorkspace } from "@/services/workspace-service";
import type { User } from "@supabase/supabase-js";

const WORKSPACE_KEY = "workspace";

export function useWorkspaceCache(user: User | null) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery({
    queryKey: [WORKSPACE_KEY, user?.id],
    queryFn: async () => {
      if (!supabase || !user) return null;
      return loadCloudWorkspace(supabase, user);
    },
    enabled: !!supabase && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const invalidateWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: [WORKSPACE_KEY, user?.id] });
  };

  return {
    workspace: workspaceQuery.data,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
    error: workspaceQuery.error,
    invalidateWorkspace,
  };
}

export function useClientsCache(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["clients", workspaceId],
    queryFn: async () => {
      if (!supabase || !workspaceId) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .returns();
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase && !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useProjectsCache(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!supabase || !workspaceId) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .returns();
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase && !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFinanceCache(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["finance", workspaceId],
    queryFn: async () => {
      if (!supabase || !workspaceId) return [];
      const { data, error } = await supabase
        .from("finance_entries")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("due_at", { ascending: true })
        .returns();
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase && !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
}
