import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { JourneyChapterSummary } from "@/lib/startup-types";

import { JourneyChapterMap } from "./journey-chapter-map";

const chapters: JourneyChapterSummary[] = [
  {
    key: "foundation",
    title: "Fundamento",
    question: "Para quem e para qual dor esta startup existe?",
    status: "done",
    completedSteps: 2,
    totalSteps: 2,
    steps: [
      { key: "problem", title: "Problema", status: "done", answer: "Dor real", order: 0, completedAt: "2026-07-21T10:00:00Z" },
      { key: "audience", title: "Público-alvo", status: "done", answer: "Restaurantes", order: 1, completedAt: "2026-07-21T10:00:00Z" },
    ],
  },
  {
    key: "proposal",
    title: "Proposta",
    question: "Por que essa startup merece existir?",
    status: "current",
    completedSteps: 0,
    totalSteps: 2,
    steps: [
      { key: "value", title: "Proposta de valor", status: "current", answer: "", order: 2, completedAt: null },
      { key: "differentiators", title: "Diferenciais", status: "pending", answer: "", order: 3, completedAt: null },
    ],
  },
  {
    key: "validation",
    title: "Validação",
    question: "O que prova a proposta?",
    status: "locked",
    completedSteps: 0,
    totalSteps: 2,
    steps: [
      { key: "validation", title: "Validação inicial", status: "pending", answer: "", order: 4, completedAt: null },
      { key: "business_model", title: "Modelo de negócio", status: "pending", answer: "", order: 5, completedAt: null },
    ],
  },
];

describe("JourneyChapterMap", () => {
  it("exposes chapter states and keeps future chapters unavailable", () => {
    render(
      <JourneyChapterMap
        chapters={chapters}
        onSelectStep={vi.fn()}
        selectedStepKey="value"
      />
    );

    expect(screen.getByRole("list", { name: "Mapa da evolução" })).toBeInTheDocument();
    expect(screen.getByText("Proposta").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(screen.getByText("Validação").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.queryByRole("button", { name: /Validação inicial/ })).not.toBeInTheDocument();
  });

  it("lets completed and current steps be inspected by keyboard buttons", () => {
    const onSelectStep = vi.fn();
    render(
      <JourneyChapterMap
        chapters={chapters}
        onSelectStep={onSelectStep}
        selectedStepKey="value"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Problema/ }));
    expect(onSelectStep).toHaveBeenCalledWith("problem");
    expect(screen.getByRole("button", { name: /Proposta de valor/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
  });
});
