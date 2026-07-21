"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  MissionDetailPayload,
  MissionDetailSummary,
  StartupSummary,
} from "@/lib/startup-types";
import { startupHomeHref } from "@/lib/startup-navigation";

import {
  buildEvidenceSummary,
  buildProblemStatement,
  canReviewProblem,
  createProblemRefinementDraft,
  type ProblemRefinementDraft,
  problemRefinementStorageKey,
} from "./problem-refinement-model";
import styles from "./problem-refinement-challenge.module.css";

const WARMUP_OPTIONS = [
  {
    id: "opinion",
    label: "Empresas precisam de uma plataforma mais moderna.",
    feedback: "Isso ainda é uma opinião: não mostra quem observou o problema nem o que aconteceu.",
  },
  {
    id: "solution",
    label: "Restaurantes precisam de um aplicativo de estoque.",
    feedback: "Isso já aponta uma solução. Primeiro precisamos comprovar o problema.",
  },
  {
    id: "observed",
    label:
      "Restaurantes pequenos perdem margem quando compram ingredientes sem saber o que ainda têm em estoque.",
    feedback: "Insight liberado: há público, situação e consequência observável.",
  },
] as const;

type ProblemRefinementChallengeProps = {
  celebration?: MissionDetailPayload["celebration"];
  isSubmitting: boolean;
  mission: MissionDetailSummary;
  onSubmit: (payload: { problemStatement: string; evidenceSummary: string }) => void | Promise<void>;
  startup: StartupSummary;
  startupId: number;
  submissionError: string | null;
};

function readStoredDraft(
  startupId: number,
  sourceEvidences: MissionDetailSummary["sourceEvidences"]
): ProblemRefinementDraft | null {
  try {
    const raw = window.localStorage.getItem(problemRefinementStorageKey(startupId));
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<ProblemRefinementDraft>;
    const stage = Number(stored.stage);
    if (![1, 2, 3, 4].includes(stage)) return null;
    const availableEvidenceIds = new Set(sourceEvidences.map((evidence) => evidence.id));
    const selectedEvidenceIds = Array.isArray(stored.selectedEvidenceIds)
      ? stored.selectedEvidenceIds.filter(
          (id): id is number => Number.isInteger(id) && availableEvidenceIds.has(id)
        )
      : [];
    return {
      ...createProblemRefinementDraft(),
      stage: stage > 2 && selectedEvidenceIds.length < 2 ? 2 : (stage as ProblemRefinementDraft["stage"]),
      warmupAnswer: typeof stored.warmupAnswer === "string" ? stored.warmupAnswer : null,
      selectedEvidenceIds,
      audience: typeof stored.audience === "string" ? stored.audience : "",
      situation: typeof stored.situation === "string" ? stored.situation : "",
      difficulty: typeof stored.difficulty === "string" ? stored.difficulty : "",
      consequence: typeof stored.consequence === "string" ? stored.consequence : "",
    };
  } catch {
    return null;
  }
}

function removeStoredDraft(startupId: number) {
  try {
    window.localStorage.removeItem(problemRefinementStorageKey(startupId));
  } catch {
    // Autosave is best-effort and must never block the mission.
  }
}

function writeStoredDraft(startupId: number, draft: ProblemRefinementDraft) {
  try {
    window.localStorage.setItem(problemRefinementStorageKey(startupId), JSON.stringify(draft));
  } catch {
    // Autosave is best-effort and must never block the mission.
  }
}

