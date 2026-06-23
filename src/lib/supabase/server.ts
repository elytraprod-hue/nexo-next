import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios");
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[getSession] Erro:", error.message);
    return null;
  }

  return session;
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("[getUser] Erro ou usuário não encontrado:", error?.message);
    return null;
  }

  return user;
}

export async function getWorkspaceMembership(userId: string) {
  const supabase = createClient();

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, status, email")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getWorkspaceMembership] Erro:", error.message);
    return null;
  }

  return member;
}
