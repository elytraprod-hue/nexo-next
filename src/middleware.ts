import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/reset-password", "/auth/onboarding", "/auth/blocked"];
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

function getSessionFromCookies(request: NextRequest): { access_token?: string; refresh_token?: string } | null {
  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;

  if (!accessToken) return null;

  return { access_token: accessToken, refresh_token: refreshToken };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se for rota pública, permite sem verificar auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verificar se há token de sessão nos cookies
  const session = getSessionFromCookies(request);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token existe, permite passar (validação detalhada é feita no client/server)
  // Adicionar headers para o client saber que está autenticado
  const response = NextResponse.next();
  response.headers.set("x-auth-required", "true");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
