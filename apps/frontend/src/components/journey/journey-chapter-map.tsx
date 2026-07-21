"use client";

import type { JourneyChapterSummary } from "@/lib/startup-types";

import styles from "./startup-journey-screen.module.css";

type JourneyChapterMapProps = {
  chapters: JourneyChapterSummary[];
  onSelectStep: (stepKey: string) => void;
  selectedStepKey: string;
};

const statusLabel = {
  done: "Concluído",
  current: "Marco atual",
  locked: "Bloqueado",
} as const;

export function JourneyChapterMap({
  chapters,
  onSelectStep,
  selectedStepKey,
}: JourneyChapterMapProps) {
  return (
    <ol aria-label="Mapa da evolução" className={styles.chapterTrack}>
      {chapters.map((chapter, chapterIndex) => (
        // O estado pertence ao capítulo inteiro e precisa chegar ao leitor de tela.
        // eslint-disable-next-line jsx-a11y/role-supports-aria-props
        <li
          aria-current={chapter.status === "current" ? "step" : undefined}
          aria-disabled={chapter.status === "locked" ? "true" : undefined}
          className={styles.chapter}
          data-status={chapter.status}
          key={chapter.key}
        >
          <div className={styles.chapterHeading}>
            <span className={styles.chapterNode} aria-hidden="true">
              {chapter.status === "done" ? "✓" : chapterIndex + 1}
            </span>
            <span>
              <small>{statusLabel[chapter.status]}</small>
              <strong>{chapter.title}</strong>
            </span>
            <span className={styles.chapterCount}>
              {chapter.completedSteps}/{chapter.totalSteps}
            </span>
          </div>

          <ol className={styles.chapterSteps} aria-label={`Marcos de ${chapter.title}`}>
            {chapter.steps.map((step) => {
              const isAvailable = step.status !== "pending";
              const isSelected = step.key === selectedStepKey;
              return (
                <li key={step.key}>
                  {isAvailable ? (
                    <button
                      aria-current={isSelected ? "step" : undefined}
                      className={styles.chapterStepButton}
                      onClick={() => onSelectStep(step.key)}
                      type="button"
                    >
                      <span aria-hidden="true">{step.status === "done" ? "✓" : "●"}</span>
                      {step.title}
                    </button>
                  ) : (
                    <span className={styles.lockedChapterStep}>
                      <span aria-hidden="true">○</span>
                      {step.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
