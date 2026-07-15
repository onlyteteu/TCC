import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceTopbar } from "./workspace-topbar";

const openStartup = vi.fn();
const replace = vi.fn();
let pathname = "/painel/startups";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}));
vi.mock("./workspace-context", () => ({
  useWorkspace: () => ({
    accountProgress: null,
    activeStartup: { id: 7, name: "Aurora" },
    openStartup,
    startups: [{ id: 7, name: "Aurora" }, { id: 8, name: "Boreal" }],
    user: { email: "ana@example.com", name: "Ana" },
  }),
}));

describe("WorkspaceTopbar menus", () => {
  beforeEach(() => {
    openStartup.mockReset().mockResolvedValue(true);
    pathname = "/painel/startups";
    replace.mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("closes the startup selector and restores summary focus after opening another startup", async () => {
    render(<WorkspaceTopbar />);
    const summary = screen.getByLabelText("Selecionar startup");
    const details = summary.closest("details")!;
    details.open = true;

    fireEvent.click(screen.getByRole("button", { name: /Boreal/ }));

    await waitFor(() => expect(openStartup).toHaveBeenCalledWith(8));
    expect(details).not.toHaveAttribute("open");
    expect(summary).toHaveFocus();
  });

  it("closes the profile menu and restores summary focus before logout navigation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    render(<WorkspaceTopbar />);
    const summary = screen.getByLabelText("Abrir menu do perfil");
    const details = summary.closest("details")!;
    details.open = true;

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(details).not.toHaveAttribute("open");
    expect(summary).toHaveFocus();
  });

  it("closes the startup selector and restores focus when its link is a navigation no-op", () => {
    render(<WorkspaceTopbar />);
    const summary = screen.getByLabelText("Selecionar startup");
    const details = summary.closest("details")!;
    details.open = true;

    fireEvent.click(screen.getByRole("link", { name: "Ver todas as startups" }));

    expect(details).not.toHaveAttribute("open");
    expect(summary).toHaveFocus();
  });
});
