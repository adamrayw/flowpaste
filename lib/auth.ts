import { NextResponse } from "next/server";
import { getAuthorizedRaytechUser } from "@/lib/raytech-account";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function getAuthUserFromRequest(_request: Request): Promise<AuthUser | null> {
  return getAuthorizedRaytechUser(_request);
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
