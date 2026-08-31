import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TodayPayload } from "@/lib/startup-types";

import { StartupProgressPanel } from "./startup-progress-panel";

const journey: TodayPayload["journey"] = {
  progress: 40,
  completedSteps: 2,
  totalSteps: 5,
  currentStepKey: "problem",
  currentStepLabel: "Definir o problema",
};

const nextUnlock: TodayPayload["nextUnlock"] = {
  available: false,
  description: "Disponível depois da missão atual.",
  key: "value-proposition",
  title: "Proposta de valor",
};

describe("StartupProgressPanel", () => {
  it("shows only startup progress and its next journey action", () => {
    render(
      <StartupProgressPanel
        journey={journey}
        nextUnlock={nextUnlock}
        startupId={7}
      />
    );

    expect(screen.getByRole("heading", { name: "Progresso da startup" })).toBeInTheDocument();
    expect(screen.getByText("Definir o problema")).toBeInTheDocument();
    expect(screen.getByText("2 de 5 etapas concluídas")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso da jornada" })).toHaveAttribute(
      "aria-valuenow",
      "40"
    );
    expect(screen.getByRole("link", { name: "Abrir Jornada" })).toHaveAttribute(
      "href",
      "/painel/startup/7/jornada"
    );
    expect(screen.queryByText(/Nível/)).not.toBeInTheDocument();
    expect(screen.queryByText(/sequência/i)).not.toBeInTheDocument();
  });
});
