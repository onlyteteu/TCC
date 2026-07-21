import { describe, expect, it } from "vitest";

import {
  buildInterviewEvidencePayload,
  canAdvanceInterview,
  createGuidedInterviewDraft,
  guidedInterviewStorageKey,
  INTERVIEW_ALTERNATIVE_OPTIONS,
  INTERVIEW_FREQUENCY_OPTIONS,
  localDateValue,
  type GuidedInterviewDraft,
  type GuidedInterviewStage,
} from "./guided-interview-model";

describe("guided interview model", () => {
  it("creates the first stage with the supplied local date", () => {
    expect(createGuidedInterviewDraft("2026-07-21")).toEqual({
      stage: 1,
      intervieweeName: "",
      intervieweeProfile: "",
      occurredOn: "2026-07-21",
      context: "",
      frequency: "",
      currentAlternative: "",
      notes: "",
    });
  });

  it("formats dates without shifting the local calendar day", () => {
    expect(localDateValue(new Date(2026, 6, 21, 23, 45))).toBe("2026-07-21");
  });

  it.each<{
    stage: GuidedInterviewStage;
    changes: Partial<GuidedInterviewDraft>;
  }>([
    {
      stage: 1,
      changes: { intervieweeName: "Cliente 01", occurredOn: "2026-07-21" },
    },
    {
      stage: 2,
      changes: { context: "Faltou produto durante o fechamento." },
    },
    {
      stage: 3,
      changes: { frequency: "weekly", currentAlternative: "spreadsheet" },
    },
    {
      stage: 4,
      changes: { notes: "Confere tres planilhas antes de realizar uma nova compra." },
    },
  ])("accepts complete stage $stage", ({ changes, stage }) => {
    const draft = { ...createGuidedInterviewDraft("2026-07-21"), ...changes };

    expect(canAdvanceInterview(draft, stage)).toBe(true);
  });

  it.each<{
    stage: GuidedInterviewStage;
    changes: Partial<GuidedInterviewDraft>;
  }>([
    { stage: 1, changes: { intervieweeName: "", occurredOn: "2026-07-21" } },
    { stage: 1, changes: { intervieweeName: "Cliente 01", occurredOn: "" } },
    { stage: 2, changes: { context: "Curto" } },
    { stage: 3, changes: { frequency: "weekly", currentAlternative: "" } },
    { stage: 3, changes: { frequency: "", currentAlternative: "manual" } },
    { stage: 4, changes: { notes: "Pouco contexto" } },
  ])("rejects incomplete stage $stage", ({ changes, stage }) => {
    const draft = { ...createGuidedInterviewDraft("2026-07-21"), ...changes };

    expect(canAdvanceInterview(draft, stage)).toBe(false);
  });

  it("builds the existing API payload plus the structured signals", () => {
    const completeDraft: GuidedInterviewDraft = {
      ...createGuidedInterviewDraft("2026-07-21"),
      intervieweeName: "  Cliente 01  ",
      intervieweeProfile: "  Dona de restaurante  ",
      context: "  Percebeu a falta durante o fechamento do estoque.  ",
      notes: "  Confere mensagens antigas antes de realizar uma nova compra.  ",
      frequency: "weekly",
      currentAlternative: "messages",
    };

    expect(buildInterviewEvidencePayload(completeDraft)).toEqual({
      intervieweeName: "Cliente 01",
      intervieweeProfile: "Dona de restaurante",
      occurredOn: "2026-07-21",
      context: "Percebeu a falta durante o fechamento do estoque.",
      notes: "Confere mensagens antigas antes de realizar uma nova compra.",
      frequency: "weekly",
      currentAlternative: "messages",
    });
  });

  it("refuses to build a payload while a stage is incomplete", () => {
    expect(() =>
      buildInterviewEvidencePayload(createGuidedInterviewDraft("2026-07-21"))
    ).toThrow("Complete todas as etapas antes de salvar a entrevista.");
  });

  it("scopes autosave by startup, mission and interview ordinal", () => {
    expect(guidedInterviewStorageKey(7, "customer_interviews_5", 2)).toBe(
      "startup-quest:interview-draft:7:customer_interviews_5:2"
    );
  });

  it("provides stable labels for evidence cards and API values", () => {
    expect(INTERVIEW_FREQUENCY_OPTIONS).toEqual([
      { value: "rarely", label: "Raramente" },
      { value: "monthly", label: "Todo mês" },
      { value: "weekly", label: "Toda semana" },
      { value: "daily", label: "Todo dia" },
    ]);
    expect(INTERVIEW_ALTERNATIVE_OPTIONS).toEqual([
      { value: "manual", label: "Processo manual" },
      { value: "spreadsheet", label: "Planilha" },
      { value: "messages", label: "Mensagens ou anotações" },
      { value: "another_tool", label: "Outra ferramenta" },
      { value: "none", label: "Não resolve hoje" },
    ]);
  });
});
