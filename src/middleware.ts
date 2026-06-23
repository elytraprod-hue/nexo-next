import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/reset-password"];
const PUBLIC_API_ROUTES = ["/api/public", "/review"];
const CLIENT_PORTAL_ROUTES = ["/cliente"];
const STATIC_ASSETS = ["/_next", "/favicon.ico", "/images", "/fonts", "/api/webhook"];

function isPublicRoute(pathname: string): boolean {
  if (STATIC_ASSETS.some((prefix) => pathname.startsWith(prefix))) return true;
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) return true;
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) return true;
  if (CLIENT_PORTAL_ROUTES.some((route) => pathname.startsWith(route))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se for rota pública, permite sem verificar auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Criar cliente Supabase para o middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Middleware não pode setar cookies diretamente, apenas passa adiante
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Verificar sessão
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar workspace membership para rotas internas
  if (!pathname.startsWith("/cliente") && !pathname.startsWith("/review")) {
    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("role, status, workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (memberError || !member) {
      // Usuário sem workspace — redireciona para onboarding
      const onboardingUrl = new URL("/auth/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    if (member.status !== "active") {
      // Usuário bloqueado ou pendente
      const blockedUrl = new URL("/auth/blocked", request.url);
      return NextResponse.redirect(blockedUrl);
    }

    // Verificar permissão de admin para rotas /admin
    if (pathname.startsWith("/admin")) {
      const isAdmin = member.role === "owner" || member.role === "admin";
      if (!isAdmin) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // Adicionar headers com info do workspace para o client
    const response = NextResponse.next();
    response.headers.set("x-workspace-id", member.workspace_id);
    response.headers.set("x-user-role", member.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
