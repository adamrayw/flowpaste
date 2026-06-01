function sanitizeEnvValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/^['"]+|['"]+$/g, "");
}

const fallbackAuthBaseUrl = "http://localhost:3003";

const raytechAuthBaseUrl =
  sanitizeEnvValue(process.env.NEXT_PUBLIC_AUTH_URL) ||
  fallbackAuthBaseUrl;

function getAuthUrl(path: string) {
  return new URL(path, raytechAuthBaseUrl).toString();
}

export function buildAuthLoginUrl(returnTo?: string) {
  const url = new URL(getAuthUrl("/login"));
  if (returnTo) {
    url.searchParams.set("returnTo", returnTo);
  }
  return url.toString();
}

export function buildAuthRegisterUrl(returnTo?: string) {
  const url = new URL(getAuthUrl("/register"));
  if (returnTo) {
    url.searchParams.set("returnTo", returnTo);
  }
  return url.toString();
}
