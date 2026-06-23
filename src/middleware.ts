import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/reset-password", "/auth/onboarding", "/auth/blocked"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se for rota pública, permite
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Verificar se há token de sessão
  const hasToken = request.cookies.has("sb-access-token") || request.cookies.has("sb-refresh-token");

  if (!hasToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)"],
};
