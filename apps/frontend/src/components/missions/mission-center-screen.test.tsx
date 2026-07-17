import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  MissionCardSummary,
  MissionCenterPayload,
  StartupSummary,
} from "@/lib/startup-types";

import { MissionCenterScreen } from "./mission-center-screen";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

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
  status: "in_progress",
  statusLabel: "Em andamento",
  progress: 40,
  actionType: "interviews",
  isRequired: true,
  order: 10,
  priority: 100,
  prerequisiteKeys: [],
  lockedReasons: [],
  recommendationReason: "Continue esta missao porque ela ja esta em andamento.",
  completedAt: null,
} satisfies MissionCardSummary;

const payload: MissionCenterPayload = {
  startup: { id: 7, name: "Aurora Labs" } as StartupSummary,
  catalogVersion: 2,
  arc: { key: "discovery", title: "Descoberta", completed: 0, total: 5, progress: 0 },
  recommendedMission: recommended,
  availableMissions: [],
  lockedMissions: [
    {
      ...recommended,
      key: "refine_problem_with_evidence",
      title: "Refine o problema com evidencias",
      status: "locked",
      statusLabel: "Bloqueada",
      progress: 0,
      actionType: "problem_refinement",
      order: 20,
      prerequisiteKeys: ["customer_interviews_5"],
      lockedReasons: ["Conclua: Converse com 5 potenciais clientes"],
      recommendationReason: null,
    },
  ],
  completedMissions: [],
  gamification: {
    xp: 250,
    level: 1,
    xpIntoLevel: 250,
    xpPerLevel: 300,
    achievements: [],
    unlockedCount: 0,
  },
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("MissionCenterScreen", () => {
  it("renders one focus, hides empty alternatives and explains locks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))
    );
    render(<MissionCenterScreen startupId={7} />);

    expect(await screen.findByRole("heading", { name: recommended.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar missao" })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
    expect(screen.queryByRole("heading", { name: "Tambem disponivel" })).not.toBeInTheDocument();
    expect(screen.getByText("Conclua: Converse com 5 potenciais clientes")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    const trail = screen.getByRole("region", { name: "Trilha completa" });
    expect(within(trail).getByRole("link", { name: new RegExp(recommended.title) })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
  });

  it("renders real alternatives when the API returns them", async () => {
    const withAlternative = {
      ...payload,
      availableMissions: [
        {
          ...recommended,
          key: "map_current_alternatives",
          title: "Mapeie as alternativas atuais",
          actionType: "alternatives_map" as const,
          order: 50,
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(withAlternative), { status: 200 }))
    );
    render(<MissionCenterScreen startupId={7} />);

    expect(await screen.findByRole("heading", { name: "Tambem disponivel" })).toBeInTheDocument();
    const alternatives = screen.getByRole("region", { name: "Tambem disponivel" });
    expect(within(alternatives).getByRole("link", { name: /Mapeie as alternativas atuais/ })).toHaveAttribute(
      "href",
      "/painel/startup/7/missoes/map_current_alternatives"
    );
  });

  it("keeps the newest startup when requests resolve out of order", async () => {
    const auroraResponse = deferred<Response>();
    const borealResponse = deferred<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(auroraResponse.promise)
      .mockReturnValueOnce(borealResponse.promise);
    const borealMission = {
      ...recommended,
      key: "validate_initial_audience",
      title: "Valide o publico inicial",
      actionType: "audience_validation" as const,
    };
    const borealPayload: MissionCenterPayload = {
      ...payload,
      startup: { ...payload.startup, id: 8, name: "Boreal" },
      recommendedMission: borealMission,
      lockedMissions: [],
    };
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(<MissionCenterScreen startupId={7} />);
    rerender(<MissionCenterScreen startupId={8} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      borealResponse.resolve(new Response(JSON.stringify(borealPayload), { status: 200 }));
      await borealResponse.promise;
    });
    expect(
      await screen.findByRole("heading", { name: borealMission.title })
    ).toBeInTheDocument();

    await act(async () => {
      auroraResponse.resolve(new Response(JSON.stringify(payload), { status: 200 }));
      await auroraResponse.promise;
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: borealMission.title })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: recommended.title })).not.toBeInTheDocument();
    });
  });

  it("shows an actionable retry state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: "Falha" }), { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MissionCenterScreen startupId={7} />);

    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("shows an honest completed-arc state without inventing the next module", async () => {
    const completedArc: MissionCenterPayload = {
      ...payload,
      arc: { ...payload.arc, completed: 5, progress: 100 },
      recommendedMission: null,
      availableMissions: [],
      lockedMissions: [],
      completedMissions: Array.from({ length: 5 }, (_, index) => ({
        ...recommended,
        key: `completed_${index}`,
        title: `Missao concluida ${index + 1}`,
        status: "completed" as const,
        statusLabel: "Concluida",
        progress: 100,
        order: (index + 1) * 10,
        completedAt: "2026-07-16T12:00:00Z",
      })),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(completedArc), { status: 200 }))
    );
    render(<MissionCenterScreen startupId={7} />);

    expect(
      await screen.findByRole("heading", { name: "Arco de Descoberta concluido" })
    ).toBeInTheDocument();
    expect(screen.getByText(/A proxima trilha ainda nao foi liberada/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar missao" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("renders an accessible skeleton while loading", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));

    render(<MissionCenterScreen startupId={7} />);

    expect(screen.getByLabelText("Carregando central de missoes")).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("redirects expired sessions and explains missing startups", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Nao encontrada" }), { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    const { unmount } = render(<MissionCenterScreen startupId={7} />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    unmount();

    render(<MissionCenterScreen startupId={99} />);
    expect(
      await screen.findByText("Esta startup nao existe ou voce nao pode mais acessa-la.")
    ).toBeInTheDocument();
  });
});
