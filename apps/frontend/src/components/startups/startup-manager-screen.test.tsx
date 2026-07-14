import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import { StartupManagerScreen } from "./startup-manager-screen";

const startups = [
  {
    id: 1,
    name: "Aurora",
    currentStageLabel: "Proposta de valor",
    journeyProgress: 25,
    lastActivityAt: "2026-07-14T10:00:00Z",
  },
  {
    id: 2,
    name: "Atlas",
    currentStageLabel: "Publico-alvo",
    journeyProgress: 12,
    lastActivityAt: "2026-07-13T10:00:00Z",
  },
] as StartupSummary[];

function renderManager(overrides: Partial<React.ComponentProps<typeof StartupManagerScreen>> = {}) {
  const props: React.ComponentProps<typeof StartupManagerScreen> = {
    activeStartupId: 1,
    onDelete: vi.fn().mockResolvedValue(undefined),
    onOpen: vi.fn().mockResolvedValue(undefined),
    onRename: vi.fn().mockResolvedValue(null),
    startups,
    ...overrides,
  };

  render(<StartupManagerScreen {...props} />);
  return props;
}

describe("StartupManagerScreen", () => {
  it("shows compact rows with status, progress and activity", () => {
    renderManager();

    expect(screen.getByRole("heading", { name: "Suas startups" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar nova startup" })).toHaveAttribute(
      "href",
      "/painel/startups/nova"
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Startup ativa")).toBeInTheDocument();
    expect(screen.getByText("Proposta de valor")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso de Aurora" })).toHaveAttribute(
      "aria-valuenow",
      "25"
    );
    expect(screen.getByText(/14 de jul\. de 2026/i)).toBeInTheDocument();
  });

  it("opens a startup from its row", async () => {
    const onOpen = vi.fn().mockResolvedValue(undefined);
    renderManager({ onOpen });

    fireEvent.click(screen.getByRole("button", { name: "Abrir Aurora" }));

    await waitFor(() => expect(onOpen).toHaveBeenCalledWith(1));
  });

  it("renames inline and keeps a returned error in the originating row", async () => {
    const onRename = vi.fn().mockResolvedValueOnce("Esse nome ja esta em uso.");
    renderManager({ onRename });

    fireEvent.click(screen.getByRole("button", { name: "Renomear Aurora" }));
    const input = screen.getByRole("textbox", { name: "Novo nome de Aurora" });
    fireEvent.change(input, { target: { value: "Aurora Labs" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome" }));

    await waitFor(() =>
      expect(onRename).toHaveBeenCalledWith(startups[0], "Aurora Labs")
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Esse nome ja esta em uso.");
    expect(screen.getByRole("textbox", { name: "Novo nome de Aurora" })).toBeInTheDocument();
  });

  it("requires the literal startup name before deletion and focuses the confirmation", async () => {
    renderManager();

    fireEvent.click(screen.getByRole("button", { name: "Excluir Aurora" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText(/jornada, missoes e evidencias/i)).toBeInTheDocument();
    const confirmation = screen.getByLabelText("Digite Aurora para confirmar");
    await waitFor(() => expect(confirmation).toHaveFocus());
    expect(screen.getByRole("button", { name: "Excluir definitivamente" })).toBeDisabled();

    fireEvent.change(confirmation, { target: { value: "aurora" } });
    expect(screen.getByRole("button", { name: "Excluir definitivamente" })).toBeDisabled();

    fireEvent.change(confirmation, { target: { value: "Aurora" } });
    expect(screen.getByRole("button", { name: "Excluir definitivamente" })).toBeEnabled();
  });

  it("closes the deletion dialog with Escape", () => {
    renderManager();

    fireEvent.click(screen.getByRole("button", { name: "Excluir Aurora" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps a deletion failure in the dialog that originated it", async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error("Nao foi possivel excluir agora."));
    renderManager({ onDelete });

    fireEvent.click(screen.getByRole("button", { name: "Excluir Aurora" }));
    fireEvent.change(screen.getByLabelText("Digite Aurora para confirmar"), {
      target: { value: "Aurora" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Excluir definitivamente" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Nao foi possivel excluir agora.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an empty state with the same creation action", () => {
    renderManager({ activeStartupId: null, startups: [] });

    expect(screen.getByText("Crie sua primeira startup")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Criar nova startup" })).not.toHaveLength(0);
  });
});
