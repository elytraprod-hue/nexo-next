const CANONICAL_PRODUCTION_ORIGIN = "https://nexo-next-blue.vercel.app";

const BLOCKED_VERCEL_HOSTS = new Set(["nexo-next-elytraprod-hues-projects.vercel.app"]);

export function getCanonicalOrigin(origin?: string) {
  if (!origin) return CANONICAL_PRODUCTION_ORIGIN;

  try {
    const url = new URL(origin);
    if (BLOCKED_VERCEL_HOSTS.has(url.hostname)) return CANONICAL_PRODUCTION_ORIGIN;
    return url.origin;
  } catch {
    return CANONICAL_PRODUCTION_ORIGIN;
  }
}

export function shouldRedirectToCanonicalHost(hostname: string) {
  return BLOCKED_VERCEL_HOSTS.has(hostname);
}

