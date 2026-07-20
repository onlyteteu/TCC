"use client";

import { useWorkspace } from "@/components/workspace/workspace-context";

import { MissionDetailScreen } from "./mission-detail-screen";

export function StartupMissionRouteScreen({
  missionKey,
  startupId,
}: {
  missionKey: string;
  startupId: number;
}) {
  const { refreshWorkspace } = useWorkspace();

  return (
    <MissionDetailScreen
      missionKey={missionKey}
      onWorkspaceChanged={() => refreshWorkspace({ silent: true })}
      startupId={startupId}
    />
  );
}
