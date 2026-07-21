import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { JourneyPayload, JourneyStepSummary } from "@/lib/startup-types";

import { StartupJourneyScreen } from "./startup-journey-screen";

const navigation = vi.hoisted(() => ({
  params: { get: vi.fn() },
  router: { replace: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
  useSearchParams: () => navigation.params,
}));

const steps: JourneyStepSummary[] = [
  { key: "problem", title: "Problema", status: "done", answer: "Fila longa", order: 0, completedAt: "2026-07-10T10:00:00Z" },
  { key: "audience", title: "Público-alvo", status: "done", answer: "Clínicas pequenas", order: 1, completedAt: "2026-07-10T10:00:00Z" },
  { key: "value", title: "Proposta de valor", status: "current", answer: "", order: 2, completedAt: null },
  { key: "differentiators", title: "Diferenciais", status: "pending", answer: "", order: 3, completedAt: null },
  { key: "validation", title: "Validação inicial", status: "pending", answer: "", order: 4, completedAt: null },
  { key: "business_model", title: "Modelo de negócio", status: "pending", answer: "", order: 5, completedAt: null },
  { key: "mvp", title: "Planejamento do MVP", status: "pending", answer: "", order: 6, completedAt: null },
  { key: "goals", title: "Metas iniciais", status: "pending", answer: "", order: 7, completedAt: null },
];

const payload: JourneyPayload = {
  startup: {
    id: 1,
    name: "Viva",
    description: "Uma ideia inicial",
    segment: "Saúde",
    problem: "Fila longa",
    audience: "Clínicas pequenas",
    initialGoal: "Validar a dor",
    currentStage: "value",
    currentStageLabel: "Proposta de valor",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-10T10:00:00Z",
    lastOpenedAt: null,
  },
  progress: 25,
  journey: steps,
  chapters: [
    { key: "foundation", title: "Fundamento", question: "Para quem e para qual dor esta startup existe?", status: "done", completedSteps: 2, totalSteps: 2, steps: steps.slice(0, 2) },
    { key: "proposal", title: "Proposta", question: "Por que essa startup merece existir?", status: "current", completedSteps: 0, totalSteps: 2, steps: steps.slice(2, 4) },
    { key: "validation", title: "Validação", question: "O que prova que a proposta é desejável e viável?", status: "locked", completedSteps: 0, totalSteps: 2, steps: steps.slice(4, 6) },
    { key: "construction", title: "Construção", question: "Qual é a menor entrega e como medir o avanço?", status: "locked", completedSteps: 0, totalSteps: 2, steps: steps.slice(6, 8) },
  ],
  currentMilestone: {
    key: "value",
    chapterKey: "proposal",
    title: "Proposta de valor",
    description: "Transforme problema e público em uma promessa clara.",
    alreadyBuilt: [],
    nextUnlock: { title: "Diferenciais", description: "Compare alternativas." },
    mission: {
      key: "reframe_value_proposition",
      title: "Reformule a proposta de valor",
      objective: "Conectar público, problema e resultado.",
      href: "/painel/startup/1/missoes/reframe_value_proposition",
      estimatedMinutes: 15,
      xpReward: 100,
      status: "available",
      canContinue: true,
    },
    message: null,
  },
  strategicSummary: [
    { key: "problem", label: "Problema", value: "Fila longa", field: "problem" },
    { key: "audience", label: "Público-alvo", value: "Clínicas pequenas", field: "audience" },
  ],
};

describe("StartupJourneyScreen", () => {
  beforeEach(() => {
    navigation.router.replace.mockReset();
    navigation.params.get.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload })
    );
  });

  it("renders the approved strategic Journey without direct completion", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    expect(await screen.findByRole("heading", { name: "Visão estratégica" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Por que essa startup merece existir?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar missão" })).toHaveAttribute(
      "href",
      "/painel/startup/1/missoes/reframe_value_proposition"
    );
    expect(screen.queryByRole("button", { name: "Concluir etapa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("opens the secondary Startup Map route from the header", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    fireEvent.click(await screen.findByRole("button", { name: "Abrir Mapa da startup" }));
    expect(navigation.router.replace).toHaveBeenCalledWith(
      "/painel/startup/1/jornada?view=map"
    );
  });

  it("renders the map view and focuses the field from the query string", async () => {
    navigation.params.get.mockImplementation((key: string) =>
      key === "view" ? "map" : key === "field" ? "problem" : null
    );

    render(<StartupJourneyScreen startupId={1} />);

    expect(await screen.findByRole("heading", { name: "Mapa da startup" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Problema" })).toHaveFocus();
    expect(screen.queryByRole("heading", { name: "Visão estratégica" })).not.toBeInTheDocument();
  });

  it("sends strategic review to the focused map field", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    fireEvent.click(await screen.findByRole("button", { name: "Revisar Problema" }));
    expect(navigation.router.replace).toHaveBeenCalledWith(
      "/painel/startup/1/jornada?view=map&field=problem"
    );
  });

  it("keeps the shell landmark clean during loading and supports retry after errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    render(<StartupJourneyScreen startupId={1} />);

    expect(await screen.findByRole("heading", { name: "Jornada indisponível" })).toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("heading", { name: "Visão estratégica" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps four stable Journey regions while loading", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));

    render(<StartupJourneyScreen startupId={1} />);

    expect(screen.getByLabelText("Carregando Mapa de Capítulos")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getAllByTestId("journey-skeleton-block")).toHaveLength(4);
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("keeps the edited value and reports a connection error in the map", async () => {
    navigation.params.get.mockImplementation((key: string) =>
      key === "view" ? "map" : key === "field" ? "problem" : null
    );
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(payload), { status: 200 })
      )
      .mockRejectedValueOnce(new Error("network down"));
    render(<StartupJourneyScreen startupId={1} />);

    const field = await screen.findByRole("textbox", { name: "Problema" });
    fireEvent.change(field, { target: { value: "Fila longa em horários de pico" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Problema" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Nao foi possivel salvar agora.");
    expect(field).toHaveValue("Fila longa em horários de pico");
  });

  it("reconciles the workspace after revising a strategic field", async () => {
    navigation.params.get.mockImplementation((key: string) =>
      key === "view" ? "map" : key === "field" ? "problem" : null
    );
    const onWorkspaceChanged = vi.fn().mockResolvedValue(true);
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(payload), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: "Atualizada", startup: payload.startup }),
          { status: 200 }
        )
      );
    render(
      <StartupJourneyScreen
        onWorkspaceChanged={onWorkspaceChanged}
        startupId={1}
      />
    );

    const field = await screen.findByRole("textbox", { name: "Problema" });
    fireEvent.change(field, { target: { value: "Fila longa em horários de pico" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Problema" }));

    await waitFor(() => expect(onWorkspaceChanged).toHaveBeenCalledTimes(1));
  });
});
