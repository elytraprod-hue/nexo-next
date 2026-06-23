import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.error("[Auth Callback] Código de autorização ausente");
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    console.error("[Auth Callback] Supabase não configurado");
    return NextResponse.redirect(`${origin}/auth/login?error=supabase_not_configured`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] Erro ao trocar código:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_exchange_failed`);
    }

    if (!data.session || !data.user) {
      console.error("[Auth Callback] Sessão ou usuário ausente após exchange");
      return NextResponse.redirect(`${origin}/auth/login?error=no_session`);
    }

    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, status")
      .eq("user_id", data.user.id)
      .limit(1)
      .maybeSingle();

    if (memberError) {
      console.error("[Auth Callback] Erro ao buscar workspace:", memberError.message);
    }

    if (!member) {
      const userName = data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "Studio";
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          owner_id: data.user.id,
          name: `${userName} OS`,
          plan: "starter",
          email: data.user.email ?? null,
        })
        .select("id")
        .single();

      if (workspaceError) {
        console.error("[Auth Callback] Erro ao criar workspace:", workspaceError.message);
        return NextResponse.redirect(`${origin}/auth/login?error=workspace_creation_failed`);
      }

      const { error: memberInsertError } = await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: data.user.id,
        email: data.user.email ?? null,
        role: "owner",
        status: "active",
      });

      if (memberInsertError) {
        console.error("[Auth Callback] Erro ao criar membership:", memberInsertError.message);
      }

      console.log("[Auth Callback] Workspace criado automaticamente:", workspace.id);
    } else {
      console.log("[Auth Callback] Workspace existente:", member.workspace_id);
    }

    return response;
  } catch (err) {
    console.error("[Auth Callback] Erro inesperado:", err);
    return NextResponse.redirect(`${origin}/auth/login?error=unexpected`);
  }
}
