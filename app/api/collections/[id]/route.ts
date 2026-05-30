import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required").max(80, "Collection name is too long").optional(),
  description: z.string().trim().max(240, "Description is too long").optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      pastes: {
        orderBy: {
          assignedAt: "desc",
        },
        include: {
          paste: true,
        },
      },
      _count: {
        select: {
          pastes: true,
        },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ message: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json({
    collection: {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      pasteCount: collection._count.pastes,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      pastes: collection.pastes.map((item) => ({
        id: item.paste.id,
        title: item.paste.title,
        language: item.paste.language,
        content: item.paste.content,
        description: item.paste.description,
        hasPassword: Boolean(item.paste.passwordHash),
        views: item.paste.views,
        shares: item.paste.shares,
        createdAt: item.paste.createdAt,
        addedAt: item.assignedAt,
      })),
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

  const existing = await prisma.collection.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Collection not found" }, { status: 404 });
  }

  const parsed = updateCollectionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const updated = await prisma.collection.update({
    where: { id },
    data: {
      ...(typeof parsed.data.name === "string" ? { name: parsed.data.name } : {}),
      ...(typeof parsed.data.description === "string" ? { description: parsed.data.description } : {}),
    },
  });

  return NextResponse.json({
    collection: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
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

  const existing = await prisma.collection.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Collection not found" }, { status: 404 });
  }

  await prisma.collection.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
