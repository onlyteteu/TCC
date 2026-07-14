import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceProvider, useWorkspace } from "./workspace-context";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

const startup = {
  audience: "Fundadores",
  createdAt: "2026-07-01T00:00:00Z",
  currentStage: "validation",
  currentStageLabel: "Validacao",
  description: "Plataforma",
  id: 7,
  initialGoal: "Validar",
  lastActivityAt: "2026-07-12T00:00:00Z",
  lastOpenedAt: "2026-07-12T00:00:00Z",
  name: "Aurora",
  problem: "Descoberta",
  segment: "SaaS",
  updatedAt: "2026-07-12T00:00:00Z",
};

function response(payload: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
      status,
    })
  );
}

function Probe() {
  const { isLoading, openStartup } = useWorkspace();

  return (
    <button disabled={isLoading} onClick={() => void openStartup(7)} type="button">
      Abrir
    </button>
  );
}

function RefreshProbe() {
  const { error, isLoading, refreshWorkspace } = useWorkspace();
  const [result, setResult] = useState("aguardando");

  return (
    <>
      <button
        disabled={isLoading}
        onClick={async () => {
          const refreshed = await refreshWorkspace({ silent: true });
          setResult(refreshed ? "atualizado" : "falhou");
        }}
        type="button"
      >
        Atualizar silenciosamente
      </button>
      <span>{result}</span>
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}

function ActiveStartupProbe() {
  const { activeStartup, isLoading, openStartup } = useWorkspace();

  return (
    <>
      <span>{isLoading ? "carregando" : activeStartup?.name ?? "nenhuma"}</span>
      <button disabled={isLoading} onClick={() => void openStartup(8)} type="button">
        Abrir Boreal
      </button>
    </>
  );
}

describe("WorkspaceProvider", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists the selected startup before navigating", async () => {
    let resolveOpen!: (value: Response) => void;
    const openResponse = new Promise<Response>((resolve) => {
      resolveOpen = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: null, startups: [startup] }))
      .mockImplementationOnce(() => openResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider activeStartupId={null}>
        <Probe />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir" })).toBeEnabled());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/startups/7/open", { method: "POST" })
    );
    expect(navigation.push).not.toHaveBeenCalled();

    resolveOpen(new Response(JSON.stringify({ message: "ok", startup }), { status: 200 }));
    await waitFor(() =>
      expect(navigation.push).toHaveBeenCalledWith("/painel/startup/7")
    );
  });

  it("does not navigate when persisting recent use fails", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: null, startups: [startup] }))
      .mockImplementationOnce(() => response({ message: "erro" }, 503));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider activeStartupId={null}>
        <Probe />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("returns false from a silent refresh without exposing a global workspace error", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: null, startups: [startup] }))
      .mockImplementationOnce(() => response({ message: "erro" }, 503))
      .mockImplementationOnce(() => response({ message: "erro" }, 503));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider activeStartupId={null}>
        <RefreshProbe />
      </WorkspaceProvider>
    );

    const refreshButton = await screen.findByRole("button", {
      name: "Atualizar silenciosamente",
    });
    await waitFor(() => expect(refreshButton).toBeEnabled());
    fireEvent.click(refreshButton);

    expect(await screen.findByText("falhou")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(refreshButton).toBeEnabled();
  });

  it("keeps one active startup across navigation and does not post open twice", async () => {
    const boreal = { ...startup, id: 8, name: "Boreal", lastOpenedAt: null };
    const openedBoreal = { ...boreal, lastOpenedAt: "2026-07-14T12:00:00Z" };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: null, startups: [startup, boreal] }))
      .mockImplementationOnce(() => response({ message: "ok", startup }))
      .mockImplementationOnce(() => response({ message: "ok", startup: openedBoreal }));
    vi.stubGlobal("fetch", fetchMock);

    const view = render(
      <WorkspaceProvider activeStartupId={7}>
        <ActiveStartupProbe />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(screen.getByText("Aurora")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Abrir Boreal" }));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/painel/startup/8"));
    expect(screen.getByText("Boreal")).toBeInTheDocument();

    view.rerender(
      <WorkspaceProvider activeStartupId={8}>
        <ActiveStartupProbe />
      </WorkspaceProvider>
    );
    await waitFor(() => expect(screen.getByText("Boreal")).toBeInTheDocument());

    view.rerender(
      <WorkspaceProvider activeStartupId={null}>
        <ActiveStartupProbe />
      </WorkspaceProvider>
    );
    expect(screen.getByText("Boreal")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/startups/8/open")
    ).toHaveLength(1);
  });
});
