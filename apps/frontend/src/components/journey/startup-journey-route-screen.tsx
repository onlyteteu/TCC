"use client";

import { useWorkspace } from "@/components/workspace/workspace-context";

import { StartupJourneyScreen } from "./startup-journey-screen";

export function StartupJourneyRouteScreen({ startupId }: { startupId: number }) {
  const { refreshWorkspace } = useWorkspace();

  return (
    <StartupJourneyScreen
      onWorkspaceChanged={() => refreshWorkspace({ silent: true })}
      startupId={startupId}
    />
  );
}
