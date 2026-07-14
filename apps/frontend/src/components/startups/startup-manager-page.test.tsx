import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import StartupManagerPage from "@/app/painel/(workspace)/startups/page";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
}));

const workspace = vi.hoisted(() => ({
  current: {} as {
    activeStartup: StartupSummary | null;
    openStartup: ReturnType<typeof vi.fn>;
    refreshWorkspace: ReturnType<typeof vi.fn>;
    startups: StartupSummary[];
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

vi.mock("@/components/workspace/workspace-context", () => ({
  useWorkspace: () => workspace.current,
}));

const startups = [
  {
    audience: "Fundadores",
    createdAt: "2026-07-01T00:00:00Z",
    currentStage: "validation",
    currentStageLabel: "Validacao",
    description: "Plataforma",
    id: 1,
    initialGoal: "Validar",
    journeyProgress: 25,
    lastActivityAt: "2026-07-14T10:00:00Z",
    lastOpenedAt: "2026-07-14T10:00:00Z",
    name: "Aurora",
    problem: "Descoberta",
    segment: "SaaS",
    updatedAt: "2026-07-14T10:00:00Z",
  },
  {
    audience: "Times",
    createdAt: "2026-07-02T00:00:00Z",
    currentStage: "audience",
    currentStageLabel: "Publico-alvo",
    description: "Ferramenta",
    id: 2,
    initialGoal: "Entender",
    journeyProgress: 12,
    lastActivityAt: "2026-07-13T10:00:00Z",
    lastOpenedAt: "2026-07-13T10:00:00Z",
    name: "Atlas",
    problem: "Foco",
    segment: "SaaS",
    updatedAt: "2026-07-13T10:00:00Z",
  },
] satisfies StartupSummary[];

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
      status,
    })
  );
}

function openDeleteDialog(name = "Aurora") {
  fireEvent.click(screen.getByRole("button", { name: `Excluir ${name}` }));
  fireEvent.change(screen.getByLabelText(`Digite ${name} para confirmar`), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Excluir definitivamente" }));
}

describe("StartupManagerPage", () => {
  beforeEach(() => {
    navigation.replace.mockReset();
    workspace.current = {
      activeStartup: startups[0],
      openStartup: vi.fn().mockResolvedValue(true),
      refreshWorkspace: vi.fn().mockResolvedValue(true),
      startups,
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps a silent rename refresh failure in the originating row", async () => {
    workspace.current.refreshWorkspace.mockResolvedValue(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResponse({ message: "ok", startup: { ...startups[0], name: "Aurora Labs" } }))
    );
    render(<StartupManagerPage />);

    fireEvent.click(screen.getByRole("button", { name: "Renomear Aurora" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Novo nome de Aurora" }), {
      target: { value: "Aurora Labs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nome alterado, mas nao foi possivel atualizar a lista."
    );
    expect(workspace.current.refreshWorkspace).toHaveBeenCalledWith({ silent: true });
    expect(screen.queryByText("Workspace indisponivel")).not.toBeInTheDocument();
  });

  it.each([
    [2, "/painel/startup/2"],
    [null, "/painel/startups/nova"],
  ])("routes active deletion with nextStartupId %s", async (nextStartupId, destination) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({ deletedStartupId: 1, message: "excluida", nextStartupId })
      )
    );
    render(<StartupManagerPage />);

    openDeleteDialog();

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(destination));
    expect(workspace.current.refreshWorkspace).toHaveBeenCalledWith({ silent: true });
  });

  it("keeps a silent delete refresh failure in its dialog", async () => {
    workspace.current.activeStartup = startups[1];
    workspace.current.refreshWorkspace.mockResolvedValue(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({ deletedStartupId: 1, message: "excluida", nextStartupId: 2 })
      )
    );
    render(<StartupManagerPage />);

    openDeleteDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Startup excluida, mas nao foi possivel atualizar a lista."
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(workspace.current.refreshWorkspace).toHaveBeenCalledWith({ silent: true });
  });
});
