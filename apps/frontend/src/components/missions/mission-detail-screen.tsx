"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ProductIcon } from "@/components/product-icon";
import type { AuthErrorPayload } from "@/lib/auth-types";
import {
  missionExecutionHref,
  startupHomeHref,
  startupMissionsHref,
} from "@/lib/startup-navigation";
import type {
  MissionActionType,
  MissionDetailPayload,
  MissionEvidenceSummary,
} from "@/lib/startup-types";

import styles from "./mission-detail-screen.module.css";

type StructuredActionType = Exclude<MissionActionType, "interviews">;
type SubmissionDraft = Record<string, string>;

type MissionDetailScreenProps = {
  missionKey: string;
  onWorkspaceChanged?: () => unknown;
  startupId: number;
};

type FieldErrors = Record<string, string[]>;

const LOAD_ERROR = "Nao foi possivel carregar esta missao agora.";
const NOT_FOUND_ERROR = "Esta missao nao existe ou voce nao pode acessa-la.";
const SUBMISSION_ERROR = "Nao foi possivel registrar o entregavel da missao.";

const initialDrafts: Record<StructuredActionType, SubmissionDraft> = {
  problem_refinement: { problemStatement: "", evidenceSummary: "" },
  audience_validation: { audienceStatement: "", observedSignals: "", decision: "" },
  value_proposition: { valueProposition: "", rationale: "" },
  alternatives_map: { alternatives: "", limitations: "", opportunity: "" },
};

const detailLabels: Record<string, string> = {
  problemStatement: "Problema refinado",
  evidenceSummary: "Evidencias que sustentam o problema",
  audienceStatement: "Publico prioritario",
  observedSignals: "Sinais observados",
  decision: "Decisao",
  valueProposition: "Proposta de valor",
  rationale: "Por que esta proposta faz sentido",
  alternatives: "Alternativas atuais",
  limitations: "Limitacoes observadas",
  opportunity: "Oportunidade",
};

function displayDetailValue(key: string, value: string) {
  if (key !== "decision") return value;
  if (value === "keep") return "Manter";
  if (value === "adjust") return "Ajustar";
  return value;
}

function missionStepStatusLabel(status: MissionDetailPayload["mission"]["steps"][number]["status"]) {
  if (status === "completed") return "Concluida";
  if (status === "locked") return "Bloqueada";
  if (status === "current") return "Atual";
  return "Disponivel";
}

function MissionDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando detalhes da missao"
      className={styles.skeletonPage}
      role="status"
    >
      <span className={styles.srOnly}>Carregando detalhes da missao.</span>
      <span className={styles.skeletonBack} />
      <span className={styles.skeletonTitle} />
      <span className={styles.skeletonCopy} />
      <div className={styles.skeletonBody}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

type TextareaControlProps = {
  disabled: boolean;
  draft: SubmissionDraft;
  field: string;
  fieldErrors: FieldErrors;
  label: string;
  minLength: number;
  onChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => void;
  rows?: number;
};

