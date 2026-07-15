"use client";

import { useWorkspace } from "@/components/workspace/workspace-context";

import { StartupHomeScreen } from "./startup-home-screen";

export function StartupHomeRouteScreen({ startupId }: { startupId: number }) {
  const { refreshWorkspace, setWorkspaceModalOpen } = useWorkspace();

  return (
    <StartupHomeScreen
      onWorkspaceChanged={() => refreshWorkspace({ silent: true })}
      onWorkspaceModalChange={setWorkspaceModalOpen}
      startupId={startupId}
    />
  );
}
