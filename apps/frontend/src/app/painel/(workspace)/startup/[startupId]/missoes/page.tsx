import { notFound } from "next/navigation";

import { StartupMissionsRouteScreen } from "@/components/missions/startup-missions-route-screen";

export default async function StartupMissionsPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  const numericId = Number(startupId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <StartupMissionsRouteScreen startupId={numericId} />;
}
