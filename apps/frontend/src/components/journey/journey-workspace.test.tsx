import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  JourneyChapterSummary,
  JourneyMilestoneSummary,
  JourneyStrategicItem,
} from "@/lib/startup-types";

import { JourneyWorkspace } from "./journey-workspace";

const chapters: JourneyChapterSummary[] = [
  {
    key: "foundation",
    title: "Fundamento",
    question: "Para quem e para qual dor esta startup existe?",
    status: "done",
    completedSteps: 2,
    totalSteps: 2,
    steps: [
      { key: "problem", title: "Problema", status: "done", answer: "Compras duplicadas", order: 0, completedAt: "2026-07-21T10:00:00Z" },
      { key: "audience", title: "Público-alvo", status: "done", answer: "Restaurantes pequenos", order: 1, completedAt: "2026-07-21T10:00:00Z" },
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
];

const milestone: JourneyMilestoneSummary = {
  key: "value",
  chapterKey: "proposal",
  title: "Proposta de valor",
  description: "Transforme problema e público em uma promessa clara.",
  alreadyBuilt: [],
  nextUnlock: { title: "Diferenciais", description: "Compare alternativas." },
  mission: null,
  message: "A missão deste marco ainda não foi liberada.",
};

const strategicSummary: JourneyStrategicItem[] = [
  { key: "problem", label: "Problema", value: "Compras duplicadas", field: "problem" },
  { key: "audience", label: "Público-alvo", value: "Restaurantes pequenos", field: "audience" },
];

describe("JourneyWorkspace", () => {
  it("composes chapter context, progress and strategic review", () => {
    const onReviewField = vi.fn();
    render(
      <JourneyWorkspace
        chapters={chapters}
        currentMilestone={milestone}
        onReviewField={onReviewField}
        onSelectStep={vi.fn()}
        progress={25}
        selectedStepKey="value"
        strategicSummary={strategicSummary}
      />
    );

    expect(screen.getByRole("heading", { name: "Por que essa startup merece existir?" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso geral da Jornada" })).toHaveAttribute("aria-valuenow", "25");
    fireEvent.click(screen.getByRole("button", { name: "Revisar Problema" }));
    expect(onReviewField).toHaveBeenCalledWith("problem");
  });

  it("shows a completed answer when inspecting a previous milestone", () => {
    render(
      <JourneyWorkspace
        chapters={chapters}
        currentMilestone={milestone}
        onReviewField={vi.fn()}
        onSelectStep={vi.fn()}
        progress={25}
        selectedStepKey="problem"
        strategicSummary={strategicSummary}
      />
    );

    expect(screen.getByRole("heading", { name: "Problema" })).toBeInTheDocument();
    expect(screen.getByText("Compras duplicadas")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar missão" })).not.toBeInTheDocument();
  });
});
