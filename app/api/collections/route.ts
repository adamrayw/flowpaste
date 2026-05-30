import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required").max(80, "Collection name is too long"),
  description: z.string().trim().max(240, "Description is too long").optional(),
});

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const collections = await prisma.collection.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          pastes: true,
        },
      },
      pastes: {
        take: 3,
        orderBy: {
          assignedAt: "desc",
        },
        include: {
          paste: {
            select: {
              id: true,
              title: true,
              passwordHash: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      pasteCount: collection._count.pastes,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      recentPastes: collection.pastes.map((item) => ({
        id: item.paste.id,
        title: item.paste.title,
        hasPassword: Boolean(item.paste.passwordHash),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = createCollectionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const { name, description } = parsed.data;

  const existing = await prisma.collection.findFirst({
    where: {
      userId: user.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ message: "Collection already exists" }, { status: 409 });
  }

  const created = await prisma.collection.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
    },
  });

  return NextResponse.json(
    {
      collection: {
        id: created.id,
        name: created.name,
        description: created.description,
        pasteCount: 0,
        createdAt: created.createdAt,
      },
    },
    { status: 201 },
  );
}