export function ProblemRefinementChallenge({
  celebration,
  isSubmitting,
  mission,
  onSubmit,
  startup,
  startupId,
  submissionError,
}: ProblemRefinementChallengeProps) {
  const [draft, setDraft] = useState(createProblemRefinementDraft);
  const autosaveReady = useRef(false);
  const hydratedStartupId = useRef<number | null>(null);
  const focusStageAfterChange = useRef(false);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const sourceEvidences = useMemo(
    () => mission.sourceEvidences.slice(0, 5),
    [mission.sourceEvidences]
  );
  const selectedWarmup = WARMUP_OPTIONS.find((option) => option.id === draft.warmupAnswer);
  const warmupPassed = draft.warmupAnswer === "observed";
  const selectedEvidences = sourceEvidences.filter((evidence) =>
    draft.selectedEvidenceIds.includes(evidence.id)
  );
  const problemStatement = buildProblemStatement(draft);

  useEffect(() => {
    autosaveReady.current = false;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      if (celebration) {
        removeStoredDraft(startupId);
        hydratedStartupId.current = startupId;
        autosaveReady.current = true;
        return;
      }
      const stored = readStoredDraft(startupId, sourceEvidences);
      hydratedStartupId.current = startupId;
      autosaveReady.current = true;
      setDraft(stored ?? createProblemRefinementDraft());
    });
    return () => {
      active = false;
    };
  }, [celebration, sourceEvidences, startupId]);

  useEffect(() => {
    if (!autosaveReady.current || hydratedStartupId.current !== startupId) return;
    if (celebration) {
      removeStoredDraft(startupId);
      return;
    }
    writeStoredDraft(startupId, draft);
  }, [celebration, draft, startupId]);

  useEffect(() => {
    if (!focusStageAfterChange.current) return;
    focusStageAfterChange.current = false;
    stageHeadingRef.current?.focus();
  }, [draft.stage]);

  const setStage = (stage: 1 | 2 | 3 | 4) => {
    focusStageAfterChange.current = true;
    setDraft((current) => ({ ...current, stage }));
  };

  const toggleEvidence = (evidenceId: number) => {
    setDraft((current) => {
      const selected = current.selectedEvidenceIds.includes(evidenceId);
      return {
        ...current,
        selectedEvidenceIds: selected
          ? current.selectedEvidenceIds.filter((id) => id !== evidenceId)
          : [...current.selectedEvidenceIds, evidenceId],
      };
    });
  };

  const updateField = (
    field: "audience" | "situation" | "difficulty" | "consequence",
    value: string
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const submitDiscovery = () => {
    if (!canReviewProblem(draft, selectedEvidences.length)) return;
    void onSubmit({
      problemStatement,
      evidenceSummary: buildEvidenceSummary(selectedEvidences),
    });
  };

  return (
    <section className={styles.challenge} aria-labelledby="decision-challenge-title">
      <div aria-hidden="true" className={styles.ritualHalo} />
      <header className={styles.ritualHeader}>
        <div>
          <span className={styles.eyebrow}>Desafio de descoberta</span>
          <h1 id="decision-challenge-title">{mission.title}</h1>
          <p>Transforme relatos reais em uma decisão clara, uma rodada por vez.</p>
        </div>
        <div className={styles.reward} aria-label={`Recompensa: ${mission.xpReward} XP`}>
          <small>Recompensa</small>
          <strong>+{mission.xpReward} XP</strong>
        </div>
      </header>

      <div className={styles.progressRow}>
        <span>{draft.stage} de 4</span>
        <span aria-live="polite" className="sr-only">
          Rodada {draft.stage} de 4
        </span>
        <ol aria-label="Progresso do desafio">
          {[1, 2, 3, 4].map((step) => (
            <li
              aria-current={step === draft.stage ? "step" : undefined}
              className={step <= draft.stage ? styles.progressActive : undefined}
              key={step}
            >
              <span className="sr-only">Rodada {step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.stage} key={draft.stage}>
        {draft.stage === 1 ? (
          <>
            <div className={styles.stageHeading}>
              <span>Reconhecer</span>
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                Qual formulação descreve um problema observável?
              </h2>
              <p>Escolha uma opção. Errar aqui faz parte do treino.</p>
            </div>
            <div className={styles.choiceList}>
              {WARMUP_OPTIONS.map((option) => (
                <button
                  aria-pressed={draft.warmupAnswer === option.id}
                  className={styles.choice}
                  key={option.id}
                  onClick={() =>
                    setDraft((current) => ({ ...current, warmupAnswer: option.id }))
                  }
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedWarmup ? (
              <p
                className={warmupPassed ? styles.feedbackSuccess : styles.feedbackHint}
                role="status"
              >
                {selectedWarmup.feedback}
              </p>
            ) : null}
            <div className={styles.actions}>
              <button className={styles.secondaryAction} onClick={() => setStage(2)} type="button">
                Ir direto para minhas evidências
              </button>
              <button
                className={styles.primaryAction}
                disabled={!warmupPassed}
                onClick={() => setStage(2)}
                type="button"
              >
                Continuar
              </button>
            </div>
          </>
        ) : draft.stage === 2 ? (
          <>
            <div className={styles.stageHeading}>
              <span>Conectar</span>
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                Quais relatos sustentam melhor o padrão?
              </h2>
              <p>Escolha pelo menos duas entrevistas para formar sua base de evidência.</p>
            </div>
            {sourceEvidences.length ? (
              <>
                <div className={styles.evidenceMeta}>
                  <strong>
                    {selectedEvidences.length <= 2
                      ? `${selectedEvidences.length} de 2 sinais conectados`
                      : `${selectedEvidences.length} sinais conectados`}
                  </strong>
                  <span>Selecione os relatos mais específicos, não apenas os mais longos.</span>
                </div>
                <div className={styles.evidenceGrid}>
                  {sourceEvidences.map((evidence) => {
                    const selected = draft.selectedEvidenceIds.includes(evidence.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={styles.evidenceCard}
                        key={evidence.id}
                        onClick={() => toggleEvidence(evidence.id)}
                        type="button"
                      >
                        <span className={styles.evidenceCheck} aria-hidden="true">
                          {selected ? "✓" : "+"}
                        </span>
                        <strong>{evidence.intervieweeName || evidence.title}</strong>
                        <small>{evidence.intervieweeProfile || evidence.context}</small>
                        <span className={styles.evidenceExcerpt}>
                          {evidence.notes || evidence.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedEvidences.length >= 2 ? (
                  <p className={styles.feedbackSuccess} role="status">
                    Evidências conectadas. Você já tem base para formular o problema.
                  </p>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyEvidence} role="alert">
                <strong>As entrevistas ainda não chegaram a este desafio.</strong>
                <p>Volte à Home, confira os cinco registros e tente abrir a missão novamente.</p>
                <Link href={startupHomeHref(startupId)}>Revisar entrevistas</Link>
              </div>
            )}
            <div className={styles.actions}>
              <button className={styles.secondaryAction} onClick={() => setStage(1)} type="button">
                Voltar
              </button>
              <button
                className={styles.primaryAction}
                disabled={selectedEvidences.length < 2}
                onClick={() => setStage(3)}
                type="button"
              >
                Montar meu problema
              </button>
            </div>
          </>
        ) : draft.stage === 3 ? (
          <>
            <div className={styles.stageHeading}>
              <span>Construir</span>
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                Monte o problema em quatro partes curtas
              </h2>
              <p>Você escreve os blocos; a Carta organiza a frase em tempo real.</p>
            </div>

            <aside className={styles.currentHypothesis}>
              <span>Sua hipótese inicial</span>
              <strong>{startup.audience || "Público ainda amplo"}</strong>
              <p>{startup.problem || "Problema ainda não registrado"}</p>
            </aside>

            <div className={styles.composerGrid}>
              <label>
                <span>Quem enfrenta esse problema?</span>
                <input
                  autoComplete="off"
                  maxLength={120}
                  onChange={(event) => updateField("audience", event.target.value)}
                  placeholder="Ex.: restaurantes pequenos"
                  value={draft.audience}
                />
              </label>
              <label>
                <span>Em qual situação isso acontece?</span>
                <input
                  autoComplete="off"
                  maxLength={140}
                  onChange={(event) => updateField("situation", event.target.value)}
                  placeholder="Ex.: no controle semanal do estoque"
                  value={draft.situation}
                />
              </label>
              <label>
                <span>Qual dificuldade aparece?</span>
                <input
                  autoComplete="off"
                  maxLength={140}
                  onChange={(event) => updateField("difficulty", event.target.value)}
                  placeholder="Ex.: saber o saldo real"
                  value={draft.difficulty}
                />
              </label>
              <label>
                <span>Qual consequência pode ser observada?</span>
                <input
                  autoComplete="off"
                  maxLength={140}
                  onChange={(event) => updateField("consequence", event.target.value)}
                  placeholder="Ex.: compras duplicadas e perda de margem"
                  value={draft.consequence}
                />
              </label>
            </div>

            <div aria-label="Prévia do problema" className={styles.livePreview} role="status">
              <span>Prévia ao vivo</span>
              <p>
                {problemStatement ||
                  "Complete os quatro blocos para revelar a formulação do problema."}
              </p>
            </div>

            <div className={styles.qualityChecks} aria-label="Perguntas de revisão">
              <span>Está claro quem enfrenta o problema?</span>
              <span>A situação descreve um momento concreto?</span>
              <span>A dificuldade está descrita sem antecipar uma solução?</span>
              <span>A consequência pode ser observada?</span>
            </div>

            <div className={styles.actions}>
              <button className={styles.secondaryAction} onClick={() => setStage(2)} type="button">
                Voltar
              </button>
              <button
                className={styles.primaryAction}
                disabled={!canReviewProblem(draft, selectedEvidences.length)}
                onClick={() => setStage(4)}
                type="button"
              >
                Revisar descoberta
              </button>
            </div>
          </>
        ) : draft.stage === 4 ? (
          <>
            <div className={styles.stageHeading}>
              <span>Consolidar</span>
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                Sua Carta da Descoberta
              </h2>
              <p>Este é o artefato que passa a fazer parte da memória da startup.</p>
            </div>

            <article className={styles.discoveryCard}>
              <div className={styles.cardTopline}>
                <span>Problema observado</span>
                <strong>{selectedEvidences.length} entrevistas conectadas</strong>
              </div>
              <blockquote>{problemStatement}</blockquote>
              <div className={styles.evidenceNames}>
                {selectedEvidences.map((evidence) => (
                  <span key={evidence.id}>{evidence.intervieweeName || evidence.title}</span>
                ))}
              </div>
              <footer>
                <small>Competência praticada</small>
                <strong>Transformar relatos em uma hipótese testável</strong>
              </footer>
            </article>

            {celebration ? (
              <div className={styles.celebration} role="status">
                <span>Competência conquistada</span>
                <strong>Você transformou relatos em um problema observável</strong>
                <p>
                  {celebration.title} · +{celebration.xpAwarded} XP · {celebration.unlocked}
                </p>
              </div>
            ) : null}
            {submissionError ? (
              <p className={styles.submissionError} role="alert">
                {submissionError}
              </p>
            ) : null}

            <div className={styles.actions}>
              <button
                className={styles.secondaryAction}
                disabled={isSubmitting || Boolean(celebration)}
                onClick={() => setStage(3)}
                type="button"
              >
                Ajustar resposta
              </button>
              <button
                aria-busy={isSubmitting}
                className={styles.primaryAction}
                disabled={isSubmitting || Boolean(celebration)}
                onClick={submitDiscovery}
                type="button"
              >
                {isSubmitting ? "Registrando..." : celebration ? "Descoberta registrada" : "Registrar descoberta"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
