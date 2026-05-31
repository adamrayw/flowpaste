import { redirect } from "next/navigation";

import { buildAuthRegisterUrl } from "@/lib/raytech-account";

export default function SignUpPage() {
  redirect(buildAuthRegisterUrl());
}
