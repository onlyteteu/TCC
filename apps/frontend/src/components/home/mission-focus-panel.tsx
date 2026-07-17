import Link from "next/link";

import { ProductIcon } from "@/components/product-icon";
import type { MissionSummary } from "@/lib/startup-types";

import styles from "./startup-home-screen.module.css";

type MissionFocusPanelProps = {
  mission: MissionSummary;
  isPrimaryActionPending: boolean;
  onOpenStep: (stepKey: string) => void;
  onPrimaryAction: () => void;
  startupId: number;
};

const statusLabels = {
  available: "Disponível",
  completed: "Concluído",
  current: "Em andamento",
  locked: "Bloqueado",
} as const;

export function MissionFocusPanel({
  mission,
  isPrimaryActionPending,
  onOpenStep,
  onPrimaryAction,
  startupId,
}: MissionFocusPanelProps) {
  const isCompleted = mission.status === "completed";
  const isInterviewMission = mission.actionType === "interviews";
  const primaryLabel = isPrimaryActionPending
    ? "Salvando..."
    : !isInterviewMission
      ? "Abrir missão"
      : mission.canComplete
        ? "Concluir missão"
        : mission.canAddLearning
          ? "Registrar aprendizado"
          : "Registrar entrevista";
  const progressLabel = isInterviewMission
    ? `${mission.evidenceCount} de ${mission.requiredEvidenceCount} entrevistas`
    : (mission.requirements[0]?.label ?? "Entregável principal");

  return (
    <section className={styles.missionPanel} aria-labelledby="mission-title">
      <div className={styles.missionHeader}>
        <div>
          <span className={styles.missionType}>
            <ProductIcon name="mission" />
            {mission.typeLabel}
          </span>
          <h2 id="mission-title">{mission.title}</h2>
          <p className={styles.missionObjective}>{mission.objective}</p>
        </div>
        <span className={styles.reward}>+{mission.xpReward} XP</span>
      </div>

      <div className={styles.missionProgressLabel}>
        <span>{progressLabel}</span>
        <span>{mission.progress}%</span>
      </div>
      <div
        aria-label={`${mission.progress}% da missão concluída`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={mission.progress}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${mission.progress}%` }} />
      </div>

      <ol className={styles.missionSteps}>
        {mission.steps.map((step, index) => {
          const content = (
            <>
              <span className={styles.stepMarker} aria-hidden="true">
                {step.status === "completed" ? (
                  <ProductIcon name="check" />
                ) : step.status === "locked" ? (
                  <ProductIcon name="lock" />
                ) : (
                  index + 1
                )}
              </span>
              <span className={styles.stepCopy}>
                <strong>{step.title}</strong>
                <span>{step.description}</span>
              </span>
              <small>{statusLabels[step.status]}</small>
            </>
          );

          return (
            <li
              aria-disabled={step.status === "locked" ? "true" : undefined}
              className={styles[`step_${step.status}`]}
              key={step.key}
            >
              {step.status === "locked" || isCompleted ? (
                <div className={styles.stepLocked}>{content}</div>
              ) : (
                <button
                  className={styles.stepAction}
                  onClick={() => onOpenStep(step.key)}
                  type="button"
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.tip}>
        <ProductIcon name="info" />
        <p>{mission.contextualTip}</p>
      </div>

      {isCompleted ? (
        <>
          <div className={styles.completedMissionDetails}>
            <section aria-labelledby="completed-evidences-title">
              <h3 id="completed-evidences-title">Evidencias registradas</h3>
              <ul className={styles.completedEvidenceList}>
                {mission.evidences.map((evidence) => (
                  <li key={evidence.id}>
                    <article>
                      <strong>{evidence.intervieweeName}</strong>
                      <span>{evidence.intervieweeProfile}</span>
                      <p>{evidence.context}</p>
                      <p>{evidence.notes}</p>
                      <time dateTime={evidence.occurredOn}>{evidence.occurredOn}</time>
                    </article>
                  </li>
                ))}
              </ul>
            </section>

            {mission.learning ? (
              <section aria-labelledby="completed-learning-title">
                <h3 id="completed-learning-title">Aprendizado registrado</h3>
                <p>{mission.learning.content}</p>
                <dl className={styles.completedLearningSummary}>
                  <div>
                    <dt>Impacto</dt>
                    <dd>{mission.learning.impact}</dd>
                  </div>
                  <div>
                    <dt>Proxima acao</dt>
                    <dd>{mission.learning.nextAction}</dd>
                  </div>
                  <div>
                    <dt>Confianca</dt>
                    <dd>{mission.learning.confidenceLabel}</dd>
                  </div>
                </dl>
              </section>
            ) : null}
          </div>
          <div className={styles.missionActions}>
            <div>
              <strong>Missao concluida</strong>
              <p>
                {mission.evidenceCount} entrevistas e {mission.learning ? "1 aprendizado" : "nenhum aprendizado"} registrados.
              </p>
            </div>
            <Link className={styles.primaryButton} href={`/painel/startup/${startupId}/jornada`}>
              Ir para a Jornada
            </Link>
          </div>
        </>
      ) : (
        <div className={styles.missionActions}>
          <button
            aria-busy={isPrimaryActionPending || undefined}
            className={styles.primaryButton}
            disabled={isPrimaryActionPending}
            onClick={onPrimaryAction}
            type="button"
          >
            {primaryLabel}
          </button>
        </div>
      )}
    </section>
  );
}
