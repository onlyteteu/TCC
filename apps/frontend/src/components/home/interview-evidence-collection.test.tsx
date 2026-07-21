import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MissionEvidenceSummary } from "@/lib/startup-types";

import { InterviewEvidenceCollection } from "./interview-evidence-collection";

const guidedEvidence: MissionEvidenceSummary = {
  context: "Percebeu a falta durante o fechamento do estoque.",
  createdAt: "2026-07-21T12:00:00Z",
  details: {
    currentAlternative: "spreadsheet",
    frequency: "weekly",
  },
  id: 31,
  intervieweeName: "Marina Costa",
  intervieweeProfile: "Dona de restaurante",
  notes: "Confere três planilhas antes de realizar uma nova compra.",
  occurredOn: "2026-07-21",
  summary: "",
  title: "",
  type: "customer_interview",
};

describe("InterviewEvidenceCollection", () => {
  it("shows progress and structured signals from guided interviews", () => {
    render(
      <InterviewEvidenceCollection evidences={[guidedEvidence]} requiredCount={5} />
    );

    expect(screen.getByText("1 de 5 entrevistas registradas")).toBeInTheDocument();
    expect(screen.getByText("Marina Costa")).toBeInTheDocument();
    expect(screen.getByText("Toda semana")).toBeInTheDocument();
    expect(screen.getByText("Planilha")).toBeInTheDocument();
    expect(
      screen.getByText("Confere três planilhas antes de realizar uma nova compra.")
    ).toBeInTheDocument();
  });

  it("keeps legacy interviews visible without inventing missing signals", () => {
    render(
      <InterviewEvidenceCollection
        evidences={[
          {
            ...guidedEvidence,
            details: {},
            id: 32,
            intervieweeName: "Entrevistado antigo",
            notes: "Relato antigo ainda válido e visível.",
          },
        ]}
        requiredCount={5}
      />
    );

    expect(screen.getByText("Entrevistado antigo")).toBeInTheDocument();
    expect(screen.getByText("Relato antigo ainda válido e visível.")).toBeInTheDocument();
    expect(screen.queryByText("Frequência não informada")).not.toBeInTheDocument();
    expect(screen.queryByText("Alternativa não informada")).not.toBeInTheDocument();
  });

  it("uses a real calendar label for the interview date", () => {
    render(
      <InterviewEvidenceCollection evidences={[guidedEvidence]} requiredCount={5} />
    );

    expect(screen.getByText("21/07/2026")).toBeInTheDocument();
    expect(screen.getByText("21/07/2026").closest("time")).toHaveAttribute(
      "datetime",
      "2026-07-21"
    );
  });
});
