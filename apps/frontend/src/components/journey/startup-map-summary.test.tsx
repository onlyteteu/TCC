import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import { StartupMapSummary } from "./startup-map-summary";

const startup: StartupSummary = {
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
};

describe("StartupMapSummary", () => {
  it("edits one field at a time and cancels with Escape", () => {
    render(<StartupMapSummary isSaving={false} onSaveField={vi.fn()} startup={startup} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar Ideia" }));
    expect(screen.getByRole("textbox", { name: "Ideia" })).toHaveValue("Uma ideia inicial");
    expect(screen.queryByRole("button", { name: "Editar Nome" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Ideia" }), { key: "Escape" });
    expect(screen.queryByRole("textbox", { name: "Ideia" })).not.toBeInTheDocument();
  });

  it("saves the selected field", async () => {
    const onSaveField = vi.fn().mockResolvedValue(undefined);
    render(
      <StartupMapSummary isSaving={false} onSaveField={onSaveField} startup={startup} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar Objetivo inicial" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Objetivo inicial" }), {
      target: { value: "Conseguir dez entrevistas" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Objetivo inicial" }));

    expect(onSaveField).toHaveBeenCalledWith("initialGoal", "Conseguir dez entrevistas");
  });
});
