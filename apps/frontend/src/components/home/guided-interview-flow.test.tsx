import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { guidedInterviewStorageKey } from "./guided-interview-model";
import { GuidedInterviewFlow } from "./guided-interview-flow";

function props(overrides: Partial<React.ComponentProps<typeof GuidedInterviewFlow>> = {}) {
  return {
    evidenceCount: 0,
    isSaving: false,
    missionKey: "customer_interviews_5",
    onClose: vi.fn(),
    onSubmit: vi
      .fn()
      .mockResolvedValue("Entrevista registrada. Você ganhou 10 XP."),
    startupId: 7,
    ...overrides,
  };
}

function beginRegistration() {
  fireEvent.click(screen.getByRole("button", { name: "Começar registro" }));
}

function completeFirstThreeStages() {
  fireEvent.change(screen.getByLabelText("Nome ou identificação"), {
    target: { value: "Cliente 02" },
  });
  fireEvent.change(screen.getByLabelText("Perfil da pessoa (opcional)"), {
    target: { value: "Dona de restaurante" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

  fireEvent.change(screen.getByLabelText("Em que situação isso aconteceu?"), {
    target: { value: "Percebeu a falta durante o fechamento do estoque." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

  fireEvent.click(screen.getByRole("button", { name: "Toda semana" }));
  fireEvent.click(screen.getByRole("button", { name: "Mensagens ou anotações" }));
  expect(screen.getByRole("button", { name: "Toda semana" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
}

describe("GuidedInterviewFlow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the pocket guide before the first interview", () => {
    render(<GuidedInterviewFlow {...props()} />);

    expect(
      screen.getByRole("heading", { name: "Antes da conversa" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Conte sobre a última vez que isso aconteceu.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText(/não tente vender a solução/i)).toBeInTheDocument();
    expect(screen.getByText(/você usaria meu aplicativo/i)).toBeInTheDocument();
    expect(screen.queryByText("Etapa 1 de 4")).not.toBeInTheDocument();
  });

  it("keeps the defer action before the primary action in the guide and form", () => {
    render(<GuidedInterviewFlow {...props()} />);

    const deferFromGuide = screen.getByRole("button", {
      name: "Continuar depois",
    });
    const startRegistration = screen.getByRole("button", {
      name: "Começar registro",
    });

    expect(
      deferFromGuide.compareDocumentPosition(startRegistration) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    fireEvent.click(startRegistration);

    const deferFromForm = screen.getByRole("button", {
      name: "Continuar depois",
    });
    const continueRegistration = screen.getByRole("button", {
      name: "Continuar",
    });

    expect(
      deferFromForm.compareDocumentPosition(continueRegistration) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("starts later interviews at registration and keeps the guide optional", () => {
    render(<GuidedInterviewFlow {...props({ evidenceCount: 1 })} />);

    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Consultar roteiro" }));
    expect(
      screen.getByRole("heading", { name: "Roteiro da entrevista" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar ao registro" }));
    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
  });

  it("collects four short rounds and submits the evidence card payload", async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValue("Entrevista registrada. Você ganhou 10 XP.");
    render(<GuidedInterviewFlow {...props({ onSubmit })} />);
    beginRegistration();

    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
    completeFirstThreeStages();

    fireEvent.change(screen.getByLabelText("Qual foi a principal frase ou sinal?"), {
      target: {
        value: "Precisou conferir mensagens antigas antes de comprar novamente.",
      },
    });

    expect(screen.getByRole("heading", { name: "Ficha de Evidência" })).toBeInTheDocument();
    expect(screen.getByText("Cliente 02")).toBeInTheDocument();
    expect(screen.getByText("Toda semana")).toBeInTheDocument();
    expect(screen.getByText("Mensagens ou anotações")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByRole("button", { name: "Toda semana" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByLabelText("Qual foi a principal frase ou sinal?")).toHaveValue(
      "Precisou conferir mensagens antigas antes de comprar novamente."
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar evidência" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        intervieweeName: "Cliente 02",
        intervieweeProfile: "Dona de restaurante",
        occurredOn: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        context: "Percebeu a falta durante o fechamento do estoque.",
        notes: "Precisou conferir mensagens antigas antes de comprar novamente.",
        frequency: "weekly",
        currentAlternative: "messages",
      })
    );
    expect(
      screen.getByText(/transformou uma conversa em evidência observável/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/10 XP/i)).toBeInTheDocument();
  });

  it("autosaves and restores a draft for the same interview ordinal", async () => {
    const storageKey = guidedInterviewStorageKey(7, "customer_interviews_5", 1);
    const first = render(<GuidedInterviewFlow {...props()} />);
    beginRegistration();

    fireEvent.change(screen.getByLabelText("Nome ou identificação"), {
      target: { value: "Cliente restaurado" },
    });
    await waitFor(() => expect(window.localStorage.getItem(storageKey)).toContain("Cliente restaurado"));
    first.unmount();

    render(<GuidedInterviewFlow {...props()} />);
    beginRegistration();
    expect(screen.getByLabelText("Nome ou identificação")).toHaveValue(
      "Cliente restaurado"
    );
  });

  it("ignores a corrupt saved draft and keeps working when storage throws", () => {
    const storageKey = guidedInterviewStorageKey(7, "customer_interviews_5", 1);
    window.localStorage.setItem(storageKey, "not-json");
    const removeSpy = vi.spyOn(Storage.prototype, "removeItem");
    const setSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    render(<GuidedInterviewFlow {...props()} />);
    beginRegistration();

    expect(removeSpy).toHaveBeenCalledWith(storageKey);
    fireEvent.change(screen.getByLabelText("Nome ou identificação"), {
      target: { value: "Continua funcionando" },
    });
    expect(screen.getByLabelText("Nome ou identificação")).toHaveValue(
      "Continua funcionando"
    );
    expect(setSpy).toHaveBeenCalled();
  });

  it("preserves answers and offers a retry after a submission error", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Servidor indisponível."));
    render(<GuidedInterviewFlow {...props({ onSubmit })} />);
    beginRegistration();
    completeFirstThreeStages();
    fireEvent.change(screen.getByLabelText("Qual foi a principal frase ou sinal?"), {
      target: {
        value: "Precisou conferir mensagens antigas antes de comprar novamente.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar evidência" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Servidor indisponível.");
    expect(screen.getByLabelText("Qual foi a principal frase ou sinal?")).toHaveValue(
      "Precisou conferir mensagens antigas antes de comprar novamente."
    );
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeEnabled();
  });

  it("clears autosave after success and closes from the collection action", async () => {
    const onClose = vi.fn();
    const storageKey = guidedInterviewStorageKey(7, "customer_interviews_5", 1);
    render(<GuidedInterviewFlow {...props({ onClose })} />);
    beginRegistration();
    completeFirstThreeStages();
    fireEvent.change(screen.getByLabelText("Qual foi a principal frase ou sinal?"), {
      target: {
        value: "Precisou conferir mensagens antigas antes de comprar novamente.",
      },
    });
    expect(window.localStorage.getItem(storageKey)).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Salvar evidência" }));
    await screen.findByText(/transformou uma conversa em evidência observável/i);

    expect(window.localStorage.getItem(storageKey)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver coleção" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("moves focus with stages and exposes progress as a live region", async () => {
    render(<GuidedInterviewFlow {...props()} />);
    beginRegistration();

    const heading = screen.getByRole("heading", { name: "Quem foi a pessoa?" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText("Etapa 1 de 4")).toHaveAttribute("aria-live", "polite");
  });
});
