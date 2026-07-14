import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
        isPrimaryActionPending={false}
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

  it("disables the completion action and announces its pending state", () => {
    render(
      <MissionFocusPanel
        mission={{ ...mission, canComplete: true, progress: 100 }}
        isPrimaryActionPending
        onOpenStep={vi.fn()}
        onPrimaryAction={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Concluindo missão..." })).toBeDisabled();
  });

  it("defines a high-contrast amber focus outline for actionable rows", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/components/home/startup-home-screen.module.css"
    );
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(
      /\.stepAction:focus-visible\s*\{[\s\S]*?outline:\s*2px solid #f2a51a;[\s\S]*?outline-offset:\s*3px;/
    );
  });
});
