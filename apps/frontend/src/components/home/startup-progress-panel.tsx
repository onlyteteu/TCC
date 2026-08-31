import Link from "next/link";

import type { TodayPayload } from "@/lib/startup-types";

import { NextUnlock } from "./next-unlock";
import styles from "./startup-home-screen.module.css";

type StartupProgressPanelProps = {
  journey: TodayPayload["journey"];
  nextUnlock: TodayPayload["nextUnlock"];
  startupId: number;
};

export function StartupProgressPanel({
  journey,
  nextUnlock,
  startupId,
}: StartupProgressPanelProps) {
  return (
    <aside className={styles.startupProgressPanel} aria-labelledby="startup-progress-title">
      <div className={styles.progressPanelHeader}>
        <h2 id="startup-progress-title">Progresso da startup</h2>
        <span>{journey.progress}%</span>
      </div>

      <div className={styles.currentMilestone}>
        <span>Marco atual</span>
        <strong>{journey.currentStepLabel ?? "Jornada inicial concluída"}</strong>
        <p>
          {journey.completedSteps} de {journey.totalSteps} etapas concluídas
        </p>
      </div>

      <div
        aria-label="Progresso da jornada"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={journey.progress}
        className={styles.journeyTrack}
        role="progressbar"
      >
        <span style={{ width: `${journey.progress}%` }} />
      </div>

      <NextUnlock unlock={nextUnlock} />

      <Link className={styles.journeyLink} href={`/painel/startup/${startupId}/jornada`}>
        Abrir Jornada
      </Link>
    </aside>
  );
}
