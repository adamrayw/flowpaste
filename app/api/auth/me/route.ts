import { NextResponse } from "next/server";
import { getAuthorizedRaytechUser } from "@/lib/raytech-account";
import { unauthorizedResponse } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthorizedRaytechUser(request);

  if (!user) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    user,
  });
}