function TextareaControl({
  disabled,
  draft,
  field,
  fieldErrors,
  label,
  minLength,
  onChange,
  rows = 5,
}: TextareaControlProps) {
  const error = fieldErrors[field]?.[0];
  const errorId = `mission-${field}-error`;
  const hintId = `mission-${field}-hint`;

  return (
    <div className={styles.field}>
      <label htmlFor={`mission-${field}`}>{label}</label>
      <textarea
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        id={`mission-${field}`}
        minLength={minLength}
        name={field}
        onChange={onChange}
        required
        rows={rows}
        value={draft[field] ?? ""}
      />
      <span className={styles.fieldHint} id={hintId}>
        Minimo de {minLength} caracteres.
      </span>
      {error ? (
        <span className={styles.fieldError} id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type StructuredFieldsProps = {
  actionType: StructuredActionType;
  disabled: boolean;
  draft: SubmissionDraft;
  fieldErrors: FieldErrors;
  onChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => void;
};

function StructuredMissionFields({
  actionType,
  disabled,
  draft,
  fieldErrors,
  onChange,
}: StructuredFieldsProps) {
  if (actionType === "problem_refinement") {
    return (
      <>
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="problemStatement"
          fieldErrors={fieldErrors}
          label="Problema refinado"
          minLength={40}
          onChange={onChange}
        />
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="evidenceSummary"
          fieldErrors={fieldErrors}
          label="Evidencias que sustentam o problema"
          minLength={40}
          onChange={onChange}
        />
      </>
    );
  }

  if (actionType === "audience_validation") {
    const error = fieldErrors.decision?.[0];
    const errorId = "mission-decision-error";

    return (
      <>
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="audienceStatement"
          fieldErrors={fieldErrors}
          label="Publico prioritario"
          minLength={30}
          onChange={onChange}
        />
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="observedSignals"
          fieldErrors={fieldErrors}
          label="Sinais observados"
          minLength={40}
          onChange={onChange}
        />
        <div className={styles.field}>
          <label htmlFor="mission-decision">Decisao</label>
          <select
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            id="mission-decision"
            name="decision"
            onChange={onChange}
            required
            value={draft.decision ?? ""}
          >
            <option value="">Selecione uma decisao</option>
            <option value="keep">Manter</option>
            <option value="adjust">Ajustar</option>
          </select>
          {error ? (
            <span className={styles.fieldError} id={errorId} role="alert">
              {error}
            </span>
          ) : null}
        </div>
      </>
    );
  }

  if (actionType === "value_proposition") {
    return (
      <>
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="valueProposition"
          fieldErrors={fieldErrors}
          label="Proposta de valor"
          minLength={30}
          onChange={onChange}
        />
        <TextareaControl
          disabled={disabled}
          draft={draft}
          field="rationale"
          fieldErrors={fieldErrors}
          label="Por que esta proposta faz sentido"
          minLength={30}
          onChange={onChange}
        />
      </>
    );
  }

  return (
    <>
      <TextareaControl
        disabled={disabled}
        draft={draft}
        field="alternatives"
        fieldErrors={fieldErrors}
        label="Alternativas atuais"
        minLength={40}
        onChange={onChange}
      />
      <TextareaControl
        disabled={disabled}
        draft={draft}
        field="limitations"
        fieldErrors={fieldErrors}
        label="Limitacoes observadas"
        minLength={40}
        onChange={onChange}
      />
      <TextareaControl
        disabled={disabled}
        draft={draft}
        field="opportunity"
        fieldErrors={fieldErrors}
        label="Oportunidade"
        minLength={30}
        onChange={onChange}
      />
    </>
  );
}

function EvidenceDetails({ evidences }: { evidences: MissionEvidenceSummary[] }) {
  const entries = evidences.flatMap((evidence) =>
    Object.entries(evidence.details).map(([key, value]) => ({
      id: `${evidence.id}-${key}`,
      key,
      value,
    }))
  );

  if (entries.length === 0) {
    return <p className={styles.emptyDetails}>O entregavel foi registrado sem detalhes adicionais.</p>;
  }

  return (
    <dl className={styles.detailsList}>
      {entries.map((entry) => (
        <div key={entry.id}>
          <dt>{detailLabels[entry.key] ?? entry.key}</dt>
          <dd>{displayDetailValue(entry.key, entry.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MissionDetailScreen({
  missionKey,
  onWorkspaceChanged,
  startupId,
}: MissionDetailScreenProps) {
  const router = useRouter();
  const requestSequence = useRef(0);
  const [payload, setPayload] = useState<MissionDetailPayload | null>(null);
  const [drafts, setDrafts] = useState(() => ({
    problem_refinement: { ...initialDrafts.problem_refinement },
    audience_validation: { ...initialDrafts.audience_validation },
    value_proposition: { ...initialDrafts.value_proposition },
    alternatives_map: { ...initialDrafts.alternatives_map },
  }));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const loadMission = useCallback(async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setIsLoading(true);
    setLoadError(null);
    setSubmissionMessage(null);
    setSubmissionError(null);
    setFieldErrors({});

    try {
      const response = await fetch(
        `/api/startups/${startupId}/missions/${encodeURIComponent(missionKey)}`,
        { cache: "no-store" }
      );

      if (requestId !== requestSequence.current) return;

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (response.status === 404) {
        setPayload(null);
        setLoadError(NOT_FOUND_ERROR);
        return;
      }

      if (!response.ok) {
        setPayload(null);
        setLoadError(LOAD_ERROR);
        return;
      }

      const nextPayload = (await response.json()) as MissionDetailPayload;
      if (requestId === requestSequence.current) setPayload(nextPayload);
    } catch {
      if (requestId === requestSequence.current) {
        setPayload(null);
        setLoadError(LOAD_ERROR);
      }
    } finally {
      if (requestId === requestSequence.current) setIsLoading(false);
    }
  }, [missionKey, router, startupId]);

  useEffect(() => {
    void loadMission();

    return () => {
      requestSequence.current += 1;
    };
  }, [loadMission]);

  const handleFieldChange = (
    actionType: StructuredActionType,
    event: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.currentTarget;
    setDrafts((current) => ({
      ...current,
      [actionType]: { ...current[actionType], [name]: value },
    }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const submitMission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payload || payload.mission.actionType === "interviews" || isSubmitting) return;

    const actionType = payload.mission.actionType;
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmissionError(null);
    setSubmissionMessage(null);

    try {
      const response = await fetch(
        `/api/startups/${startupId}/missions/${encodeURIComponent(missionKey)}/submission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(drafts[actionType]),
        }
      );

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      const responsePayload = (await response.json()) as MissionDetailPayload | AuthErrorPayload;

      if (!response.ok) {
        const errorPayload = responsePayload as AuthErrorPayload;
        if (response.status === 400 || response.status === 409) {
          setFieldErrors(errorPayload.fieldErrors ?? {});
        }
        setSubmissionError(errorPayload.message || SUBMISSION_ERROR);
        return;
      }

      const nextPayload = responsePayload as MissionDetailPayload;
      setPayload(nextPayload);
      setSubmissionMessage(nextPayload.message ?? "Entregavel registrado com sucesso.");
      void onWorkspaceChanged?.();
    } catch {
      setSubmissionError(SUBMISSION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <MissionDetailSkeleton />;

  if (loadError || !payload) {
    return (
      <section className={styles.errorPanel} role="alert">
        <ProductIcon name="info" />
        <h1>Nao conseguimos abrir esta missao</h1>
        <p>{loadError ?? LOAD_ERROR}</p>
        <button className={styles.retryButton} onClick={() => void loadMission()} type="button">
          Tentar novamente
        </button>
      </section>
    );
  }

  const { mission } = payload;
  const structuredAction =
    mission.actionType === "interviews" ? null : (mission.actionType as StructuredActionType);
  const completed = mission.status === "completed";
  const locked = mission.status === "locked";

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href={startupMissionsHref(startupId)}>
        <span aria-hidden="true">&larr;</span>
        Voltar para missoes
      </Link>

      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.statusLine}>
            <span className={`${styles.status} ${styles[`status_${mission.status}`]}`}>
              {mission.statusLabel}
            </span>
            <span>{mission.phase}</span>
            <span>+{mission.xpReward} XP</span>
          </div>
          <h1>{mission.title}</h1>
          <p>{mission.objective}</p>
        </div>
      </header>

      <section className={styles.guidance} aria-label="Orientacoes da missao">
        <div>
          <h2>Por que esta missao importa</h2>
          <p>{mission.whyItMatters}</p>
        </div>
        <div>
          <h2>Como executar</h2>
          <ol>
            {mission.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2>Criterio de conclusao</h2>
          <p>{mission.completionCriteria}</p>
        </div>
      </section>

      <section className={styles.missionState} aria-labelledby="mission-state-title">
        <div className={styles.stateSummary}>
          <div className={styles.stateHeading}>
            <h2 id="mission-state-title">Progresso da missao</h2>
            <strong>{mission.progress}%</strong>
          </div>
          <div
            aria-label="Progresso da missao"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={mission.progress}
            className={styles.stateTrack}
            role="progressbar"
          >
            <span style={{ width: `${mission.progress}%` }} />
          </div>
          <h3>Requisitos</h3>
          <ul className={styles.requirementList}>
            {mission.requirements.map((requirement) => (
              <li key={requirement.key}>
                <span>{requirement.label}</span>
                <strong>{requirement.current} de {requirement.target}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.executionSteps}>
          <h2>Etapas da missao</h2>
          <ol>
            {mission.steps.map((step) => (
              <li key={step.key}>
                <span aria-hidden="true" className={styles.stepMarker} />
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
                <small>{missionStepStatusLabel(step.status)}</small>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <aside className={styles.tip}>
        <ProductIcon name="info" />
        <div>
          <strong>Dica para uma evidencia melhor</strong>
          <p>{mission.contextualTip}</p>
        </div>
      </aside>

      {submissionMessage ? (
        <section className={styles.successPanel} aria-label="Missao concluida" role="status">
          <ProductIcon name="check" />
          <div>
            <strong>{submissionMessage}</strong>
            <p>O progresso e o XP do workspace ja foram atualizados.</p>
          </div>
        </section>
      ) : null}

      {payload.nextRecommendedMission ? (
        <section className={styles.nextFocus} aria-labelledby="next-focus-title">
          <div>
            <h2 id="next-focus-title">Proximo foco</h2>
            <p>{payload.nextRecommendedMission.objective}</p>
          </div>
          <Link
            className={styles.primaryLink}
            href={missionExecutionHref(
              startupId,
              payload.nextRecommendedMission.key,
              payload.nextRecommendedMission.actionType
            )}
          >
            {payload.nextRecommendedMission.title}
            <ProductIcon name="chevron" />
          </Link>
        </section>
      ) : null}

      {locked ? (
        <section className={styles.lockedPanel} aria-label="Missao bloqueada">
          <ProductIcon name="lock" />
          <div>
            <h2>Esta missao ainda esta bloqueada</h2>
            <p>Conclua todos os requisitos abaixo antes de iniciar este entregavel.</p>
            <ul>
              {mission.lockedReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : completed ? (
        <section className={styles.readOnly} aria-labelledby="registered-delivery-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="registered-delivery-title">Entregavel registrado</h2>
              <p>Esta missao esta concluida. Os dados abaixo permanecem somente para consulta.</p>
            </div>
            <span className={styles.readOnlyBadge}>Somente leitura</span>
          </div>
          <EvidenceDetails evidences={mission.evidences} />
        </section>
      ) : mission.actionType === "interviews" ? (
        <section className={styles.homeHandoff} aria-labelledby="home-handoff-title">
          <ProductIcon name="home" />
          <div>
            <h2 id="home-handoff-title">Registre cada conversa no fluxo de entrevistas</h2>
            <p>
              As entrevistas continuam na Home, onde evidencias e aprendizados compartilham o mesmo
              contexto. Esta missao nao cria um segundo formulario.
            </p>
            <Link className={styles.primaryLink} href={startupHomeHref(startupId)}>
              Continuar na Home
              <ProductIcon name="chevron" />
            </Link>
          </div>
        </section>
      ) : structuredAction ? (
        <section className={styles.formSection} aria-labelledby="mission-delivery-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="mission-delivery-title">Entregavel da missao</h2>
              <p>Registre uma sintese concreta, sustentada pelo que voce observou.</p>
            </div>
          </div>
          <form noValidate onSubmit={submitMission}>
            <StructuredMissionFields
              actionType={structuredAction}
              disabled={isSubmitting}
              draft={drafts[structuredAction]}
              fieldErrors={fieldErrors}
              onChange={(event) => handleFieldChange(structuredAction, event)}
            />

            {submissionError ? (
              <p className={styles.submissionError} role="alert">
                {submissionError}
              </p>
            ) : null}

            <div className={styles.formActions}>
              <button
                aria-busy={isSubmitting}
                className={styles.submitButton}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Salvando missao..." : "Salvar e concluir missao"}
              </button>
              <span>Revise o texto antes de concluir. A entrega vira parte do historico da startup.</span>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
