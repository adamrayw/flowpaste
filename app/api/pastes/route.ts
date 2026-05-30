import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const createPasteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  language: z.string().trim().min(1, "Language is required").max(32),
  description: z.string().trim().max(240, "Description is too long").optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional().default("public"),
  password: z.string().trim().max(120).optional(),
  expiresIn: z.enum(["never", "1hour", "1day", "7days", "30days"]).optional().default("never"),
});

function toExpiryDate(expiresIn: z.infer<typeof createPasteSchema>["expiresIn"]) {
  const now = Date.now();

  if (expiresIn === "1hour") {
    return new Date(now + 60 * 60 * 1000);
  }
  if (expiresIn === "1day") {
    return new Date(now + 24 * 60 * 60 * 1000);
  }
  if (expiresIn === "7days") {
    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }
  if (expiresIn === "30days") {
    return new Date(now + 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const favoriteOnly = searchParams.get("favorite") === "true";

  const items = await prisma.paste.findMany({
    where: {
      userId: user.id,
      ...(favoriteOnly ? { isFavorite: true } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = Date.now();
  const visibleItems = items.filter((item) => !item.expiresAt || item.expiresAt.getTime() > now);

  return NextResponse.json({
    pastes: visibleItems.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      description: item.description,
      language: item.language,
      visibility: item.visibility,
      isFavorite: item.isFavorite,
      hasPassword: Boolean(item.passwordHash),
      views: item.views,
      shares: item.shares,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      expiresAt: item.expiresAt,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = createPasteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const { title, content, language, description, visibility, password, expiresIn } = parsed.data;

  const passwordHash = password?.trim() ? await hash(password.trim(), 12) : null;

  const created = await prisma.paste.create({
    data: {
      userId: user.id,
      title,
      content,
      language,
      description: description || null,
      visibility,
      passwordHash,
      expiresAt: toExpiryDate(expiresIn),
      isFavorite: false,
      views: 0,
      shares: 0,
    },
  });

  return NextResponse.json(
    {
      paste: {
        id: created.id,
        title: created.title,
        content: created.content,
        description: created.description,
        language: created.language,
        visibility: created.visibility,
        isFavorite: created.isFavorite,
        hasPassword: Boolean(created.passwordHash),
        views: created.views,
        shares: created.shares,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        expiresAt: created.expiresAt,
      },
    },
    { status: 201 },
  );
}
