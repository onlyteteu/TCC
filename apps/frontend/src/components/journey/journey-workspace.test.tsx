import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { JourneyStepSummary } from "@/lib/startup-types";

import { JourneyWorkspace } from "./journey-workspace";

const steps: JourneyStepSummary[] = [
  {
    key: "problem",
    title: "Definicao do problema",
    status: "done",
    answer: "Dor real",
    order: 0,
    completedAt: "2026-07-10T10:00:00Z",
  },
  {
    key: "value",
    title: "Proposta de valor",
    status: "current",
    answer: "",
    order: 1,
    completedAt: null,
  },
  {
    key: "mvp",
    title: "Planejamento do MVP",
    status: "pending",
    answer: "",
    order: 2,
    completedAt: null,
  },
];

describe("JourneyWorkspace", () => {
  it("opens current step and keeps pending steps locked", () => {
    const onSelectStep = vi.fn();
    render(
      <JourneyWorkspace
        isSaving={false}
        journey={steps}
        onSaveStep={vi.fn()}
        onSelectStep={onSelectStep}
        progress={33}
        selectedStepKey="value"
      />
    );

    expect(screen.getByRole("heading", { name: "Proposta de valor" })).toBeInTheDocument();
    expect(screen.getByText("Planejamento do MVP").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(screen.getByText("Definicao do problema"));
    expect(onSelectStep).toHaveBeenCalledWith("problem");
  });
});
