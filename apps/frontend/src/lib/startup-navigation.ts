import type { MissionActionType, StartupSummary } from "@/lib/startup-types";

export function startupHomeHref(startupId: number) {
  return `/painel/startup/${startupId}`;
}

export function startupJourneyHref(startupId: number) {
  return `${startupHomeHref(startupId)}/jornada`;
}

export function startupJourneyMapHref(startupId: number, field?: string) {
  const params = new URLSearchParams({ view: "map" });
  if (field) params.set("field", field);
  return `${startupJourneyHref(startupId)}?${params.toString()}`;
}

export function startupMissionsHref(startupId: number) {
  return `${startupHomeHref(startupId)}/missoes`;
}

export function startupMissionHref(startupId: number, missionKey: string) {
  return `${startupMissionsHref(startupId)}/${encodeURIComponent(missionKey)}`;
}

export function missionExecutionHref(
  startupId: number,
  missionKey: string,
  actionType: MissionActionType
) {
  return actionType === "interviews"
    ? startupHomeHref(startupId)
    : startupMissionHref(startupId, missionKey);
}

export function resolvePanelDestination(startups: StartupSummary[]) {
  return startups.length > 0 ? startupHomeHref(startups[0].id) : "/painel/startups/nova";
}
