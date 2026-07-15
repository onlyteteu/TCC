import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWorkspace } from "./workspace-context";
import { WorkspaceShell } from "./workspace-shell";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
  usePathname: () => "/painel/startups",
  useRouter: () => router,
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

describe("WorkspaceShell modal coordination", () => {
  afterEach(() => vi.unstubAllGlobals());

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
});
