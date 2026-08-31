import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TodayPayload } from "@/lib/startup-types";

import { StartupHomeScreen } from "./startup-home-screen";

const navigation = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

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
    definitionVersion: 2,
    origin: "catalog",
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
      { key: "prepare", title: "Prepare o roteiro", description: "Use perguntas reais.", status: "completed" },
      { key: "interviews", title: "Registre 5 entrevistas", description: "1 de 5 concluidas.", status: "current" },
      { key: "learning", title: "Resuma os padroes", description: "Depois das entrevistas.", status: "locked" },
    ],
  },
  missionState: "active",
  testWorkspace: {
    canReset: false,
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

const structuredMission = {
  ...payload.mission!,
  key: "refine_problem_with_evidence",
  actionType: "problem_refinement" as const,
  title: "Refine o problema com evidencias",
  requiredEvidenceCount: 1,
  evidenceCount: 0,
  requirements: [
    {
      key: "submission",
      label: "Formulacao refinada registrada",
      current: 0,
      target: 1,
      completed: false,
    },
  ],
  steps: [
    {
      key: "submit",
      title: "Refine o problema",
      description: "Conecte a formulacao as entrevistas.",
      status: "current" as const,
    },
  ],
  canAddLearning: false,
  canComplete: false,
};

function withMission(overrides: Partial<NonNullable<TodayPayload["mission"]>>) {
  return {
    ...payload,
    mission: { ...payload.mission!, ...overrides },
  } satisfies TodayPayload;
}

const recordedEvidence = {
  context: "Percebeu a falta durante o fechamento do estoque.",
  createdAt: "2026-07-21T12:00:00Z",
  details: { currentAlternative: "messages", frequency: "weekly" },
  id: 41,
  intervieweeName: "Cliente 02",
  intervieweeProfile: "Dona de restaurante",
  notes: "Precisou conferir mensagens antigas antes de comprar novamente.",
  occurredOn: "2026-07-21",
  summary: "",
  title: "",
  type: "customer_interview",
};

function completeGuidedInterview() {
  fireEvent.change(screen.getByLabelText("Nome ou identificação"), {
    target: { value: "Cliente 02" },
  });
  fireEvent.change(screen.getByLabelText("Perfil da pessoa (opcional)"), {
    target: { value: "Dona de restaurante" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Em que situação isso aconteceu?"), {
    target: { value: recordedEvidence.context },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.click(screen.getByRole("button", { name: "Toda semana" }));
  fireEvent.click(screen.getByRole("button", { name: "Mensagens ou anotações" }));
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Qual foi a principal frase ou sinal?"), {
    target: { value: recordedEvidence.notes },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar evidência" }));
}

describe("StartupHomeScreen", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.replace.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the mission-focused home and opens interview work from its current step", async () => {
    const firstInterviewPayload = withMission({
      evidenceCount: 0,
      evidences: [],
      progress: 0,
      status: "available",
      steps: payload.mission!.steps.map((step) =>
        step.key === "interviews"
          ? { ...step, description: "0 de 5 concluidas." }
          : step
      ),
    });
    const recordedPayload: TodayPayload = {
      ...withMission({
        evidenceCount: 1,
        evidences: [recordedEvidence],
        progress: 20,
        status: "in_progress",
      }),
      message: "Entrevista registrada. Você ganhou 10 XP.",
    };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(firstInterviewPayload))
      .mockImplementationOnce(() => jsonResponse(recordedPayload, 201));
    vi.stubGlobal("fetch", fetchMock);

    render(<StartupHomeScreen startupId={7} />);

    expect(await screen.findByRole("heading", { name: "Olá, Ana" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/startups/7/today", { cache: "no-store" });
    expect(screen.getByRole("heading", { name: "Progresso da startup" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Atividade recente" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Próximo desbloqueio" })).toBeInTheDocument();
    expect(screen.queryByText("Nível 3")).not.toBeInTheDocument();
    expect(screen.queryByText("4 dias")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Registre 5 entrevistas"));
    expect(screen.getByRole("dialog", { name: "Registrar entrevista" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Antes da conversa" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Começar registro" }));
    completeGuidedInterview();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [requestUrl, requestInit] = fetchMock.mock.calls[1];
    expect(requestUrl).toBe(
      "/api/startups/7/missions/customer_interviews_5/evidence"
    );
    expect(requestInit).toEqual(expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(requestInit.body))).toEqual({
      intervieweeName: "Cliente 02",
      intervieweeProfile: "Dona de restaurante",
      occurredOn: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      context: recordedEvidence.context,
      notes: recordedEvidence.notes,
      frequency: "weekly",
      currentAlternative: "messages",
    });
    expect(
      await screen.findByText(/transformou uma conversa em evidência observável/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Registrar entrevista" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver coleção" }));
    expect(screen.queryByRole("dialog", { name: "Registrar entrevista" })).not.toBeInTheDocument();
    expect(screen.getByText("1 de 5 entrevistas registradas")).toBeInTheDocument();
  }, 10_000);

  it("opens the structured recommended mission instead of the interview dialog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ...payload, mission: structuredMission }), { status: 200 })
      )
    );

    render(<StartupHomeScreen startupId={7} />);
    fireEvent.click(await screen.findByRole("button", { name: "Abrir missão" }));

    expect(navigation.push).toHaveBeenCalledWith(
      "/painel/startup/7/missoes/refine_problem_with_evidence"
    );
    expect(screen.queryByRole("dialog", { name: "Registrar entrevista" })).not.toBeInTheDocument();
  });

  it("opens the structured mission detail from its current step", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ...payload, mission: structuredMission }), { status: 200 })
      )
    );

    render(<StartupHomeScreen startupId={7} />);
    fireEvent.click(await screen.findByText("Refine o problema"));

    expect(navigation.push).toHaveBeenCalledWith(
      "/painel/startup/7/missoes/refine_problem_with_evidence"
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("prevents duplicate completion requests and exposes the pending CTA", async () => {
    const completablePayload = withMission({ canComplete: true, progress: 100 });
    let resolveCompletion!: (value: Response) => void;
    const completionResponse = new Promise<Response>((resolve) => {
      resolveCompletion = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(completablePayload))
      .mockImplementationOnce(() => completionResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(<StartupHomeScreen startupId={7} />);

    const completeButton = await screen.findByRole("button", { name: "Concluir missão" });
    fireEvent.click(completeButton);
    fireEvent.click(completeButton);
    const pendingButton = await screen.findByRole("button", { name: "Salvando..." });
    expect(pendingButton).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolveCompletion(
      new Response(JSON.stringify(completablePayload), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Concluir missão" })).toBeEnabled()
    );
  });

  it("focuses details, closes on Escape and restores focus to its trigger", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(payload)));
    render(<StartupHomeScreen startupId={7} />);

    const trigger = (await screen.findByText("Prepare o roteiro")).closest("button");
    expect(trigger).not.toBeNull();
    trigger!.focus();
    fireEvent.click(trigger!);

    const dialog = screen.getByRole("dialog", { name: "Entender esta missão" });
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(trigger!.closest("[inert]")).not.toBeNull();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("traps forward and backward tab navigation inside the work dialog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(payload)));
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(await screen.findByText("Registre 5 entrevistas"));
    const dialog = screen.getByRole("dialog", { name: "Registrar entrevista" });
    const closeButton = screen.getByRole("button", { name: "Fechar" });
    const lastButton = screen.getByRole("button", { name: "Continuar depois" });

    lastButton.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(lastButton).toHaveFocus();
  });

  it("shows the contextual ordinal for the next interview", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(payload)));
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(await screen.findByText("Registre 5 entrevistas"));

    expect(screen.getByText("2ª entrevista")).toBeInTheDocument();
  });

  it("preserves the original five-conversation learning guidance", async () => {
    const learningPayload = withMission({ canAddLearning: true });
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(learningPayload)));
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Registrar aprendizado" })
    );

    expect(
      screen.getByText(
        "Transforme as cinco conversas em uma conclusão que oriente a próxima decisão."
      )
    ).toBeInTheDocument();
  });

  it("opens learning from the backend learning step key", async () => {
    const learningPayload = withMission({
      canAddLearning: true,
      steps: payload.mission!.steps.map((step) =>
        step.key === "learning" ? { ...step, status: "current" as const } : step
      ),
    });
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(learningPayload)));
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(await screen.findByText("Resuma os padroes"));

    expect(screen.getByRole("dialog", { name: "Resumir aprendizados" })).toBeInTheDocument();
  });

  it("keeps a completed mission read-only and points to the Journey", async () => {
    const completedPayload = withMission({
      canAddLearning: false,
      canComplete: false,
      completedAt: "2026-07-14T12:00:00Z",
      evidenceCount: 5,
      learning: {
        id: 3,
        content: "O problema e recorrente.",
        impact: "Priorizar visibilidade.",
        nextAction: "Refinar proposta.",
        confidence: "high",
        confidenceLabel: "Alta",
        createdAt: "2026-07-14T11:00:00Z",
        updatedAt: "2026-07-14T11:00:00Z",
      },
      progress: 100,
      status: "completed",
      statusLabel: "Concluida",
      steps: payload.mission!.steps.map((step) => ({ ...step, status: "completed" as const })),
    });
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(completedPayload)));
    render(<StartupHomeScreen startupId={7} />);

    expect(await screen.findByText("Missao concluida")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Registrar entrevista/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Registrar aprendizado/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para a Jornada" })).toHaveAttribute(
      "href",
      "/painel/startup/7/jornada"
    );
  });

  it("distinguishes a completed arc from a blocked next mission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...payload,
            mission: null,
            missionState: "arc_complete",
            nextUnlock: {
              key: "next_arc",
              title: "Próxima trilha",
              description: "A próxima trilha ainda não foi liberada.",
              available: false,
            },
          }),
          { status: 200 }
        )
      )
    );

    const arcView = render(<StartupHomeScreen startupId={7} />);

    expect(
      await screen.findByRole("heading", { name: "Arco de Descoberta concluído" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sua próxima missão ainda está bloqueada")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rever missões" })).toHaveAttribute(
      "href",
      "/painel/startup/7/missoes"
    );
    arcView.unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...payload,
            mission: null,
            missionState: "unavailable",
          }),
          { status: 200 }
        )
      )
    );
    render(<StartupHomeScreen startupId={7} />);

    expect(
      await screen.findByRole("heading", { name: "Sua próxima missão ainda está bloqueada" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar Jornada" })).toHaveAttribute(
      "href",
      "/painel/startup/7/jornada"
    );
  });

  it("requests workspace reconciliation after recording evidence", async () => {
    const onWorkspaceChanged = vi.fn().mockResolvedValue(true);
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(payload))
      .mockImplementationOnce(() => jsonResponse(payload, 201));
    vi.stubGlobal("fetch", fetchMock);
    const ReconciledHome = StartupHomeScreen as unknown as ComponentType<{
      onWorkspaceChanged: () => Promise<boolean>;
      startupId: number;
    }>;
    render(<ReconciledHome onWorkspaceChanged={onWorkspaceChanged} startupId={7} />);

    fireEvent.click(await screen.findByText("Registre 5 entrevistas"));
    completeGuidedInterview();

    await waitFor(() => expect(onWorkspaceChanged).toHaveBeenCalledTimes(1));
  });

  it("preserves accented loading, error and celebration copy", async () => {
    let resolveLoad!: (value: Response) => void;
    const pendingLoad = new Promise<Response>((resolve) => {
      resolveLoad = resolve;
    });
    const fetchMock = vi.fn().mockImplementationOnce(() => pendingLoad);
    vi.stubGlobal("fetch", fetchMock);

    const loadingView = render(<StartupHomeScreen startupId={7} />);
    const loadingStatus = screen.getByRole("status", { name: "Carregando missão de hoje" });
    expect(loadingStatus).toHaveTextContent("Preparando a missão de hoje.");
    expect(loadingStatus.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
    resolveLoad(
      new Response(JSON.stringify({ ...payload, celebration: {
        title: "Missão concluída",
        xpAwarded: 150,
        unlocked: "Aprendizado",
      } }), { headers: { "Content-Type": "application/json" }, status: 200 })
    );
    expect(await screen.findByText("+150 XP · Aprendizado desbloqueado")).toBeInTheDocument();
    loadingView.unmount();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<StartupHomeScreen startupId={7} />);
    expect(await screen.findByRole("heading", { name: "Não conseguimos abrir o trabalho de hoje" })).toBeInTheDocument();
    expect(screen.getByText("Não foi possível carregar o trabalho de hoje.")).toBeInTheDocument();
  });

  it("preserves accented connection errors for evidence, learning and completion", async () => {
    const cases = [
      {
        error: "A entrevista não foi registrada. Verifique sua conexão e tente novamente.",
        modePayload: payload,
        open: async () => fireEvent.click(await screen.findByText("Registre 5 entrevistas")),
        submit: completeGuidedInterview,
      },
      {
        error: "O aprendizado não foi registrado. Verifique sua conexão e tente novamente.",
        modePayload: withMission({ canAddLearning: true }),
        open: async () => fireEvent.click(await screen.findByRole("button", { name: "Registrar aprendizado" })),
        submit: () => {
          fireEvent.change(screen.getByLabelText("Qual padrão apareceu nas entrevistas?"), { target: { value: "Padrão" } });
          fireEvent.change(screen.getByLabelText("O que isso muda na startup?"), { target: { value: "Impacto" } });
          fireEvent.change(screen.getByLabelText("Qual deve ser a próxima ação?"), { target: { value: "Agir" } });
          fireEvent.click(screen.getByRole("button", { name: "Registrar aprendizado" }));
        },
      },
      {
        error: "A missão não foi concluída. Verifique sua conexão e tente novamente.",
        modePayload: withMission({ canComplete: true }),
        open: async () => fireEvent.click(await screen.findByRole("button", { name: "Concluir missão" })),
        submit: () => undefined,
      },
    ];

    for (const testCase of cases) {
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(() => jsonResponse(testCase.modePayload))
        .mockRejectedValueOnce(new Error("offline"));
      vi.stubGlobal("fetch", fetchMock);
      const view = render(<StartupHomeScreen startupId={7} />);
      await testCase.open();
      testCase.submit();
      expect(await screen.findByText(testCase.error)).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows reset controls only when the backend grants the capability", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => jsonResponse(payload)));
    const regularView = render(<StartupHomeScreen startupId={7} />);

    await screen.findByRole("heading", { name: "Olá, Ana" });
    expect(screen.queryByLabelText("Modo de teste")).not.toBeInTheDocument();
    regularView.unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        jsonResponse({
          ...payload,
          testWorkspace: { canReset: true },
        })
      )
    );
    render(<StartupHomeScreen startupId={7} />);

    expect(await screen.findByLabelText("Modo de teste")).toBeInTheDocument();
  });

  it("completes the current test mission and refreshes the Home payload", async () => {
    const onWorkspaceChanged = vi.fn().mockResolvedValue(true);
    const testPayload = {
      ...payload,
      testWorkspace: { canReset: true },
    };
    const advancedPayload = {
      ...testPayload,
      message: "Missão concluída pelo modo de teste.",
      mission: {
        ...payload.mission!,
        key: "refine_problem_with_evidence",
        title: "Refine o problema com evidências",
      },
    };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(testPayload))
      .mockImplementationOnce(() => jsonResponse(advancedPayload));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StartupHomeScreen
        onWorkspaceChanged={onWorkspaceChanged}
        startupId={7}
      />
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Concluir missão atual" })
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/startups/7/test-complete-mission",
        { method: "POST" }
      )
    );
    expect(
      await screen.findByText("Missão concluída pelo modo de teste.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Refine o problema com evidências")
    ).toBeInTheDocument();
    expect(onWorkspaceChanged).toHaveBeenCalledTimes(1);
  });

  it("resets the workspace, clears only its drafts and reconciles the shell", async () => {
    const onWorkspaceChanged = vi.fn().mockResolvedValue(true);
    const resetPayload: TodayPayload = {
      ...payload,
      message: "Ambiente de teste reiniciado na primeira missão.",
      mission: {
        ...payload.mission!,
        evidenceCount: 0,
        evidences: [],
        progress: 0,
        status: "available",
      },
      recentActivities: [],
      testWorkspace: { canReset: true },
    };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({
          ...payload,
          testWorkspace: { canReset: true },
        })
      )
      .mockImplementationOnce(() => jsonResponse(resetPayload));
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.setItem(
      "startup-quest:interview-draft:7:customer_interviews_5:1",
      "remove"
    );
    window.localStorage.setItem(
      "startup-quest:problem-refinement:7",
      "remove"
    );
    window.localStorage.setItem(
      "startup-quest:interview-draft:8:customer_interviews_5:1",
      "preserve"
    );

    render(
      <StartupHomeScreen
        onWorkspaceChanged={onWorkspaceChanged}
        startupId={7}
      />
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Reiniciar ambiente" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/startups/7/test-reset",
      {
        body: JSON.stringify({ confirmation: "RESET_TEST_WORKSPACE" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    ]);
    expect(
      await screen.findByText("Ambiente de teste reiniciado na primeira missão.")
    ).toBeInTheDocument();
    expect(
      window.localStorage.getItem(
        "startup-quest:interview-draft:7:customer_interviews_5:1"
      )
    ).toBeNull();
    expect(
      window.localStorage.getItem("startup-quest:problem-refinement:7")
    ).toBeNull();
    expect(
      window.localStorage.getItem(
        "startup-quest:interview-draft:8:customer_interviews_5:1"
      )
    ).toBe("preserve");
    expect(onWorkspaceChanged).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Reiniciar ambiente de teste" })
    ).not.toBeInTheDocument();
  });

  it("keeps the reset dialog open when the backend rejects the request", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({
          ...payload,
          testWorkspace: { canReset: true },
        })
      )
      .mockImplementationOnce(() =>
        jsonResponse(
          { message: "Esse ambiente não pode ser reiniciado." },
          403
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Reiniciar ambiente" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Esse ambiente não pode ser reiniciado.");
    expect(
      screen.getByRole("dialog", { name: "Reiniciar ambiente de teste" })
    ).toBeInTheDocument();
  });

  it("redirects to login when the reset session has expired", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({
          ...payload,
          testWorkspace: { canReset: true },
        })
      )
      .mockImplementationOnce(() =>
        jsonResponse({ message: "Sessão expirada." }, 401)
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<StartupHomeScreen startupId={7} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Reiniciar ambiente" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    );

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/"));
  });
});
