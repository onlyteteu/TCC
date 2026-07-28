import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestWorkspaceBanner } from "./test-workspace-banner";

function deferredPromise() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("TestWorkspaceBanner", () => {
  it("explains the destructive scope before allowing the reset", () => {
    render(<TestWorkspaceBanner onReset={vi.fn()} />);

    expect(screen.getByLabelText("Modo de teste")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar ambiente" }));

    expect(
      screen.getByRole("dialog", { name: "Reiniciar ambiente de teste" })
    ).toBeInTheDocument();
    expect(screen.getByText("Progresso da jornada")).toBeInTheDocument();
    expect(screen.getByText("Missões e seus estados")).toBeInTheDocument();
    expect(screen.getByText("Entrevistas e outras evidências")).toBeInTheDocument();
    expect(screen.getByText("Aprendizados")).toBeInTheDocument();
    expect(screen.getByText("Atividades e XP dos testes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    ).toBeInTheDocument();
  });

  it("closes with Escape and returns focus to the trigger", async () => {
    render(<TestWorkspaceBanner onReset={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Reiniciar ambiente" });

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: "Reiniciar ambiente de teste",
    });
    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("focuses cancel first and closes from cancel or the backdrop", async () => {
    render(<TestWorkspaceBanner onReset={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Reiniciar ambiente" });

    fireEvent.click(trigger);
    const cancel = screen.getByRole("button", { name: "Manter progresso" });
    expect(cancel).toHaveFocus();
    fireEvent.click(cancel);
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Reiniciar ambiente de teste" })
      ).not.toBeInTheDocument()
    );
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: "Reiniciar ambiente de teste",
    });
    fireEvent.mouseDown(dialog.parentElement!);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("keeps Tab and Shift+Tab inside the confirmation dialog", () => {
    render(<TestWorkspaceBanner onReset={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar ambiente" }));
    const dialog = screen.getByRole("dialog", {
      name: "Reiniciar ambiente de teste",
    });
    const cancel = screen.getByRole("button", { name: "Manter progresso" });
    const confirm = screen.getByRole("button", {
      name: "Reiniciar na primeira missão",
    });

    expect(cancel).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(cancel).toHaveFocus();
  });

  it("runs only one reset while the confirmation is pending", async () => {
    const pending = deferredPromise();
    const onReset = vi.fn(() => pending.promise);
    render(<TestWorkspaceBanner onReset={onReset} />);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar ambiente" }));
    const confirm = screen.getByRole("button", {
      name: "Reiniciar na primeira missão",
    });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Reiniciando..." })
    ).toBeDisabled();

    pending.resolve();

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Reiniciar ambiente de teste" })
      ).not.toBeInTheDocument()
    );
  });

  it("keeps the dialog open and allows retry after an error", async () => {
    const first = deferredPromise();
    const onReset = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce();
    render(<TestWorkspaceBanner onReset={onReset} />);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar ambiente" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    );
    first.reject(new Error("O servidor recusou o reinício."));

    expect(
      await screen.findByRole("alert", {
        name: "",
      })
    ).toHaveTextContent("O servidor recusou o reinício.");
    expect(
      screen.getByRole("dialog", { name: "Reiniciar ambiente de teste" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Reiniciar na primeira missão" })
    );

    await waitFor(() => expect(onReset).toHaveBeenCalledTimes(2));
  });

  it("completes the current mission only once while the request is pending", async () => {
    const pending = deferredPromise();
    const onCompleteMission = vi.fn(() => pending.promise);
    render(
      <TestWorkspaceBanner
        onCompleteMission={onCompleteMission}
        onReset={vi.fn()}
      />
    );

    const complete = screen.getByRole("button", {
      name: "Concluir missão atual",
    });
    fireEvent.click(complete);
    fireEvent.click(complete);

    expect(onCompleteMission).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Concluindo missão..." })
    ).toBeDisabled();

    pending.resolve();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Concluir missão atual" })
      ).toBeEnabled()
    );
  });

  it("shows a completion error and allows retry", async () => {
    const onCompleteMission = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("Não foi possível avançar."))
      .mockResolvedValueOnce();
    render(
      <TestWorkspaceBanner
        onCompleteMission={onCompleteMission}
        onReset={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Concluir missão atual" })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível avançar."
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Concluir missão atual" })
    );
    await waitFor(() => expect(onCompleteMission).toHaveBeenCalledTimes(2));
  });
});
