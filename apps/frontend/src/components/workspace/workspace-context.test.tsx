import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceProvider, useWorkspace } from "./workspace-context";
import { WorkspaceTopbar } from "./workspace-topbar";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/painel/startups",
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

function TopbarRefreshProbe() {
  const { isLoading, refreshWorkspace } = useWorkspace();

  return (
    <>
      <WorkspaceTopbar />
      <button
        disabled={isLoading}
        onClick={() => void refreshWorkspace({ silent: true })}
        type="button"
      >
        Reconciliar progresso
      </button>
    </>
  );
}

function WorkspaceRaceProbe() {
  const { activeStartup, isLoading, openStartup, refreshWorkspace, startups } = useWorkspace();
  const [refreshFinished, setRefreshFinished] = useState(false);

  return (
    <>
      <span data-testid="active-startup">{activeStartup?.name ?? "nenhuma"}</span>
      <span data-testid="startup-order">
        {startups.map((item) => `${item.id}:${item.lastOpenedAt ?? "nunca"}`).join("|")}
      </span>
      <button
        disabled={isLoading}
        onClick={async () => {
          await refreshWorkspace({ silent: true });
          setRefreshFinished(true);
        }}
        type="button"
      >
        Atualizar antes de abrir
      </button>
      <button disabled={isLoading} onClick={() => void openStartup(8)} type="button">
        Abrir Boreal durante refresh
      </button>
      {refreshFinished ? <span>Refresh antigo concluido</span> : null}
    </>
  );
}

function InitialRefreshRaceProbe() {
  const { activeStartup, isLoading, openStartup, startups } = useWorkspace();

  return (
    <>
      <span>{isLoading ? "Refresh inicial pendente" : "Refresh inicial concluido"}</span>
      <span data-testid="initial-race-active">{activeStartup?.name ?? "nenhuma"}</span>
      <span data-testid="initial-race-order">
        {startups.map((item) => `${item.id}:${item.lastOpenedAt ?? "nunca"}`).join("|")}
      </span>
      <button onClick={() => void openStartup(8)} type="button">
        Abrir Boreal antes da lista
      </button>
    </>
  );
}

function RefreshRequestOrderProbe() {
  const { accountProgress, isLoading, openStartup, refreshWorkspace, startups, user } = useWorkspace();
  const [newerRefreshFinished, setNewerRefreshFinished] = useState(false);

  return (
    <>
      <span>{isLoading ? "R1 pendente" : "R1 concluido"}</span>
      <span data-testid="ordered-refresh-user">{user?.name ?? "sem usuario"}</span>
      <span data-testid="ordered-refresh-xp">{accountProgress?.xp ?? 0} XP</span>
      <span data-testid="ordered-refresh-startups">
        {startups.map((item) => `${item.id}:${item.name}:${item.lastOpenedAt ?? "nunca"}`).join("|")}
      </span>
      <button onClick={() => void openStartup(8)} type="button">
        Abrir B entre refreshes
      </button>
      <button
        onClick={async () => {
          await refreshWorkspace({ silent: true });
          setNewerRefreshFinished(true);
        }}
        type="button"
      >
        Iniciar R2
      </button>
      {newerRefreshFinished ? <span>R2 concluido</span> : null}
    </>
  );
}

