import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AccountProgress, TodayPayload } from "@/lib/startup-types";

import { FounderProgressRail } from "./founder-progress-rail";

const account: AccountProgress = {
  xp: 360,
  level: 3,
  xpIntoLevel: 60,
  xpPerLevel: 100,
  achievements: [],
  unlockedCount: 0,
  currentStreak: 4,
  longestStreak: 7,
  streakStatus: "maintained",
  lastActivityDate: "2026-07-14",
};

const journey: TodayPayload["journey"] = {
  progress: 40,
  completedSteps: 2,
  totalSteps: 5,
  currentStepKey: "problem",
  currentStepLabel: "Definir o problema",
};

describe("FounderProgressRail", () => {
  it("shows streak, level and journey progress accessibly", () => {
    render(<FounderProgressRail account={account} journey={journey} />);

    expect(screen.getByText("4 dias")).toBeInTheDocument();
    expect(screen.getByText("Nivel 3")).toBeInTheDocument();
    expect(screen.getByText("Etapa atual: Definir o problema")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso do nivel" })).toHaveAttribute(
      "aria-valuenow",
      "60"
    );
    expect(screen.getByRole("progressbar", { name: "Progresso da fase" })).toHaveAttribute(
      "aria-valuenow",
      "40"
    );
  });
});
