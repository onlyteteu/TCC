import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TodayPayload } from "@/lib/startup-types";

import { StartupHomeScreen } from "./startup-home-screen";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

const payload: TodayPayload = {
  user: { firstName: "Ana" },
  startup: {
    id: 7,
    name: "Aurora",
    description: "Plataforma",
    segment: "SaaS",
    problem: "Descoberta",
    audience: "Fundadores",
    currentStage: "validation",
    currentStageLabel: "Validacao",
    initialGoal: "Validar",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-12T00:00:00Z",
    lastOpenedAt: "2026-07-12T00:00:00Z",
  },
  journey: {
    progress: 40,
    completedSteps: 2,
    totalSteps: 5,
    currentStepKey: "problem",
    currentStepLabel: "Definir o problema",
  },
  mission: {
    key: "customer_interviews_5",
    type: "main",
    typeLabel: "Missao principal",
    phase: "Descoberta",
    title: "Converse com 5 potenciais clientes",
    objective: "Entender o problema na vida real.",
    whyItMatters: "Evidencias reduzem suposicoes.",
    instructions: ["Prepare", "Entreviste", "Revise"],
    completionCriteria: "Cinco entrevistas e um aprendizado.",
    contextualTip: "Pergunte sobre fatos passados.",
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
      { key: "prepare", title: "Prepare o roteiro", description: "Use perguntas reais.", status: "completed" },
      { key: "interviews", title: "Registre 5 entrevistas", description: "1 de 5 concluidas.", status: "current" },
      { key: "review", title: "Resuma os padroes", description: "Depois das entrevistas.", status: "locked" },
    ],
  },
  gamification: {
    xp: 360,
    level: 3,
    xpIntoLevel: 60,
    xpPerLevel: 100,
    achievements: [],
    unlockedCount: 0,
    currentStreak: 4,
    streakStatus: "maintained",
  },
  recentActivities: [
    {
      id: 1,
      kind: "evidence_recorded",
      kindLabel: "Entrevista registrada",
      description: "Conversa com Cliente 01",
      xpAwarded: 10,
      metadata: {},
      occurredAt: "2026-07-14T10:00:00Z",
    },
  ],
  nextUnlock: {
    key: "value-proposition",
    title: "Proposta de valor",
    description: "Disponivel depois da missao.",
    available: false,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    })
  );
}

describe("StartupHomeScreen", () => {
  beforeEach(() => {
    navigation.replace.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the mission-focused home and opens interview work from its current step", async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    render(<StartupHomeScreen startupId={7} />);

    expect(await screen.findByRole("heading", { name: "Bom dia, Ana" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/startups/7/today", { cache: "no-store" });
    expect(screen.getByRole("heading", { name: "Atividade recente" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proximo desbloqueio" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Registre 5 entrevistas"));
    expect(screen.getByRole("dialog", { name: "Registrar entrevista" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome ou identificacao"), {
      target: { value: "Cliente 02" },
    });
    fireEvent.change(screen.getByLabelText("O que a pessoa contou?"), {
      target: { value: "Relatou o problema semanalmente." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar entrevista" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/startups/7/missions/customer_interviews_5/evidence",
      expect.objectContaining({ method: "POST" })
    );
  });
});
