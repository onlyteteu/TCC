import { notFound } from "next/navigation";

import { StartupMissionRouteScreen } from "@/components/missions/startup-mission-route-screen";

export default async function StartupMissionPage({
  params,
}: {
  params: Promise<{ missionKey: string; startupId: string }>;
}) {
  const { missionKey, startupId } = await params;
  const numericId = Number(startupId);

  if (!Number.isInteger(numericId) || numericId <= 0 || missionKey.trim().length === 0) {
    notFound();
  }

  return <StartupMissionRouteScreen missionKey={missionKey} startupId={numericId} />;
}
