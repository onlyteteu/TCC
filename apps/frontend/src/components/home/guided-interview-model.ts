export type InterviewFrequency = "rarely" | "monthly" | "weekly" | "daily";

export type InterviewAlternative =
  | "manual"
  | "spreadsheet"
  | "messages"
  | "another_tool"
  | "none";

export type GuidedInterviewStage = 1 | 2 | 3 | 4;

export type GuidedInterviewDraft = {
  stage: GuidedInterviewStage;
  intervieweeName: string;
  intervieweeProfile: string;
  occurredOn: string;
  context: string;
  frequency: InterviewFrequency | "";
  currentAlternative: InterviewAlternative | "";
  notes: string;
};

export type InterviewEvidencePayload = Omit<GuidedInterviewDraft, "stage"> & {
  frequency: InterviewFrequency;
  currentAlternative: InterviewAlternative;
};

export const INTERVIEW_FREQUENCY_OPTIONS = [
  { value: "rarely", label: "Raramente" },
  { value: "monthly", label: "Todo mês" },
  { value: "weekly", label: "Toda semana" },
  { value: "daily", label: "Todo dia" },
] as const;

export const INTERVIEW_ALTERNATIVE_OPTIONS = [
  { value: "manual", label: "Processo manual" },
  { value: "spreadsheet", label: "Planilha" },
  { value: "messages", label: "Mensagens ou anotações" },
  { value: "another_tool", label: "Outra ferramenta" },
  { value: "none", label: "Não resolve hoje" },
] as const;

export function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createGuidedInterviewDraft(
  occurredOn: string
): GuidedInterviewDraft {
  return {
    stage: 1,
    intervieweeName: "",
    intervieweeProfile: "",
    occurredOn,
    context: "",
    frequency: "",
    currentAlternative: "",
    notes: "",
  };
}

export function canAdvanceInterview(
  draft: GuidedInterviewDraft,
  stage: GuidedInterviewStage
) {
  switch (stage) {
    case 1:
      return Boolean(draft.intervieweeName.trim() && draft.occurredOn);
    case 2:
      return draft.context.trim().length >= 10;
    case 3:
      return Boolean(draft.frequency && draft.currentAlternative);
    case 4:
      return draft.notes.trim().length >= 20;
  }
}

export function buildInterviewEvidencePayload(
  draft: GuidedInterviewDraft
): InterviewEvidencePayload {
  const isComplete = ([1, 2, 3, 4] as const).every((stage) =>
    canAdvanceInterview(draft, stage)
  );

  if (!isComplete || !draft.frequency || !draft.currentAlternative) {
    throw new Error("Complete todas as etapas antes de salvar a entrevista.");
  }

  return {
    intervieweeName: draft.intervieweeName.trim(),
    intervieweeProfile: draft.intervieweeProfile.trim(),
    occurredOn: draft.occurredOn,
    context: draft.context.trim(),
    frequency: draft.frequency,
    currentAlternative: draft.currentAlternative,
    notes: draft.notes.trim(),
  };
}

export function guidedInterviewStorageKey(
  startupId: number,
  missionKey: string,
  ordinal: number
) {
  return `startup-quest:interview-draft:${startupId}:${missionKey}:${ordinal}`;
}
