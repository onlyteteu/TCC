import { MissionCenterScreen } from "./mission-center-screen";

export function StartupMissionsRouteScreen({ startupId }: { startupId: number }) {
  return <MissionCenterScreen startupId={startupId} />;
}
