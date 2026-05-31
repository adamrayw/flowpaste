import { prisma } from "@/lib/prisma";

export type RaytechUser = {
  id: string;
  name: string;
  email: string;
};

const fallbackAuthBaseUrl = "http://localhost:3000";

export const raytechAuthBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.RAYTECH_AUTH_URL ||
  fallbackAuthBaseUrl;

export const raytechSessionCookieName =
  process.env.RAYTECH_SESSION_COOKIE_NAME ||
  process.env.COOKIE_NAME ||
  "raytech_session";

const LOCAL_PASSWORD_PLACEHOLDER = "__managed_by_raytech_account__";

function fallbackNameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.trim();
  return localPart ? localPart : "RayTech User";
}


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

export function getAuthSignOutUrl() {
  return getAuthUrl("/api/auth/sign-out");
}

export async function getRaytechUserByCookie(params: {
  cookieHeader?: string | null;
  origin?: string | null;
}): Promise<RaytechUser | null> {
  const headers = new Headers();

  if (params.cookieHeader) {
    headers.set("cookie", params.cookieHeader);
  }

  if (params.origin) {
    headers.set("x-raytech-origin", params.origin);
  }

  const response = await fetch(getAuthUrl("/api/me"), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Partial<RaytechUser>;

  if (!data.id || !data.email) {
    return null;
  }

  const normalizedEmail = data.email.toLowerCase();
  const normalizedName = data.name?.trim() || fallbackNameFromEmail(normalizedEmail);

  return {
    id: data.id,
    email: normalizedEmail,
    name: normalizedName,
  };
}

async function syncLocalUser(user: RaytechUser) {
  const existingById = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (existingById) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });
    return;
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  if (!existingByEmail) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: LOCAL_PASSWORD_PLACEHOLDER,
      },
    });
    return;
  }

  if (existingByEmail.id === user.id) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const byId = await tx.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (byId) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
        },
      });
      return;
    }

    const byEmail = await tx.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!byEmail) {
      await tx.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: LOCAL_PASSWORD_PLACEHOLDER,
        },
      });
      return;
    }

    if (byEmail.id === user.id) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
        },
      });
      return;
    }

    const legacyUserId = byEmail.id;
    const legacyEmailPlaceholder = `legacy_${legacyUserId}@local.raytech.invalid`;

    await tx.user.update({
      where: { id: legacyUserId },
      data: { email: legacyEmailPlaceholder },
    });

    await tx.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: LOCAL_PASSWORD_PLACEHOLDER,
      },
    });

    await tx.paste.updateMany({
      where: { userId: legacyUserId },
      data: { userId: user.id },
    });

    await tx.collection.updateMany({
      where: { userId: legacyUserId },
      data: { userId: user.id },
    });

    await tx.user.delete({
      where: { id: legacyUserId },
    });
  });
}

export async function getAuthorizedRaytechUser(request: Request): Promise<RaytechUser | null> {
  const user = await getRaytechUserByCookie({
    cookieHeader: request.headers.get("cookie"),
    origin: request.headers.get("origin"),
  });

  if (!user) {
    return null;
  }

  await syncLocalUser(user);

  return user;
}
