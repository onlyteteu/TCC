import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { StartupTodayScreen } from "@/components/startup-today-screen";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/");
  }

  const { startupId } = await params;
  const numericId = Number(startupId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <StartupTodayScreen startupId={numericId} />;
}
