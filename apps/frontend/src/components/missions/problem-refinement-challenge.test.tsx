import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  MissionDetailPayload,
  MissionDetailSummary,
  MissionEvidenceSummary,
  StartupSummary,
} from "@/lib/startup-types";

import { ProblemRefinementChallenge } from "./problem-refinement-challenge";

const interview = (id: number): MissionEvidenceSummary => ({
  id,
  type: "interview",
  title: `Entrevista ${id}`,
  summary: `Restaurante ${id} relatou compras duplicadas.`,
  details: {},
  intervieweeName: `Pessoa ${id}`,
  intervieweeProfile: "Dono de restaurante",
  context: "Controle semanal de estoque",
  notes: `Relato ${id}: comprou ingredientes que ainda estavam guardados.`,
  occurredOn: "2026-07-20",
  createdAt: "2026-07-20T12:00:00Z",
});

const startup = {
  id: 7,
  name: "Aurora Labs",
  audience: "Donos de restaurantes pequenos",
  problem: "Compras duplicadas de ingredientes",
} as StartupSummary;

const mission = {
  key: "refine_problem_with_evidence",
  title: "Refine o problema com evidências",
  objective: "Reescrever o problema usando os padrões encontrados nas entrevistas.",
  xpReward: 100,
  sourceEvidences: [1, 2, 3, 4, 5].map(interview),
  evidences: [],
  status: "available",
} as MissionDetailSummary;

type ChallengeProps = {
  celebration?: MissionDetailPayload["celebration"];
  isSubmitting?: boolean;
  mission?: MissionDetailSummary;
  startupId?: number;
  submissionError?: string | null;
};

function renderChallenge(props: ChallengeProps = {}) {
  const onSubmit = vi.fn();
  const challenge = (next: ChallengeProps = props) => (
    <ProblemRefinementChallenge
      celebration={next.celebration}
      isSubmitting={next.isSubmitting ?? false}
      mission={next.mission ?? mission}
      onSubmit={onSubmit}
      startup={startup}
      startupId={next.startupId ?? 7}
      submissionError={next.submissionError ?? null}
    />
  );
  const view = render(challenge());
  return {
    onSubmit,
    ...view,
    rerenderChallenge: (next: ChallengeProps) => view.rerender(challenge(next)),
  };
}

