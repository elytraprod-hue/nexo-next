import { NextResponse, type NextRequest } from "next/server";
import { shouldRedirectToCanonicalHost } from "@/lib/site-url";

const CANONICAL_ORIGIN = "https://nexo-next-blue.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.nextUrl.hostname;

  if (!shouldRedirectToCanonicalHost(host)) {
    return NextResponse.next();
  }

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, CANONICAL_ORIGIN);
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

