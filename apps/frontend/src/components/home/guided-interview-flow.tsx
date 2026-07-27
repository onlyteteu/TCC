"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  type InterviewAlternative,
  type InterviewEvidencePayload,
  type InterviewFrequency,
} from "./guided-interview-model";
import styles from "./guided-interview-flow.module.css";

const GUIDE_QUESTIONS = [
  "Conte sobre a última vez que isso aconteceu.",
  "O que tornou esse momento difícil?",
  "Com que frequência algo parecido acontece?",
  "Como você resolve isso hoje?",
  "O que acontece quando você não consegue resolver?",
] as const;

type GuidedInterviewFlowProps = {
  evidenceCount: number;
  isSaving: boolean;
  missionKey: string;
  onClose: () => void;
  onSubmit: (payload: InterviewEvidencePayload) => Promise<string>;
  startupId: number;
};

type FlowView = "guide" | "form" | "success";

function isGuidedInterviewDraft(value: unknown): value is GuidedInterviewDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;
  const stageIsValid = [1, 2, 3, 4].includes(Number(draft.stage));
  const stringFields = [
    "intervieweeName",
    "intervieweeProfile",
    "occurredOn",
    "context",
    "notes",
  ];
  const stringsAreValid = stringFields.every(
    (field) => typeof draft[field] === "string"
  );
  const frequencyIsValid = [
    "",
    ...INTERVIEW_FREQUENCY_OPTIONS.map((option) => option.value),
  ].includes(draft.frequency as InterviewFrequency | "");
  const alternativeIsValid = [
    "",
    ...INTERVIEW_ALTERNATIVE_OPTIONS.map((option) => option.value),
  ].includes(draft.currentAlternative as InterviewAlternative | "");

  return stageIsValid && stringsAreValid && frequencyIsValid && alternativeIsValid;
}

function readSavedDraft(storageKey: string) {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return null;
    }
    const parsed = JSON.parse(saved) as unknown;
    if (isGuidedInterviewDraft(parsed)) {
      return parsed;
    }
    window.localStorage.removeItem(storageKey);
  } catch {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Storage is best effort; the interview remains usable without it.
    }
  }
  return null;
}

