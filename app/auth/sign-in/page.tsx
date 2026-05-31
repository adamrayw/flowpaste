import { redirect } from "next/navigation";

import { buildAuthLoginUrl } from "@/lib/raytech-account";

export default function SignInPage() {
  redirect(buildAuthLoginUrl());
}
