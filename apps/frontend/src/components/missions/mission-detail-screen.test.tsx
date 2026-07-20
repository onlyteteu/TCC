import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  MissionActionType,
  MissionCardSummary,
  MissionDetailPayload,
  StartupSummary,
} from "@/lib/startup-types";

import { MissionDetailScreen } from "./mission-detail-screen";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const recommended = {
  key: "customer_interviews_5",
  definitionVersion: 2,
  origin: "catalog",
  type: "main",
  typeLabel: "Missao principal",
  phase: "Descoberta",
  title: "Converse com 5 potenciais clientes",
  objective: "Entender como o problema acontece na vida real.",
  xpReward: 150,
  status: "available",
  statusLabel: "Disponivel",
  progress: 0,
  actionType: "interviews",
  isRequired: true,
  order: 10,
  priority: 100,
  prerequisiteKeys: [],
  lockedReasons: [],
  recommendationReason: "Comece por evidencias reais.",
  completedAt: null,
} satisfies MissionCardSummary;

const detail: MissionDetailPayload = {
  startup: { id: 7, name: "Aurora Labs" } as StartupSummary,
  gamification: {
    xp: 250,
    level: 1,
    xpIntoLevel: 250,
    xpPerLevel: 300,
    achievements: [],
    unlockedCount: 0,
  },
  mission: {
    ...recommended,
    key: "refine_problem_with_evidence",
    title: "Refine o problema com evidencias",
    actionType: "problem_refinement",
    status: "available",
    statusLabel: "Disponivel",
    order: 20,
    whyItMatters: "Um problema especifico reduz risco.",
    instructions: ["Revise os padroes", "Reescreva o problema"],
    completionCriteria: "Registrar problema e evidencias.",
    contextualTip: "Nao cite a solucao.",
    requiredEvidenceCount: 1,
    evidenceCount: 0,
    canAddLearning: false,
    canComplete: false,
    requirements: [
      {
        key: "submission",
        label: "Entregavel registrado",
        current: 0,
        target: 1,
        completed: false,
      },
    ],
    steps: [
      {
        key: "submit",
        title: "Refine o problema",
        description: "Conecte as entrevistas.",
        status: "current",
      },
    ],
    evidences: [],
    learning: null,
  },
};

function detailFor(actionType: MissionActionType): MissionDetailPayload {
  const metadata: Record<MissionActionType, { key: string; title: string }> = {
    interviews: { key: "customer_interviews_5", title: "Converse com 5 potenciais clientes" },
    problem_refinement: {
      key: "refine_problem_with_evidence",
      title: "Refine o problema com evidencias",
    },
    audience_validation: {
      key: "validate_priority_audience",
      title: "Valide o publico prioritario",
    },
    value_proposition: {
      key: "reframe_value_proposition",
      title: "Reformule a proposta de valor",
    },
    alternatives_map: {
      key: "map_current_alternatives",
      title: "Mapeie as alternativas atuais",
    },
  };

  return {
    ...detail,
    mission: {
      ...detail.mission,
      ...metadata[actionType],
      actionType,
    },
  };
}

