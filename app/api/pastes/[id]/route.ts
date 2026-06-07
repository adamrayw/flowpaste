import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const updatePasteSchema = z.object({
  isFavorite: z.boolean().optional(),
  incrementShare: z.boolean().optional(),
});

async function checkPastePassword(request: Request, passwordHash: string | null) {
  if (!passwordHash) {
    return { ok: true };
  }

  const { searchParams } = new URL(request.url);
  const providedPassword = request.headers.get("x-paste-password") ?? searchParams.get("password") ?? "";

  if (!providedPassword.trim()) {
    return {
      ok: false,
      status: 401,
      body: { message: "Password required", requiresPassword: true },
    } as const;
  }

  const isValid = await compare(providedPassword, passwordHash);
  if (!isValid) {
    return {
      ok: false,
      status: 403,
      body: { message: "Invalid password", requiresPassword: true },
    } as const;
  }

  return { ok: true };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const existing = await prisma.paste.findFirst({
    where: {
      id,
      OR: [
        { userId: user.id },
        { visibility: { in: ["public", "unlisted"] } },
      ],
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Paste not found" }, { status: 404 });
  }

  if (existing.expiresAt && existing.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ message: "Paste has expired" }, { status: 410 });
  }

  const passwordCheck = await checkPastePassword(request, existing.passwordHash);
  if (!passwordCheck.ok) {
    return NextResponse.json(passwordCheck.body, { status: passwordCheck.status });
  }

  const paste = await prisma.paste.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
    include: {
      collections: {
        include: {
          collection: true,
        },
      },
    },
  });

  return NextResponse.json({
    paste: {
      id: paste.id,
      title: paste.title,
      content: paste.content,
      description: paste.description,
      language: paste.language,
      visibility: paste.visibility,
      isFavorite: paste.isFavorite,
      views: paste.views,
      shares: paste.shares,
      createdAt: paste.createdAt,
      updatedAt: paste.updatedAt,
      expiresAt: paste.expiresAt,
      collections:
        paste.userId === user.id
          ? paste.collections.map((item) => ({
              id: item.collection.id,
              name: item.collection.name,
            }))
          : [],
      hasPassword: Boolean(paste.passwordHash),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const existing = await prisma.paste.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Paste not found" }, { status: 404 });
  }

  const parsed = updatePasteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const { isFavorite, incrementShare } = parsed.data;

  const updated = await prisma.paste.update({
    where: { id },
    data: {
      ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
      ...(incrementShare ? { shares: { increment: 1 } } : {}),
    },
  });

  return NextResponse.json({
    paste: {
      id: updated.id,
      isFavorite: updated.isFavorite,
      shares: updated.shares,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const existing = await prisma.paste.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Paste not found" }, { status: 404 });
  }

  await prisma.paste.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
