import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
