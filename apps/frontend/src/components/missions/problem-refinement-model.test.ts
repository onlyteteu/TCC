import { describe, expect, it } from "vitest";

import type { MissionEvidenceSummary } from "@/lib/startup-types";

import {
  buildEvidenceSummary,
  buildProblemStatement,
  canReviewProblem,
  createProblemRefinementDraft,
  problemRefinementStorageKey,
} from "./problem-refinement-model";

const interview = (
  id: number,
  overrides: Partial<MissionEvidenceSummary> = {}
): MissionEvidenceSummary => ({
  id,
  type: "interview",
  title: `Entrevista ${id}`,
  summary: `Restaurante ${id} relatou compra duplicada.`,
  details: {},
  intervieweeName: `Pessoa ${id}`,
  intervieweeProfile: "Dono de restaurante",
  context: "Controle semanal de estoque",
  notes: "Comprou ingredientes que ainda estavam guardados.",
  occurredOn: "2026-07-20",
  createdAt: "2026-07-20T12:00:00Z",
  ...overrides,
});

describe("problem refinement model", () => {
  it("builds the final problem without asking for a long paragraph", () => {
    const draft = {
      ...createProblemRefinementDraft(),
      audience: "Restaurantes pequenos",
      situation: "controlam o estoque no fim da semana",
      difficulty: "saber o que ainda esta disponivel",
      consequence: "compras duplicadas e perda de margem",
    };

    expect(buildProblemStatement(draft)).toBe(
      "Restaurantes pequenos, quando controlam o estoque no fim da semana, " +
        "tem dificuldade em saber o que ainda esta disponivel, o que provoca " +
        "compras duplicadas e perda de margem."
    );
  });

  it("turns selected interview cards into the backend evidence summary", () => {
    const summary = buildEvidenceSummary([interview(1), interview(2)]);

    expect(summary).toContain("2 entrevistas sustentam este recorte");
    expect(summary).toContain("Pessoa 1: Comprou ingredientes que ainda estavam guardados.");
    expect(summary).toContain("Pessoa 2: Comprou ingredientes que ainda estavam guardados.");
  });

  it("falls back to summary and title when interview notes are missing", () => {
    const summary = buildEvidenceSummary([
      interview(1, { notes: "" }),
      interview(2, { intervieweeName: "", notes: "", summary: "", title: "Conversa B" }),
    ]);

    expect(summary).toContain("Pessoa 1: Restaurante 1 relatou compra duplicada.");
    expect(summary).toContain("Conversa B: Conversa B");
  });

  it("only unlocks review after four short parts and two evidence cards", () => {
    const draft = {
      ...createProblemRefinementDraft(),
      selectedEvidenceIds: [1, 2],
      audience: "Restaurantes pequenos",
      situation: "controlam o estoque semanal",
      difficulty: "saber o saldo real",
      consequence: "compras duplicadas",
    };

    expect(canReviewProblem(draft)).toBe(true);
    expect(canReviewProblem({ ...draft, selectedEvidenceIds: [1] })).toBe(false);
    expect(canReviewProblem({ ...draft, consequence: "" })).toBe(false);
  });

  it("creates a stable autosave key per startup", () => {
    expect(problemRefinementStorageKey(7)).toBe("startup-quest:problem-refinement:7");
  });
});
