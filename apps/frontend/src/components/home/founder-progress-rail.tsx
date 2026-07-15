import { ProductIcon } from "@/components/product-icon";
import type { AccountProgress, TodayPayload } from "@/lib/startup-types";

import styles from "./startup-home-screen.module.css";

type FounderProgressRailProps = {
  account: AccountProgress;
  journey: TodayPayload["journey"];
};

const streakMessages: Record<NonNullable<AccountProgress["streakStatus"]>, string> = {
  inactive: "Conclua uma atividade para iniciar sua sequência.",
  maintained: "Sequência mantida hoje.",
  at_risk: "Registre uma atividade hoje para manter.",
  broken: "Recomece com uma atividade significativa.",
};

function dayCountLabel(count: number) {
  return `${count} ${count === 1 ? "dia" : "dias"}`;
}

export function FounderProgressRail({ account, journey }: FounderProgressRailProps) {
  const streak = account.currentStreak ?? 0;
  const streakStatus = account.streakStatus ?? "inactive";

  return (
    <aside className={styles.statusRail} aria-label="Progresso do fundador">
      <section className={styles.statusPanel}>
        <div className={styles.streakRow}>
          <span className={styles.streakMark}>
            <ProductIcon name="flame" />
          </span>
          <div>
            <strong>{streak > 0 ? dayCountLabel(streak) : "Comece hoje"}</strong>
            <p>{streakMessages[streakStatus]}</p>
          </div>
        </div>
      </section>

      <section className={styles.statusPanel}>
        <div className={styles.levelRow}>
          <ProductIcon name="level" />
          <div>
            <strong>Nível {account.level}</strong>
            <span>
              {account.xpIntoLevel}/{account.xpPerLevel} XP
            </span>
          </div>
        </div>
        <div
          aria-label="Progresso do nível"
          aria-valuemax={account.xpPerLevel}
          aria-valuemin={0}
          aria-valuenow={account.xpIntoLevel}
          className={styles.levelTrack}
          role="progressbar"
        >
          <span
            style={{
              width: `${Math.min(100, (account.xpIntoLevel / account.xpPerLevel) * 100)}%`,
            }}
          />
        </div>
      </section>

      <section className={styles.statusPanel}>
        <div className={styles.phaseHeader}>
          <div>
            <strong>Fase da Jornada</strong>
            <span>{journey.progress}%</span>
          </div>
          <p>Etapa atual: {journey.currentStepLabel ?? "Jornada inicial concluída"}</p>
        </div>
        <div
          aria-label="Progresso da fase"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={journey.progress}
          className={styles.phaseTrack}
          role="progressbar"
        >
          <span style={{ width: `${journey.progress}%` }} />
        </div>
      </section>
    </aside>
  );
}
