import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { JourneyPayload } from "@/lib/startup-types";

import { StartupJourneyScreen } from "./startup-journey-screen";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

const payload: JourneyPayload = {
  startup: {
    id: 1,
    name: "Viva",
    description: "Uma ideia inicial",
    segment: "Saude",
    problem: "Fila longa",
    audience: "Clinicas pequenas",
    initialGoal: "Validar a dor",
    currentStage: "foundation",
    currentStageLabel: "Fundacao",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-10T10:00:00Z",
    lastOpenedAt: null,
  },
  progress: 50,
  journey: [
    {
      key: "problem",
      title: "Definicao do problema",
      status: "done",
      answer: "Fila longa",
      order: 0,
      completedAt: "2026-07-10T10:00:00Z",
    },
    {
      key: "audience",
      title: "Publico inicial",
      status: "current",
      answer: "",
      order: 1,
      completedAt: null,
    },
  ],
};

describe("StartupJourneyScreen", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload })
    );
  });

  it("loads the current step and switches tabs with the keyboard", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    expect(await screen.findByRole("heading", { name: "Publico inicial" })).toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();

    const journeyTab = screen.getByRole("tab", { name: "Jornada" });
    const mapTab = screen.getByRole("tab", { name: "Mapa inicial" });
    journeyTab.focus();
    fireEvent.keyDown(journeyTab, { key: "ArrowRight" });

    expect(mapTab).toHaveAttribute("aria-selected", "true");
    expect(mapTab).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Mapa inicial" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Publico inicial" })).not.toBeInTheDocument();

    fireEvent.keyDown(mapTab, { key: "Home" });
    expect(journeyTab).toHaveAttribute("aria-selected", "true");
    expect(journeyTab).toHaveFocus();

    fireEvent.keyDown(journeyTab, { key: "End" });
    expect(mapTab).toHaveAttribute("aria-selected", "true");
    expect(mapTab).toHaveFocus();
  });

  it("does not create a nested main landmark while loading", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));

    render(<StartupJourneyScreen startupId={1} />);

    expect(screen.getByText("Preparando a jornada da startup...")).toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("does not create a nested main landmark in the error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );

    render(<StartupJourneyScreen startupId={1} />);

    expect(await screen.findByRole("heading", { name: "Jornada indisponivel" })).toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("shows a friendly error when a map update loses the connection", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    await screen.findByRole("heading", { name: "Publico inicial" });
    fireEvent.click(screen.getByRole("tab", { name: "Mapa inicial" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar Nome" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
      target: { value: "Viva Bem" },
    });
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Nome" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nao foi possivel salvar agora."
    );
  });

  it("shows a friendly error when a journey update loses the connection", async () => {
    render(<StartupJourneyScreen startupId={1} />);

    await screen.findByRole("heading", { name: "Publico inicial" });
    fireEvent.change(screen.getByRole("textbox", { name: "Sua resposta" }), {
      target: { value: "Consultorios com agenda cheia" },
    });
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    fireEvent.click(screen.getByRole("button", { name: "Concluir etapa" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nao foi possivel salvar a etapa agora."
    );
  });
});
