import type { StartupSummary } from "@/lib/startup-types";

export function startupHomeHref(startupId: number) {
  return `/painel/startup/${startupId}`;
}

export function startupJourneyHref(startupId: number) {
  return `${startupHomeHref(startupId)}/jornada`;
}

export function resolvePanelDestination(startups: StartupSummary[]) {
  return startups.length > 0 ? startupHomeHref(startups[0].id) : "/painel/startups/nova";
}
