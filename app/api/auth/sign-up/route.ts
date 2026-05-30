import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Name is too long"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const parsed = signUpSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return NextResponse.json({ user }, { status: 201 });
}
