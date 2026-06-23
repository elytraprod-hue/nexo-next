import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SE FOR ROTA PÚBLICA: passa direto SEM NENHUMA VERIFICAÇÃO
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
