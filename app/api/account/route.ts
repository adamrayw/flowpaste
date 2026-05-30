import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const updateAccountSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Name is too long"),
  email: z.string().trim().email("Invalid email address"),
  bio: z.string().trim().max(280, "Bio is too long").optional(),
});

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!account) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ account });
}

export async function PATCH(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = updateAccountSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingEmail = await prisma.user.findFirst({
    where: {
      email,
      id: {
        not: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingEmail) {
    return NextResponse.json({ message: "Email is already in use" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email,
      bio: parsed.data.bio || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ account: updated });
}
