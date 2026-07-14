import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { StartupDetailScreen } from "@/components/startup-detail-screen";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function StartupJourneyPage({
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

  return <StartupDetailScreen startupId={numericId} />;
}