function reachDiscoveryCard() {
  fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));
  fireEvent.click(screen.getByRole("button", { name: /Pessoa 1/ }));
  fireEvent.click(screen.getByRole("button", { name: /Pessoa 2/ }));
  fireEvent.click(screen.getByRole("button", { name: "Montar meu problema" }));
  fireEvent.change(screen.getByLabelText("Quem enfrenta esse problema?"), {
    target: { value: "Restaurantes pequenos" },
  });
  fireEvent.change(screen.getByLabelText("Em qual situação isso acontece?"), {
    target: { value: "controlam o estoque semanal" },
  });
  fireEvent.change(screen.getByLabelText("Qual dificuldade aparece?"), {
    target: { value: "saber o saldo real" },
  });
  fireEvent.change(screen.getByLabelText("Qual consequência pode ser observada?"), {
    target: { value: "compras duplicadas" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Revisar descoberta" }));
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ProblemRefinementChallenge", () => {
  it("teaches recognition with immediate feedback before opening the startup evidence", () => {
    renderChallenge();

    expect(
      screen.getByRole("heading", {
        name: "Qual formulação descreve um problema observável?",
      })
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Empresas precisam de uma plataforma mais moderna.",
      })
    );
    expect(screen.getByRole("status")).toHaveTextContent("Isso ainda é uma opinião");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Restaurantes pequenos perdem margem/,
      })
    );
    expect(screen.getByRole("status")).toHaveTextContent("Insight liberado");

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("2 de 4")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Quais relatos sustentam melhor o padrão?" })
    ).toBeInTheDocument();
  });

  it("unlocks composition after the founder connects two interview cards", () => {
    renderChallenge();
    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));

    const continueButton = screen.getByRole("button", { name: "Montar meu problema" });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Pessoa 1/ }));
    expect(screen.getByText("1 de 2 sinais conectados")).toBeInTheDocument();
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Pessoa 2/ }));
    expect(screen.getByText("2 de 2 sinais conectados")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Evidências conectadas");
    expect(continueButton).toBeEnabled();
  });

  it("moves focus to the next round after a keyboard action", () => {
    renderChallenge();

    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));

    expect(
      screen.getByRole("heading", { name: "Quais relatos sustentam melhor o padrão?" })
    ).toHaveFocus();
  });

  it("keeps the evidence round limited to five stable interview cards", () => {
    renderChallenge({
      mission: { ...mission, sourceEvidences: [1, 2, 3, 4, 5, 6, 7].map(interview) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));

    expect(screen.getByRole("button", { name: /Pessoa 5/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pessoa 6/ })).not.toBeInTheDocument();
  });

  it("builds and submits a discovery card from four short answers", () => {
    const { onSubmit } = renderChallenge();
    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));
    fireEvent.click(screen.getByRole("button", { name: /Pessoa 1/ }));
    fireEvent.click(screen.getByRole("button", { name: /Pessoa 2/ }));
    fireEvent.click(screen.getByRole("button", { name: "Montar meu problema" }));

    const reviewButton = screen.getByRole("button", { name: "Revisar descoberta" });
    expect(reviewButton).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Quem enfrenta esse problema?"), {
      target: { value: "Restaurantes pequenos" },
    });
    fireEvent.change(screen.getByLabelText("Em qual situação isso acontece?"), {
      target: { value: "controlam o estoque no fim da semana" },
    });
    fireEvent.change(screen.getByLabelText("Qual dificuldade aparece?"), {
      target: { value: "saber o que ainda está disponível" },
    });
    fireEvent.change(screen.getByLabelText("Qual consequência pode ser observada?"), {
      target: { value: "compras duplicadas e perda de margem" },
    });

    expect(screen.getByRole("status", { name: "Prévia do problema" })).toHaveTextContent(
      "Restaurantes pequenos, quando controlam o estoque no fim da semana"
    );
    expect(reviewButton).toBeEnabled();
    expect(screen.getByLabelText("Perguntas de revisão")).toHaveTextContent(
      "A dificuldade está descrita sem antecipar uma solução?"
    );
    fireEvent.click(reviewButton);

    expect(screen.getByRole("heading", { name: "Sua Carta da Descoberta" })).toBeInTheDocument();
    expect(screen.getByText("2 entrevistas conectadas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Registrar descoberta" }));

    expect(onSubmit).toHaveBeenCalledWith({
      problemStatement:
        "Restaurantes pequenos, quando controlam o estoque no fim da semana, há dificuldade para " +
        "saber o que ainda está disponível, o que provoca compras duplicadas e perda de margem.",
      evidenceSummary:
        "2 entrevistas sustentam este recorte. Pessoa 1: Relato 1: comprou ingredientes que ainda " +
        "estavam guardados. | Pessoa 2: Relato 2: comprou ingredientes que ainda estavam guardados.",
    });
  });

  it("restores an interrupted draft and keeps saving short answers", async () => {
    localStorage.setItem(
      "startup-quest:problem-refinement:7",
      JSON.stringify({
        stage: 3,
        warmupAnswer: "observed",
        selectedEvidenceIds: [1, 2],
        audience: "Restaurantes de bairro",
        situation: "fecham o estoque da semana",
        difficulty: "conferir os ingredientes restantes",
        consequence: "compras repetidas",
      })
    );

    const firstView = renderChallenge();
    expect(await screen.findByDisplayValue("Restaurantes de bairro")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Quem enfrenta esse problema?"), {
      target: { value: "Pequenos restaurantes familiares" },
    });
    await waitFor(() =>
      expect(localStorage.getItem("startup-quest:problem-refinement:7")).toContain(
        "Pequenos restaurantes familiares"
      )
    );

    firstView.unmount();
    renderChallenge();
    expect(await screen.findByDisplayValue("Pequenos restaurantes familiares")).toBeInTheDocument();
  });

  it("returns to evidence selection when a saved draft references interviews that no longer exist", async () => {
    localStorage.setItem(
      "startup-quest:problem-refinement:7",
      JSON.stringify({
        stage: 4,
        warmupAnswer: "observed",
        selectedEvidenceIds: [98, 99],
        audience: "Restaurantes de bairro",
        situation: "fecham o estoque da semana",
        difficulty: "conferir os ingredientes restantes",
        consequence: "compras repetidas",
      })
    );

    renderChallenge();

    expect(
      await screen.findByRole("heading", { name: "Quais relatos sustentam melhor o padrão?" })
    ).toBeInTheDocument();
    expect(screen.getByText("0 de 2 sinais conectados")).toBeInTheDocument();
    await waitFor(() =>
      expect(localStorage.getItem("startup-quest:problem-refinement:7")).toContain(
        '"selectedEvidenceIds":[]'
      )
    );
  });

  it("does not copy a draft over another startup when the route changes", async () => {
    const draftFor = (audience: string) => ({
      stage: 3,
      warmupAnswer: "observed",
      selectedEvidenceIds: [1, 2],
      audience,
      situation: "fecha o estoque da semana",
      difficulty: "conferir os ingredientes restantes",
      consequence: "compras repetidas",
    });
    localStorage.setItem("startup-quest:problem-refinement:7", JSON.stringify(draftFor("Startup sete")));
    localStorage.setItem("startup-quest:problem-refinement:8", JSON.stringify(draftFor("Startup oito")));

    const view = renderChallenge({ startupId: 7 });
    expect(await screen.findByDisplayValue("Startup sete")).toBeInTheDocument();

    view.rerenderChallenge({ startupId: 8 });
    expect(await screen.findByDisplayValue("Startup oito")).toBeInTheDocument();
    expect(localStorage.getItem("startup-quest:problem-refinement:7")).toContain("Startup sete");
    expect(localStorage.getItem("startup-quest:problem-refinement:8")).toContain("Startup oito");
  });

  it("keeps the challenge usable when the browser blocks autosave", async () => {
    const storageSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });

    renderChallenge();
    await waitFor(() => expect(storageSpy).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));

    expect(
      await screen.findByRole("heading", { name: "Quais relatos sustentam melhor o padrão?" })
    ).toBeInTheDocument();
  });

  it("clears the autosave after the discovery is registered", async () => {
    localStorage.setItem(
      "startup-quest:problem-refinement:7",
      JSON.stringify({ ...mission, stage: 4 })
    );

    renderChallenge({
      celebration: {
        title: "Problema refinado",
        xpAwarded: 100,
        unlocked: "Validação de público liberada",
      },
    });

    await waitFor(() =>
      expect(localStorage.getItem("startup-quest:problem-refinement:7")).toBeNull()
    );
  });

  it("offers a recovery path when prerequisite interviews are unavailable", () => {
    renderChallenge({ mission: { ...mission, sourceEvidences: [] } });
    fireEvent.click(screen.getByRole("button", { name: "Ir direto para minhas evidências" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "As entrevistas ainda não chegaram a este desafio"
    );
    expect(screen.getByRole("link", { name: "Revisar entrevistas" })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
  });

  it("shows recoverable submission feedback and then celebrates competence before XP", () => {
    const view = renderChallenge();
    reachDiscoveryCard();

    view.rerenderChallenge({ submissionError: "Não conseguimos registrar sua descoberta." });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não conseguimos registrar sua descoberta."
    );

    view.rerenderChallenge({
      celebration: {
        title: "Missão cumprida",
        xpAwarded: 100,
        unlocked: "Validação de público liberada",
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Você transformou relatos em um problema observável"
    );
    expect(screen.getByRole("status")).toHaveTextContent("+100 XP");
    expect(screen.getByRole("button", { name: "Descoberta registrada" })).toBeDisabled();
  });
});