function ConcurrentLoadingProbe() {
  const { isLoading, refreshWorkspace } = useWorkspace();
  const [r1Finished, setR1Finished] = useState(false);
  const [r2Finished, setR2Finished] = useState(false);

  return (
    <>
      <span>{isLoading ? "Carregando concorrentes" : "Sem refresh pendente"}</span>
      <button
        onClick={async () => {
          await refreshWorkspace();
          setR1Finished(true);
        }}
        type="button"
      >
        Iniciar refresh concorrente R1
      </button>
      <button
        onClick={async () => {
          await refreshWorkspace();
          setR2Finished(true);
        }}
        type="button"
      >
        Iniciar refresh concorrente R2
      </button>
      {r1Finished ? <span>R1 concorrente retornou</span> : null}
      {r2Finished ? <span>R2 concorrente retornou</span> : null}
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

  it("updates the XP rendered beside the level after workspace reconciliation", async () => {
    const initialProgress = {
      achievements: [],
      currentStreak: 2,
      level: 2,
      unlockedCount: 0,
      xp: 120,
      xpIntoLevel: 20,
      xpPerLevel: 100,
    };
    const updatedProgress = { ...initialProgress, level: 3, xp: 230, xpIntoLevel: 30 };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: initialProgress, startups: [startup] }))
      .mockImplementationOnce(() =>
        response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
      )
      .mockImplementationOnce(() => response({ accountProgress: updatedProgress, startups: [startup] }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider>
        <TopbarRefreshProbe />
      </WorkspaceProvider>
    );

    expect(await screen.findByText("Nivel 2 · 120 XP")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reconciliar progresso" }));
    expect(await screen.findByText("Nivel 3 · 230 XP")).toBeInTheDocument();
  });

  it("does not let an older refresh overwrite a startup opened while it was pending", async () => {
    const boreal = { ...startup, id: 8, name: "Boreal", lastOpenedAt: null };
    const openedBoreal = { ...boreal, lastOpenedAt: "2026-07-15T12:00:00Z" };
    let authRequests = 0;
    let startupRequests = 0;
    let resolveStaleUser!: (value: Response) => void;
    let resolveStaleStartups!: (value: Response) => void;
    const staleUser = new Promise<Response>((resolve) => { resolveStaleUser = resolve; });
    const staleStartups = new Promise<Response>((resolve) => { resolveStaleStartups = resolve; });
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url === "/api/auth/me") {
        authRequests += 1;
        return authRequests === 1
          ? response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } })
          : staleUser;
      }
      if (url === "/api/startups") {
        startupRequests += 1;
        return startupRequests === 1
          ? response({ accountProgress: null, startups: [startup, boreal] })
          : staleStartups;
      }
      if (url === "/api/startups/8/open" && init?.method === "POST") {
        return response({ message: "ok", startup: openedBoreal });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider>
        <WorkspaceRaceProbe />
      </WorkspaceProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Atualizar antes de abrir" })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole("button", { name: "Atualizar antes de abrir" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir Boreal durante refresh" }));

    await waitFor(() => expect(screen.getByTestId("active-startup")).toHaveTextContent("Boreal"));
    expect(screen.getByTestId("startup-order")).toHaveTextContent(
      "8:2026-07-15T12:00:00Z|7:2026-07-12T00:00:00Z"
    );

    resolveStaleUser(
      new Response(
        JSON.stringify({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } }),
        { status: 200 }
      )
    );
    resolveStaleStartups(
      new Response(JSON.stringify({ accountProgress: null, startups: [startup, boreal] }), { status: 200 })
    );

    expect(await screen.findByText("Refresh antigo concluido")).toBeInTheDocument();
    expect(screen.getByTestId("startup-order")).toHaveTextContent(
      "8:2026-07-15T12:00:00Z|7:2026-07-12T00:00:00Z"
    );
  });

  it("incorporates the full initial list without overwriting a startup opened first", async () => {
    const boreal = { ...startup, id: 8, name: "Boreal", lastOpenedAt: null };
    const openedBoreal = { ...boreal, lastOpenedAt: "2026-07-15T15:00:00Z" };
    let resolveInitialUser!: (value: Response) => void;
    let resolveInitialStartups!: (value: Response) => void;
    const initialUser = new Promise<Response>((resolve) => { resolveInitialUser = resolve; });
    const initialStartups = new Promise<Response>((resolve) => { resolveInitialStartups = resolve; });
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url === "/api/auth/me") {
        return initialUser;
      }
      if (url === "/api/startups") {
        return initialStartups;
      }
      if (url === "/api/startups/8/open" && init?.method === "POST") {
        return response({ message: "ok", startup: openedBoreal });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider>
        <InitialRefreshRaceProbe />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Abrir Boreal antes da lista" }));

    await waitFor(() =>
      expect(screen.getByTestId("initial-race-active")).toHaveTextContent("Boreal")
    );
    expect(screen.getByTestId("initial-race-order")).toHaveTextContent(
      "8:2026-07-15T15:00:00Z"
    );

    resolveInitialUser(
      new Response(
        JSON.stringify({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } }),
        { status: 200 }
      )
    );
    resolveInitialStartups(
      new Response(JSON.stringify({ accountProgress: null, startups: [startup, boreal] }), { status: 200 })
    );

    expect(await screen.findByText("Refresh inicial concluido")).toBeInTheDocument();
    expect(screen.getByTestId("initial-race-active")).toHaveTextContent("Boreal");
    expect(screen.getByTestId("initial-race-order")).toHaveTextContent(
      "8:2026-07-15T15:00:00Z|7:2026-07-12T00:00:00Z"
    );
    expect(
      fetchMock.mock.calls.filter(([url, init]) =>
        url === "/api/startups/8/open" && init?.method === "POST"
      )
    ).toHaveLength(1);
  });

  it("ignores every stale field when an older refresh resolves after a newer refresh", async () => {
    const boreal = { ...startup, id: 8, name: "Boreal", lastOpenedAt: null };
    const openedBoreal = { ...boreal, lastOpenedAt: "2026-07-15T16:00:00Z" };
    const renamedAurora = { ...startup, name: "Aurora Nova", updatedAt: "2026-07-15T16:05:00Z" };
    const oldProgress = {
      achievements: [],
      level: 1,
      unlockedCount: 0,
      xp: 10,
      xpIntoLevel: 10,
      xpPerLevel: 100,
    };
    const newProgress = { ...oldProgress, level: 10, xp: 900, xpIntoLevel: 0 };
    let authRequests = 0;
    let startupRequests = 0;
    let resolveR1User!: (value: Response) => void;
    let resolveR1Startups!: (value: Response) => void;
    const r1User = new Promise<Response>((resolve) => { resolveR1User = resolve; });
    const r1Startups = new Promise<Response>((resolve) => { resolveR1Startups = resolve; });
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url === "/api/auth/me") {
        authRequests += 1;
        return authRequests === 1
          ? r1User
          : response({ authenticated: true, user: { email: "bia@example.com", id: 2, name: "Beatriz" } });
      }
      if (url === "/api/startups") {
        startupRequests += 1;
        return startupRequests === 1
          ? r1Startups
          : response({ accountProgress: newProgress, startups: [renamedAurora] });
      }
      if (url === "/api/startups/8/open" && init?.method === "POST") {
        return response({ message: "ok", startup: openedBoreal });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider>
        <RefreshRequestOrderProbe />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Abrir B entre refreshes" }));
    await waitFor(() =>
      expect(screen.getByTestId("ordered-refresh-startups")).toHaveTextContent(
        "8:Boreal:2026-07-15T16:00:00Z"
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar R2" }));
    expect(await screen.findByText("R2 concluido")).toBeInTheDocument();
    expect(screen.getByTestId("ordered-refresh-user")).toHaveTextContent("Beatriz");
    expect(screen.getByTestId("ordered-refresh-xp")).toHaveTextContent("900 XP");
    expect(screen.getByTestId("ordered-refresh-startups")).toHaveTextContent(
      "7:Aurora Nova:2026-07-12T00:00:00Z"
    );

    resolveR1User(
      new Response(
        JSON.stringify({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } }),
        { status: 200 }
      )
    );
    resolveR1Startups(
      new Response(JSON.stringify({ accountProgress: oldProgress, startups: [startup, boreal] }), { status: 200 })
    );

    expect(await screen.findByText("R1 concluido")).toBeInTheDocument();
    expect(screen.getByTestId("ordered-refresh-user")).toHaveTextContent("Beatriz");
    expect(screen.getByTestId("ordered-refresh-xp")).toHaveTextContent("900 XP");
    expect(screen.getByTestId("ordered-refresh-startups")).toHaveTextContent(
      "7:Aurora Nova:2026-07-12T00:00:00Z"
    );
    expect(screen.getByTestId("ordered-refresh-startups")).not.toHaveTextContent("Boreal");
    expect(
      fetchMock.mock.calls.filter(([url, init]) =>
        url === "/api/startups/8/open" && init?.method === "POST"
      )
    ).toHaveLength(1);
  });

  it("keeps loading until the latest non-silent refresh resolves", async () => {
    let authRequests = 0;
    let startupRequests = 0;
    let resolveR1User!: (value: Response) => void;
    let resolveR1Startups!: (value: Response) => void;
    let resolveR2User!: (value: Response) => void;
    let resolveR2Startups!: (value: Response) => void;
    const r1User = new Promise<Response>((resolve) => { resolveR1User = resolve; });
    const r1Startups = new Promise<Response>((resolve) => { resolveR1Startups = resolve; });
    const r2User = new Promise<Response>((resolve) => { resolveR2User = resolve; });
    const r2Startups = new Promise<Response>((resolve) => { resolveR2Startups = resolve; });
    const fetchMock = vi.fn((url: string) => {
      if (url === "/api/auth/me") {
        authRequests += 1;
        if (authRequests === 1) {
          return response({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } });
        }
        return authRequests === 2 ? r1User : r2User;
      }
      if (url === "/api/startups") {
        startupRequests += 1;
        if (startupRequests === 1) {
          return response({ accountProgress: null, startups: [startup] });
        }
        return startupRequests === 2 ? r1Startups : r2Startups;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceProvider>
        <ConcurrentLoadingProbe />
      </WorkspaceProvider>
    );

    expect(await screen.findByText("Sem refresh pendente")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Iniciar refresh concorrente R1" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    fireEvent.click(screen.getByRole("button", { name: "Iniciar refresh concorrente R2" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(6));
    expect(screen.getByText("Carregando concorrentes")).toBeInTheDocument();

    resolveR1User(
      new Response(
        JSON.stringify({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } }),
        { status: 200 }
      )
    );
    resolveR1Startups(
      new Response(JSON.stringify({ accountProgress: null, startups: [startup] }), { status: 200 })
    );

    expect(await screen.findByText("R1 concorrente retornou")).toBeInTheDocument();
    expect(screen.getByText("Carregando concorrentes")).toBeInTheDocument();

    resolveR2User(
      new Response(
        JSON.stringify({ authenticated: true, user: { email: "ana@example.com", id: 1, name: "Ana" } }),
        { status: 200 }
      )
    );
    resolveR2Startups(
      new Response(JSON.stringify({ accountProgress: null, startups: [startup] }), { status: 200 })
    );

    expect(await screen.findByText("R2 concorrente retornou")).toBeInTheDocument();
    expect(screen.getByText("Sem refresh pendente")).toBeInTheDocument();
  });
});