export function GuidedInterviewFlow({
  evidenceCount,
  isSaving,
  missionKey,
  onClose,
  onSubmit,
  startupId,
}: GuidedInterviewFlowProps) {
  const [storageKey] = useState(() =>
    guidedInterviewStorageKey(startupId, missionKey, evidenceCount + 1)
  );
  const [draft, setDraft] = useState<GuidedInterviewDraft>(() =>
    readSavedDraft(storageKey) ?? createGuidedInterviewDraft(localDateValue())
  );
  const [view, setView] = useState<FlowView>(
    evidenceCount === 0 ? "guide" : "form"
  );
  const [guideOpenedFromForm, setGuideOpenedFromForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState("");
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);

  const frequencyLabel = useMemo(
    () =>
      INTERVIEW_FREQUENCY_OPTIONS.find(
        (option) => option.value === draft.frequency
      )?.label,
    [draft.frequency]
  );
  const alternativeLabel = useMemo(
    () =>
      INTERVIEW_ALTERNATIVE_OPTIONS.find(
        (option) => option.value === draft.currentAlternative
      )?.label,
    [draft.currentAlternative]
  );

  useEffect(() => {
    if (view === "success") {
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Storage is best effort; state in memory remains authoritative.
    }
  }, [draft, storageKey, view]);

  useEffect(() => {
    if (view === "form") {
      stageHeadingRef.current?.focus();
    }
  }, [draft.stage, view]);

  function updateDraft(changes: Partial<GuidedInterviewDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
    setError(null);
  }

  function openGuide() {
    setGuideOpenedFromForm(true);
    setView("guide");
  }

  function leaveGuide() {
    setGuideOpenedFromForm(true);
    setView("form");
  }

  function advance() {
    if (!canAdvanceInterview(draft, draft.stage) || draft.stage === 4) {
      return;
    }
    updateDraft({ stage: (draft.stage + 1) as GuidedInterviewStage });
  }

  function goBack() {
    if (draft.stage === 1) {
      return;
    }
    updateDraft({ stage: (draft.stage - 1) as GuidedInterviewStage });
  }

  async function saveEvidence() {
    setError(null);
    try {
      const message = await onSubmit(buildInterviewEvidencePayload(draft));
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // A successful server save must not depend on local storage cleanup.
      }
      setServerMessage(message);
      setView("success");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "A entrevista não foi registrada. Tente novamente."
      );
    }
  }

  if (view === "guide") {
    const optionalGuide = evidenceCount > 0 || guideOpenedFromForm;
    return (
      <section className={styles.guide}>
        <span className={styles.eyebrow}>Guia de bolso</span>
        <h3>{optionalGuide ? "Roteiro da entrevista" : "Antes da conversa"}</h3>
        <p className={styles.guideLead}>
          Busque uma situação real do passado. Escute mais do que fala e não tente
          vender a solução.
        </p>
        <ol className={styles.questionList}>
          {GUIDE_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <aside className={styles.avoidCard}>
          <strong>Evite induzir</strong>
          <p>
            Em vez de “Você usaria meu aplicativo?”, pergunte pelo que a pessoa já
            fez, pela frequência, pela consequência e pela alternativa atual.
          </p>
        </aside>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} onClick={onClose} type="button">
            Continuar depois
          </button>
          <button className={styles.primaryButton} onClick={leaveGuide} type="button">
            {optionalGuide ? "Voltar ao registro" : "Começar registro"}
          </button>
        </div>
      </section>
    );
  }

  if (view === "success") {
    return (
      <section aria-live="polite" className={styles.success} role="status">
        <span aria-hidden="true" className={styles.successMark}>
          ✓
        </span>
        <div>
          <strong>Você transformou uma conversa em evidência observável.</strong>
          <p>
            Você praticou ouvir sem induzir e reconhecer sinais reais. {serverMessage}
          </p>
        </div>
        <button className={styles.primaryButton} onClick={onClose} type="button">
          Ver coleção
        </button>
      </section>
    );
  }

  return (
    <section className={styles.flow}>
      <div className={styles.progressHeader}>
        <p aria-live="polite">Etapa {draft.stage} de 4</p>
        <button className={styles.guideButton} onClick={openGuide} type="button">
          Consultar roteiro
        </button>
      </div>
      <div
        aria-label={`${draft.stage} de 4 etapas concluídas`}
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={draft.stage}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${draft.stage * 25}%` }} />
      </div>

      {draft.stage === 1 ? (
        <div className={styles.stage}>
          <h3 ref={stageHeadingRef} tabIndex={-1}>Quem foi a pessoa?</h3>
          <p>Use um nome ou identificação que faça sentido para você.</p>
          <div className={styles.fieldGrid}>
            <label>
              <span>Nome ou identificação</span>
              <input
                disabled={isSaving}
                maxLength={120}
                onChange={(event) => updateDraft({ intervieweeName: event.target.value })}
                placeholder="Ex.: Cliente 02 ou Marina"
                value={draft.intervieweeName}
              />
            </label>
            <label>
              <span>Perfil da pessoa (opcional)</span>
              <input
                disabled={isSaving}
                maxLength={180}
                onChange={(event) => updateDraft({ intervieweeProfile: event.target.value })}
                placeholder="Ex.: dona de restaurante pequeno"
                value={draft.intervieweeProfile}
              />
            </label>
            <label>
              <span>Data da conversa</span>
              <input
                disabled={isSaving}
                max={localDateValue()}
                onChange={(event) => updateDraft({ occurredOn: event.target.value })}
                type="date"
                value={draft.occurredOn}
              />
            </label>
          </div>
        </div>
      ) : null}

      {draft.stage === 2 ? (
        <div className={styles.stage}>
          <h3 ref={stageHeadingRef} tabIndex={-1}>Qual foi a situação real?</h3>
          <p>Registre o momento concreto, sem explicar a sua solução.</p>
          <label className={styles.fullField}>
            <span>Em que situação isso aconteceu?</span>
            <input
              aria-label="Em que situação isso aconteceu?"
              disabled={isSaving}
              maxLength={300}
              onChange={(event) => updateDraft({ context: event.target.value })}
              placeholder="Ex.: percebeu a falta durante o fechamento do estoque"
              value={draft.context}
            />
            <small>Uma frase curta já basta.</small>
          </label>
        </div>
      ) : null}

      {draft.stage === 3 ? (
        <div className={styles.stage}>
          <h3 ref={stageHeadingRef} tabIndex={-1}>Quais sinais apareceram?</h3>
          <p>Escolha o que melhor representa o relato, sem tentar deixá-lo mais forte.</p>
          <fieldset className={styles.optionGroup}>
            <legend>Com que frequência acontece?</legend>
            <div className={styles.optionGrid}>
              {INTERVIEW_FREQUENCY_OPTIONS.map((option) => (
                <button
                  aria-pressed={draft.frequency === option.value}
                  className={styles.optionButton}
                  disabled={isSaving}
                  key={option.value}
                  onClick={() => updateDraft({ frequency: option.value })}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.optionGroup}>
            <legend>Como resolve hoje?</legend>
            <div className={styles.optionGrid}>
              {INTERVIEW_ALTERNATIVE_OPTIONS.map((option) => (
                <button
                  aria-pressed={draft.currentAlternative === option.value}
                  className={styles.optionButton}
                  disabled={isSaving}
                  key={option.value}
                  onClick={() => updateDraft({ currentAlternative: option.value })}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}

      {draft.stage === 4 ? (
        <div className={styles.stage}>
          <h3 ref={stageHeadingRef} tabIndex={-1}>O que vale guardar?</h3>
          <p>Escolha a frase, consequência ou observação que mais ensina.</p>
          <label className={styles.fullField}>
            <span>Qual foi a principal frase ou sinal?</span>
            <input
              disabled={isSaving}
              onChange={(event) => updateDraft({ notes: event.target.value })}
              placeholder="Ex.: confere mensagens antigas antes de comprar novamente"
              value={draft.notes}
            />
          </label>
          <article className={styles.preview}>
            <span>Prévia</span>
            <h4>Ficha de Evidência</h4>
            <strong>{draft.intervieweeName}</strong>
            {draft.intervieweeProfile ? <small>{draft.intervieweeProfile}</small> : null}
            <p>{draft.context}</p>
            <div className={styles.chips}>
              {frequencyLabel ? <span>{frequencyLabel}</span> : null}
              {alternativeLabel ? <span>{alternativeLabel}</span> : null}
            </div>
            {draft.notes ? <blockquote>“{draft.notes}”</blockquote> : null}
          </article>
        </div>
      ) : null}

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          disabled={isSaving}
          onClick={onClose}
          type="button"
        >
          Continuar depois
        </button>
        <div className={styles.navigationActions}>
          {draft.stage > 1 ? (
            <button
              className={styles.secondaryButton}
              disabled={isSaving}
              onClick={goBack}
              type="button"
            >
              Voltar
            </button>
          ) : null}
          {draft.stage < 4 ? (
            <button
              className={styles.primaryButton}
              disabled={isSaving || !canAdvanceInterview(draft, draft.stage)}
              onClick={advance}
              type="button"
            >
              Continuar
            </button>
          ) : (
            <button
              className={styles.primaryButton}
              disabled={isSaving || !canAdvanceInterview(draft, 4)}
              onClick={saveEvidence}
              type="button"
            >
              {isSaving ? "Salvando evidência..." : error ? "Tentar novamente" : "Salvar evidência"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
