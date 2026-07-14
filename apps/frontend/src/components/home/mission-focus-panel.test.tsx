import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MissionSummary } from "@/lib/startup-types";

import { MissionFocusPanel } from "./mission-focus-panel";

const mission: MissionSummary = {
  key: "customer_interviews_5",
  type: "main",
  typeLabel: "Missao principal",
  phase: "Descoberta",
  title: "Converse com 5 potenciais clientes",
  objective: "Entender o problema na vida real.",
  whyItMatters: "Entrevistas substituem suposicoes por evidencias.",
  instructions: ["Prepare o roteiro", "Registre 5 entrevistas", "Resuma os padroes"],
  completionCriteria: "Cinco entrevistas e um aprendizado.",
  contextualTip: "Pergunte sobre situacoes reais do passado.",
  requiredEvidenceCount: 5,
  evidenceCount: 1,
  xpReward: 150,
  status: "in_progress",
  statusLabel: "Em andamento",
  progress: 20,
  canAddLearning: false,
  canComplete: false,
  completedAt: null,
  requirements: [],
  evidences: [],
  learning: null,
  steps: [
    {
      key: "prepare",
      title: "Prepare o roteiro",
      description: "Use perguntas reais.",
      status: "completed",
    },
    {
      key: "interviews",
      title: "Registre 5 entrevistas",
      description: "1 de 5 concluidas.",
      status: "current",
    },
    {
      key: "review",
      title: "Resuma os padroes",
      description: "Disponivel depois das entrevistas.",
      status: "locked",
    },
  ],
};

describe("MissionFocusPanel", () => {
  it("renders progress, reward and a non-interactive locked step", () => {
    const onOpenStep = vi.fn();
    render(
      <MissionFocusPanel
        mission={mission}
        onOpenStep={onOpenStep}
        onPrimaryAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: mission.title })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
    expect(screen.getByText("+150 XP")).toBeInTheDocument();
    expect(screen.getByText("Resuma os padroes").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(screen.getByText("Registre 5 entrevistas"));
    expect(onOpenStep).toHaveBeenCalledWith("interviews");
  });
});
