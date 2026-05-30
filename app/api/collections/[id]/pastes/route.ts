import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const managePasteSchema = z.object({
  pasteId: z.string().trim().min(1, "Paste ID is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id: collectionId } = await params;

  const parsed = managePasteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const paste = await prisma.paste.findFirst({
    where: {
      id: parsed.data.pasteId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!paste) {
    return NextResponse.json({ message: "Paste not found" }, { status: 404 });
  }

  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!collection) {
    return NextResponse.json({ message: "Collection not found" }, { status: 404 });
  }

  await prisma.pasteCollection.upsert({
    where: {
      pasteId_collectionId: {
        pasteId: parsed.data.pasteId,
        collectionId,
      },
    },
    update: {},
    create: {
      pasteId: parsed.data.pasteId,
      collectionId,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { id: collectionId } = await params;

  const parsed = managePasteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!collection) {
    return NextResponse.json({ message: "Collection not found" }, { status: 404 });
  }

  const paste = await prisma.paste.findFirst({
    where: {
      id: parsed.data.pasteId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!paste) {
    return NextResponse.json({ message: "Paste not found" }, { status: 404 });
  }

  await prisma.pasteCollection.deleteMany({
    where: {
      pasteId: parsed.data.pasteId,
      collectionId,
    },
  });

  return NextResponse.json({ ok: true });
}
