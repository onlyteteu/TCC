import { describe, expect, it } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import {
  missionExecutionHref,
  resolvePanelDestination,
  startupHomeHref,
  startupJourneyMapHref,
  startupMissionHref,
  startupMissionsHref,
} from "./startup-navigation";

const startup = { id: 42 } as StartupSummary;

describe("startup navigation", () => {
  it("opens creation when the account has no startup", () => {
    expect(resolvePanelDestination([])).toBe("/painel/startups/nova");
  });

  it("opens the first startup returned by the recent-order API", () => {
    expect(resolvePanelDestination([startup])).toBe("/painel/startup/42");
  });

  it("builds the canonical Home URL", () => {
    expect(startupHomeHref(9)).toBe("/painel/startup/9");
  });

  it("builds the secondary startup map URL with an optional focused field", () => {
    expect(startupJourneyMapHref(9)).toBe("/painel/startup/9/jornada?view=map");
    expect(startupJourneyMapHref(9, "initialGoal")).toBe(
      "/painel/startup/9/jornada?view=map&field=initialGoal"
    );
  });

  it("builds the mission center and detail URLs", () => {
    expect(startupMissionsHref(9)).toBe("/painel/startup/9/missoes");
    expect(startupMissionHref(9, "refine_problem_with_evidence")).toBe(
      "/painel/startup/9/missoes/refine_problem_with_evidence"
    );
  });

  it("keeps interviews on Home and sends structured missions to detail", () => {
    expect(missionExecutionHref(9, "customer_interviews_5", "interviews")).toBe(
      "/painel/startup/9"
    );
    expect(
      missionExecutionHref(9, "refine_problem_with_evidence", "problem_refinement")
    ).toBe("/painel/startup/9/missoes/refine_problem_with_evidence");
  });
});
