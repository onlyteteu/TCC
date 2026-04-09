import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardScreen } from "@/components/dashboard-screen";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/");
  }

  return <DashboardScreen />;
}

