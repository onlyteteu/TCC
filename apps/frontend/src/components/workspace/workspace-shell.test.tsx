import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWorkspace } from "./workspace-context";
import { WorkspaceShell } from "./workspace-shell";

const navigation = vi.hoisted(() => ({
  params: {} as { startupId?: string },
  pathname: "/painel/startups",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => navigation.params,
  usePathname: () => navigation.pathname,
  useRouter: () => navigation,
}));

function ModalProbe() {
  const workspace = useWorkspace() as ReturnType<typeof useWorkspace> & {
    setWorkspaceModalOpen: (open: boolean) => void;
  };

  return (
    <button onClick={() => workspace.setWorkspaceModalOpen(true)} type="button">
      Abrir modal de teste
    </button>
  );
}

describe("WorkspaceShell", () => {
  afterEach(() => {
    navigation.params = {};
    navigation.pathname = "/painel/startups";
    vi.unstubAllGlobals();
  });

  it("makes the complete shell unavailable to assistive technology", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        return Promise.resolve(
          new Response(
            JSON.stringify(
              url === "/api/auth/me"
                ? { authenticated: true, user: { id: 1, name: "Ana", email: "ana@x.com" } }
                : { startups: [], accountProgress: null }
            ),
            { headers: { "Content-Type": "application/json" }, status: 200 }
          )
        );
      })
    );
    render(
      <WorkspaceShell>
        <ModalProbe />
      </WorkspaceShell>
    );

    const trigger = await screen.findByRole("button", { name: "Abrir modal de teste" });
    const shell = screen.getByRole("main").parentElement?.parentElement;
    fireEvent.click(trigger);

    await waitFor(() => expect(shell).toHaveAttribute("inert"));
    expect(shell).toHaveAttribute("aria-hidden", "true");
  });

  it("marks Missoes active on mission center and detail routes", async () => {
    navigation.params = { startupId: "7" };
    navigation.pathname = "/painel/startup/7/missoes/refine_problem_with_evidence";
    const startup = {
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
    };
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        const body =
          url === "/api/auth/me"
            ? { authenticated: true, user: { id: 1, name: "Ana", email: "ana@x.com" } }
            : url.endsWith("/open")
              ? { startup }
              : { startups: [startup], accountProgress: null };
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          })
        );
      })
    );

    render(
      <WorkspaceShell>
        <div>Conteudo</div>
      </WorkspaceShell>
    );

    const atmosphere = document.querySelector('[data-workspace-atmosphere="ritual"]');
    expect(atmosphere).toHaveAttribute("aria-hidden", "true");
    expect(await screen.findByRole("link", { name: "Missoes" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
