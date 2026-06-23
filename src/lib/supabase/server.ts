import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Em rotas de servidor, pode falhar se o cookie já foi enviado
            console.warn("[Supabase Server] Não foi possível setar cookies:", error);
          }
        },
      },
    }
  );
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
