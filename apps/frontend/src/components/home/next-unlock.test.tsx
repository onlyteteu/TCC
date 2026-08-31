import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TodayPayload } from "@/lib/startup-types";

import { NextUnlock } from "./next-unlock";

function unlock(available: boolean): TodayPayload["nextUnlock"] {
  return {
    available,
    description: "Disponível depois da missão atual.",
    key: "value-proposition",
    title: "Proposta de valor",
  };
}

describe("NextUnlock", () => {
  it.each([
    [false, "Bloqueado"],
    [true, "Disponível"],
  ])("explains the unlock state when available is %s", (available, label) => {
    render(<NextUnlock unlock={unlock(available)} />);

    expect(screen.getByRole("heading", { name: "Próximo desbloqueio" })).toBeInTheDocument();
    expect(screen.getByText("Proposta de valor")).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("Disponível depois da missão atual.")).toBeInTheDocument();
  });
});
