import Link from "next/link";

import type { JourneyMilestoneSummary } from "@/lib/startup-types";

import styles from "./startup-journey-screen.module.css";

type JourneyMilestonePanelProps = {
  milestone: JourneyMilestoneSummary | null;
};

export function JourneyMilestonePanel({ milestone }: JourneyMilestonePanelProps) {
  if (!milestone) {
    return (
      <section className={styles.milestonePanel}>
        <h2>A Jornada desta startup está sendo preparada</h2>
        <p>Os próximos marcos aparecerão aqui assim que o percurso estiver disponível.</p>
      </section>
    );
  }

  return (
    <section className={styles.milestonePanel} aria-labelledby="milestone-title">
      <span className={styles.sectionEyebrow}>Marco em foco</span>
      <h2 id="milestone-title">{milestone.title}</h2>
      <p className={styles.milestoneDescription}>{milestone.description}</p>

      {milestone.alreadyBuilt.length > 0 ? (
        <div className={styles.alreadyBuilt}>
          <h3>O que já foi construído</h3>
          <ul>
            {milestone.alreadyBuilt.map((item) => (
              <li key={item.key}>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {milestone.nextUnlock ? (
        <div className={styles.nextUnlock}>
          <span>Próximo desbloqueio</span>
          <strong>{milestone.nextUnlock.title}</strong>
          <p>{milestone.nextUnlock.description}</p>
        </div>
      ) : null}

      {milestone.mission ? (
        <div className={styles.missionConnection}>
          <div>
            <span>Missão relacionada</span>
            <strong>{milestone.mission.title}</strong>
            <p>{milestone.mission.objective}</p>
          </div>
          <div className={styles.missionMeta} aria-label="Detalhes da missão">
            <span>{milestone.mission.estimatedMinutes} min</span>
            <span>+{milestone.mission.xpReward} XP</span>
          </div>
          <Link
            className={
              milestone.mission.canContinue
                ? styles.primaryButton
                : styles.secondaryButton
            }
            href={milestone.mission.href}
          >
            {milestone.mission.canContinue ? "Continuar missão" : "Consultar missão"}
          </Link>
        </div>
      ) : (
        <p className={styles.unavailableMessage}>{milestone.message}</p>
      )}
    </section>
  );
}
