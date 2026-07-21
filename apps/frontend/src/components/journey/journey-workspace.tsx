"use client";

import type {
  JourneyChapterSummary,
  JourneyMilestoneSummary,
  JourneyStrategicItem,
} from "@/lib/startup-types";

import { JourneyChapterMap } from "./journey-chapter-map";
import { JourneyMilestonePanel } from "./journey-milestone-panel";
import styles from "./startup-journey-screen.module.css";

type JourneyWorkspaceProps = {
  chapters: JourneyChapterSummary[];
  currentMilestone: JourneyMilestoneSummary | null;
  onReviewField: (field: "problem" | "audience") => void;
  onSelectStep: (stepKey: string) => void;
  progress: number;
  selectedStepKey: string;
  strategicSummary: JourneyStrategicItem[];
};

function selectedMilestone(
  chapters: JourneyChapterSummary[],
  currentMilestone: JourneyMilestoneSummary | null,
  selectedStepKey: string,
  strategicSummary: JourneyStrategicItem[]
) {
  const chapter = chapters.find((item) =>
    item.steps.some((step) => step.key === selectedStepKey)
  );
  const step = chapter?.steps.find((item) => item.key === selectedStepKey);
  if (!step || step.status === "pending" || step.key === currentMilestone?.key) {
    return currentMilestone;
  }

  const strategicItem = strategicSummary.find((item) => item.key === step.key);
  return {
    key: step.key,
    chapterKey: chapter?.key ?? "foundation",
    title: step.title,
    description: "Registro consolidado deste marco concluído.",
    alreadyBuilt: step.answer
      ? [
          strategicItem ?? {
            key: step.key,
            label: "Resultado consolidado",
            value: step.answer,
            field: null,
          },
        ]
      : [],
    nextUnlock: null,
    mission: null,
    message: "Este marco foi concluído e permanece disponível para consulta.",
  } satisfies JourneyMilestoneSummary;
}

export function JourneyWorkspace({
  chapters,
  currentMilestone,
  onReviewField,
  onSelectStep,
  progress,
  selectedStepKey,
  strategicSummary,
}: JourneyWorkspaceProps) {
  const currentChapterIndex = chapters.findIndex((chapter) => chapter.status === "current");
  const currentChapter =
    chapters[currentChapterIndex] ?? chapters.find((chapter) => chapter.status === "done") ?? null;
  const milestone = selectedMilestone(
    chapters,
    currentMilestone,
    selectedStepKey,
    strategicSummary
  );
  const summaryItems =
    milestone?.key !== currentMilestone?.key
      ? strategicSummary.filter((item) => item.key !== milestone?.key)
      : strategicSummary;

  if (!currentChapter) {
    return (
      <section className={styles.statePanel}>
        <h2>A Jornada desta startup está sendo preparada</h2>
        <p>Tente novamente em instantes.</p>
      </section>
    );
  }

  return (
    <div className={styles.journeyContent}>
      <section className={styles.chapterHero} aria-labelledby="current-chapter-question">
        <div>
          <span>
            Capítulo {Math.max(currentChapterIndex, 0) + 1} de {chapters.length}
          </span>
          <strong>{currentChapter.title}</strong>
          <h2 id="current-chapter-question">{currentChapter.question}</h2>
        </div>
        <div className={styles.overallProgress}>
          <span>{progress}% construído</span>
          <div
            aria-label="Progresso geral da Jornada"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className={styles.progressTrack}
            role="progressbar"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <JourneyChapterMap
        chapters={chapters}
        onSelectStep={onSelectStep}
        selectedStepKey={selectedStepKey}
      />

      <div className={styles.journeyWorkspace}>
        <JourneyMilestonePanel milestone={milestone} />

        <section className={styles.strategicSummary} aria-labelledby="strategic-summary-title">
          <span className={styles.sectionEyebrow}>Memória da startup</span>
          <h2 id="strategic-summary-title">Registro estratégico</h2>
          <dl>
            {summaryItems.map((item) => (
              <div key={item.key}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                {item.field ? (
                  <button
                    aria-label={`Revisar ${item.label}`}
                    className={styles.textButton}
                    onClick={() => onReviewField(item.field!)}
                    type="button"
                  >
                    Revisar registro
                  </button>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
