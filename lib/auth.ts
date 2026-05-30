import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function getAuthUserFromRequest(_request: Request): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id || !user.email || !user.name) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
