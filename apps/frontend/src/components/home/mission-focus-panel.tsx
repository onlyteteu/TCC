import { ProductIcon } from "@/components/product-icon";
import type { MissionSummary } from "@/lib/startup-types";

import styles from "./startup-home-screen.module.css";

type MissionFocusPanelProps = {
  mission: MissionSummary;
  onOpenStep: (stepKey: string) => void;
  onPrimaryAction: () => void;
};

const statusLabels = {
  available: "Disponivel",
  completed: "Concluido",
  current: "Em andamento",
  locked: "Bloqueado",
} as const;

export function MissionFocusPanel({
  mission,
  onOpenStep,
  onPrimaryAction,
}: MissionFocusPanelProps) {
  const primaryLabel = mission.canComplete
    ? "Concluir missao"
    : mission.canAddLearning
      ? "Registrar aprendizado"
      : "Registrar entrevista";

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
        <span>
          <strong>{mission.evidenceCount}</strong> de {mission.requiredEvidenceCount} entrevistas
        </span>
        <span>{mission.progress}%</span>
      </div>
      <div
        aria-label={`${mission.progress}% da missao concluida`}
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
              {step.status === "locked" ? (
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

      <div className={styles.missionActions}>
        <button className={styles.primaryButton} onClick={onPrimaryAction} type="button">
          {primaryLabel}
        </button>
      </div>
    </section>
  );
}