function mockDetail(payload: MissionDetailPayload = detail) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("MissionDetailScreen", () => {
  it("leaves the workspace shell as the only main landmark", async () => {
    mockDetail();
    const view = render(
      <main id="workspace-content">
        <MissionDetailScreen missionKey={detail.mission.key} startupId={7} />
      </main>
    );

    await screen.findByRole("heading", { name: detail.mission.title });

    expect(view.container.querySelectorAll("main")).toHaveLength(1);
  });

  it("submits problem evidence and shows the next recommendation", async () => {
    const onWorkspaceChanged = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...detail,
            mission: { ...detail.mission, status: "completed", statusLabel: "Concluida" },
            message: "Missao concluida.",
            nextRecommendedMission: {
              ...recommended,
              key: "validate_priority_audience",
              title: "Valide o publico prioritario",
              actionType: "audience_validation",
              order: 30,
            },
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MissionDetailScreen
        missionKey="refine_problem_with_evidence"
        onWorkspaceChanged={onWorkspaceChanged}
        startupId={7}
      />
    );

    fireEvent.change(await screen.findByLabelText("Problema refinado"), {
      target: {
        value:
          "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
      },
    });
    fireEvent.change(screen.getByLabelText("Evidencias que sustentam o problema"), {
      target: {
        value:
          "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar e concluir missao" }));

    await screen.findByText("Missao concluida.");
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      problemStatement:
        "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
      evidenceSummary:
        "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
    });
    expect(screen.getByRole("link", { name: /Valide o publico prioritario/ })).toHaveAttribute(
      "href",
      "/painel/startup/7/missoes/validate_priority_audience"
    );
    expect(onWorkspaceChanged).toHaveBeenCalledOnce();
  });

  it("shows backend field errors next to the matching control", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              message: "Revise",
              fieldErrors: {
                problemStatement: ["O problema deve ter pelo menos 40 caracteres."],
              },
            }),
            { status: 400 }
          )
        )
    );
    render(<MissionDetailScreen missionKey="refine_problem_with_evidence" startupId={7} />);

    const control = await screen.findByLabelText("Problema refinado");
    const hint = screen.getAllByText("Minimo de 40 caracteres.")[0];
    expect(hint.id).not.toBe("");
    expect(control).toHaveAttribute("aria-describedby", hint.id);

    fireEvent.click(await screen.findByRole("button", { name: "Salvar e concluir missao" }));
    const error = await screen.findByText("O problema deve ter pelo menos 40 caracteres.");

    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control.getAttribute("aria-describedby")?.split(" ")).toEqual([hint.id, error.id]);
  });

  it("freezes every form control while a submission is pending", async () => {
    const audience = detailFor("audience_validation");
    let resolveSubmission!: (response: Response) => void;
    const pendingSubmission = new Promise<Response>((resolve) => {
      resolveSubmission = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(audience), { status: 200 }))
        .mockReturnValueOnce(pendingSubmission)
    );
    render(<MissionDetailScreen missionKey={audience.mission.key} startupId={7} />);

    const audienceControl = await screen.findByLabelText("Publico prioritario");
    const signalsControl = screen.getByLabelText("Sinais observados");
    const decisionControl = screen.getByLabelText("Decisao");
    fireEvent.change(audienceControl, {
      target: { value: "Donos de restaurantes independentes com controle manual de estoque." },
    });
    fireEvent.change(signalsControl, {
      target: { value: "Relatam perda semanal e decidem diretamente as compras do negocio." },
    });
    fireEvent.change(decisionControl, { target: { value: "keep" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar e concluir missao" }));

    expect(await screen.findByRole("button", { name: "Salvando missao..." })).toBeDisabled();
    expect(audienceControl).toBeDisabled();
    expect(signalsControl).toBeDisabled();
    expect(decisionControl).toBeDisabled();

    resolveSubmission(
      new Response(
        JSON.stringify({
          ...audience,
          mission: { ...audience.mission, status: "completed", statusLabel: "Concluida" },
          message: "Publico validado.",
        }),
        { status: 200 }
      )
    );
    await screen.findByText("Publico validado.");
  });

  it("keeps a completed mission read-only", async () => {
    const completed: MissionDetailPayload = {
      ...detail,
      mission: {
        ...detail.mission,
        status: "completed",
        statusLabel: "Concluida",
        evidences: [
          {
            id: 1,
            type: "document",
            title: "Problema refinado",
            summary: "Evidencia registrada",
            details: { problemStatement: "Problema final" },
            intervieweeName: "",
            intervieweeProfile: "",
            context: "",
            notes: "Evidencia registrada",
            occurredOn: "2026-07-16",
            createdAt: "2026-07-16T12:00:00Z",
          },
        ],
      },
    };
    mockDetail(completed);
    render(<MissionDetailScreen missionKey="refine_problem_with_evidence" startupId={7} />);

    expect(await screen.findByText("Problema final")).toBeInTheDocument();
    expect(screen.getByText("Problema refinado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Salvar e concluir missao" })
    ).not.toBeInTheDocument();
  });

  it("renders every structured mission as an explicit form with backend limits", async () => {
    const cases = [
      {
        actionType: "problem_refinement" as const,
        fields: [
          ["Problema refinado", "40"],
          ["Evidencias que sustentam o problema", "40"],
        ],
      },
      {
        actionType: "audience_validation" as const,
        fields: [
          ["Publico prioritario", "30"],
          ["Sinais observados", "40"],
        ],
      },
      {
        actionType: "value_proposition" as const,
        fields: [
          ["Proposta de valor", "30"],
          ["Por que esta proposta faz sentido", "30"],
        ],
      },
      {
        actionType: "alternatives_map" as const,
        fields: [
          ["Alternativas atuais", "40"],
          ["Limitacoes observadas", "40"],
          ["Oportunidade", "30"],
        ],
      },
    ];

    for (const current of cases) {
      mockDetail(detailFor(current.actionType));
      const view = render(
        <MissionDetailScreen missionKey={detailFor(current.actionType).mission.key} startupId={7} />
      );

      for (const [label, minLength] of current.fields) {
        const field = await screen.findByLabelText(label);
        expect(field).toBeRequired();
        expect(field).toHaveAttribute("minlength", minLength);
      }

      if (current.actionType === "audience_validation") {
        expect(screen.getByLabelText("Decisao")).toHaveDisplayValue("Selecione uma decisao");
        expect(screen.getByRole("option", { name: "Manter" })).toHaveValue("keep");
        expect(screen.getByRole("option", { name: "Ajustar" })).toHaveValue("adjust");
      }

      view.unmount();
      vi.unstubAllGlobals();
    }
  });

  it("submits the explicit payload for audience validation", async () => {
    const audience = detailFor("audience_validation");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(audience), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...audience,
            mission: { ...audience.mission, status: "completed", statusLabel: "Concluida" },
            message: "Publico validado.",
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<MissionDetailScreen missionKey={audience.mission.key} startupId={7} />);

    fireEvent.change(await screen.findByLabelText("Publico prioritario"), {
      target: { value: "Donos de restaurantes independentes com controle manual de estoque." },
    });
    fireEvent.change(screen.getByLabelText("Sinais observados"), {
      target: { value: "Relatam perda semanal e decidem diretamente as compras do negocio." },
    });
    fireEvent.change(screen.getByLabelText("Decisao"), { target: { value: "keep" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar e concluir missao" }));

    await screen.findByText("Publico validado.");
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      audienceStatement: "Donos de restaurantes independentes com controle manual de estoque.",
      observedSignals: "Relatam perda semanal e decidem diretamente as compras do negocio.",
      decision: "keep",
    });
  });

  it("explains every lock reason and does not expose a submission", async () => {
    const locked = {
      ...detail,
      mission: {
        ...detail.mission,
        status: "locked" as const,
        statusLabel: "Bloqueada",
        lockedReasons: [
          "Conclua: Converse com 5 potenciais clientes",
          "Registre pelo menos um aprendizado das entrevistas",
        ],
      },
    };
    mockDetail(locked);
    render(<MissionDetailScreen missionKey={locked.mission.key} startupId={7} />);

    const blockedRegion = await screen.findByRole("region", { name: "Missao bloqueada" });
    expect(within(blockedRegion).getByText(locked.mission.lockedReasons[0])).toBeInTheDocument();
    expect(within(blockedRegion).getByText(locked.mission.lockedReasons[1])).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Salvar e concluir missao" })
    ).not.toBeInTheDocument();
  });

  it("keeps interviews on Home instead of creating another form", async () => {
    const interviews = detailFor("interviews");
    mockDetail(interviews);
    render(<MissionDetailScreen missionKey={interviews.mission.key} startupId={7} />);

    expect(await screen.findByText(/entrevistas continuam na Home/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar na Home" })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("shows an accessible loading state and redirects expired sessions", async () => {
    let resolveRequest!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));
    const view = render(<MissionDetailScreen missionKey={detail.mission.key} startupId={7} />);

    expect(screen.getByLabelText("Carregando detalhes da missao")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    resolveRequest(new Response(null, { status: 401 }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    view.unmount();
  });
});
