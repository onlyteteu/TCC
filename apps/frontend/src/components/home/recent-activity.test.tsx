import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ActivitySummary } from "@/lib/startup-types";

import { RecentActivity } from "./recent-activity";

const activities: ActivitySummary[] = [
  {
    description: "Conversa com Cliente 01",
    id: 1,
    kind: "evidence_recorded",
    kindLabel: "Entrevista registrada",
    metadata: {},
    occurredAt: "2026-07-14T10:00:00Z",
    xpAwarded: 10,
  },
];

describe("RecentActivity", () => {
  it("shows a compact history of real work", () => {
    render(<RecentActivity activities={activities} />);

    expect(screen.getByRole("heading", { name: "Atividade recente" })).toBeInTheDocument();
    expect(screen.getByText("Entrevista registrada")).toBeInTheDocument();
    expect(screen.getByText("Conversa com Cliente 01")).toBeInTheDocument();
    expect(screen.getByText("+10 XP")).toBeInTheDocument();
  });

  it("teaches which action creates the first record", () => {
    render(<RecentActivity activities={[]} />);

    expect(
      screen.getByText(
        "Sua primeira evidência aparecerá aqui depois de registrar uma entrevista ou concluir uma etapa."
      )
    ).toBeInTheDocument();
  });
});
