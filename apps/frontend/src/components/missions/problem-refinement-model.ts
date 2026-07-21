import type { MissionEvidenceSummary } from "@/lib/startup-types";

export type ProblemRefinementStage = 1 | 2 | 3 | 4;

export type ProblemRefinementDraft = {
  stage: ProblemRefinementStage;
  warmupAnswer: string | null;
  selectedEvidenceIds: number[];
  audience: string;
  situation: string;
  difficulty: string;
  consequence: string;
};

export function createProblemRefinementDraft(): ProblemRefinementDraft {
  return {
    stage: 1,
    warmupAnswer: null,
    selectedEvidenceIds: [],
    audience: "",
    situation: "",
    difficulty: "",
    consequence: "",
  };
}

function cleanPart(value: string, prefix?: RegExp) {
  const compact = value.trim().replace(/\s+/g, " ").replace(/[.,;:]+$/, "");
  return prefix ? compact.replace(prefix, "").trim() : compact;
}

export function buildProblemStatement(draft: ProblemRefinementDraft) {
  const audience = cleanPart(draft.audience);
  const situation = cleanPart(draft.situation, /^quando\s+/i);
  const difficulty = cleanPart(draft.difficulty, /^(?:tem|têm) dificuldade em\s+/i);
  const consequence = cleanPart(draft.consequence, /^(?:o que provoca|provocando)\s+/i);

  if (!audience || !situation || !difficulty || !consequence) return "";
  return `${audience}, quando ${situation}, tem dificuldade em ${difficulty}, o que provoca ${consequence}.`;
}

function compactExcerpt(value: string) {
  const compact = value.trim().replace(/\s+/g, " ");
  return compact.length > 180 ? `${compact.slice(0, 177).trimEnd()}...` : compact;
}

export function buildEvidenceSummary(evidences: MissionEvidenceSummary[]) {
  const entries = evidences.map((evidence, index) => {
    const label = evidence.intervieweeName || evidence.title || `Entrevista ${index + 1}`;
    const excerpt =
      compactExcerpt(evidence.notes) ||
      compactExcerpt(evidence.summary) ||
      compactExcerpt(evidence.title) ||
      compactExcerpt(evidence.context) ||
      "Relato selecionado pelo fundador.";
    return `${label}: ${excerpt}`;
  });
  const noun = evidences.length === 1 ? "entrevista sustenta" : "entrevistas sustentam";
  return `${evidences.length} ${noun} este recorte. ${entries.join(" | ")}`;
}

export function canReviewProblem(draft: ProblemRefinementDraft) {
  return draft.selectedEvidenceIds.length >= 2 && buildProblemStatement(draft).length >= 40;
}

export function problemRefinementStorageKey(startupId: number) {
  return `startup-quest:problem-refinement:${startupId}`;
}
