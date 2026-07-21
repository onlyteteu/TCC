import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { JourneyMilestoneSummary } from "@/lib/startup-types";

import { JourneyMilestonePanel } from "./journey-milestone-panel";

const milestone: JourneyMilestoneSummary = {
  key: "value",
  chapterKey: "proposal",
  title: "Proposta de valor",
  description: "Transforme problema e público em uma promessa clara.",
  alreadyBuilt: [],
  nextUnlock: { title: "Diferenciais", description: "Compare as alternativas atuais." },
  mission: {
    key: "reframe_value_proposition",
    title: "Reformule a proposta de valor",
    objective: "Conectar público, problema e resultado.",
    href: "/painel/startup/7/missoes/reframe_value_proposition",
    estimatedMinutes: 15,
    xpReward: 100,
    status: "available",
    canContinue: true,
  },
  message: null,
};

describe("JourneyMilestonePanel", () => {
  it("shows the real mission duration, reward and continuation link", () => {
    render(<JourneyMilestonePanel milestone={milestone} />);

    expect(screen.getByRole("link", { name: "Continuar missão" })).toHaveAttribute(
      "href",
      "/painel/startup/7/missoes/reframe_value_proposition"
    );
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("+100 XP")).toBeInTheDocument();
  });

  it("does not invent a CTA or reward when the milestone has no mission", () => {
    render(
      <JourneyMilestonePanel
        milestone={{
          ...milestone,
          key: "validation",
          title: "Validação inicial",
          mission: null,
          message: "A missão deste marco ainda não foi liberada.",
        }}
      />
    );

    expect(screen.getByText("A missão deste marco ainda não foi liberada.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
  });
});
