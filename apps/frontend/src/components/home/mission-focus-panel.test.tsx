import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

import type { MissionSummary } from "@/lib/startup-types";

import { MissionFocusPanel } from "./mission-focus-panel";

const mission: MissionSummary = {
  key: "customer_interviews_5",
  definitionVersion: 2,
  origin: "catalog",
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
  estimatedMinutes: 150,
  status: "in_progress",
  statusLabel: "Em andamento",
  progress: 20,
  actionType: "interviews",
  isRequired: true,
  order: 10,
  priority: 100,
  prerequisiteKeys: [],
  lockedReasons: [],
  recommendationReason: "Comece por evidencias reais.",
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
      key: "learning",
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
        startupId={7}
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
        startupId={7}
      />
    );

    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  });

  it("uses generic copy and CTA for a structured mission", () => {
    render(
      <MissionFocusPanel
        mission={{
          ...mission,
          actionType: "problem_refinement",
          requirements: [
            {
              key: "submission",
              label: "Formulacao refinada registrada",
              current: 0,
              target: 1,
              completed: false,
            },
          ],
        }}
        isPrimaryActionPending={false}
        onOpenStep={vi.fn()}
        onPrimaryAction={vi.fn()}
        startupId={7}
      />
    );

    expect(screen.getByText("Formulacao refinada registrada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir missão" })).toBeInTheDocument();
    expect(screen.queryByText("1 de 5 entrevistas")).not.toBeInTheDocument();
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

  it("renders completed evidence and learning content without mutation actions", () => {
    const completedMission: MissionSummary = {
      ...mission,
      canAddLearning: false,
      canComplete: false,
      completedAt: "2026-07-15T14:00:00Z",
      evidenceCount: 1,
      evidences: [
        {
          context: "Conversa durante o fechamento mensal",
          createdAt: "2026-07-14T12:00:00Z",
          details: {},
          id: 31,
          intervieweeName: "Marina Costa",
          intervieweeProfile: "Gestora financeira de pequena empresa",
          notes: "Perde duas horas conciliando planilhas antes de emitir o relatorio.",
          occurredOn: "2026-07-13",
          summary: "",
          title: "",
          type: "customer_interview",
        },
      ],
      learning: {
        confidence: "high",
        confidenceLabel: "Alta",
        content: "A conciliacao manual e o maior gargalo percebido.",
        createdAt: "2026-07-14T13:00:00Z",
        id: 41,
        impact: "Priorizar a importacao automatica de extratos.",
        nextAction: "Testar um prototipo com tres gestoras financeiras.",
        updatedAt: "2026-07-14T13:00:00Z",
      },
      progress: 100,
      status: "completed",
      statusLabel: "Concluido",
      steps: mission.steps.map((step) => ({ ...step, status: "completed" as const })),
    };
    const onOpenStep = vi.fn();
    const onPrimaryAction = vi.fn();

    render(
      <MissionFocusPanel
        mission={completedMission}
        isPrimaryActionPending={false}
        onOpenStep={onOpenStep}
        onPrimaryAction={onPrimaryAction}
        startupId={7}
      />
    );

    expect(screen.getByText("Marina Costa")).toBeInTheDocument();
    expect(screen.getByText("Gestora financeira de pequena empresa")).toBeInTheDocument();
    expect(
      screen.getByText("Perde duas horas conciliando planilhas antes de emitir o relatorio.")
    ).toBeInTheDocument();
    expect(screen.getByText("A conciliacao manual e o maior gargalo percebido.")).toBeInTheDocument();
    expect(screen.getByText("Priorizar a importacao automatica de extratos.")).toBeInTheDocument();
    expect(
      screen.getByText("Testar um prototipo com tres gestoras financeiras.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(onOpenStep).not.toHaveBeenCalled();
    expect(onPrimaryAction).not.toHaveBeenCalled();
  });
});
