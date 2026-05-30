import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

export async function PATCH(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = changePasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: "New password and confirm password must match" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!existing) {
    return unauthorizedResponse();
  }

  const valid = await compare(currentPassword, existing.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
  }

  const newPasswordHash = await hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ ok: true });
}
