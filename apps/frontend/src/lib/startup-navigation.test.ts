import { describe, expect, it } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import { resolvePanelDestination, startupHomeHref } from "./startup-navigation";

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
});
