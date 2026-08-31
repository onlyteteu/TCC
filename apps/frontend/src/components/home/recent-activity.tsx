import { ProductIcon } from "@/components/product-icon";
import type { ActivitySummary } from "@/lib/startup-types";

import styles from "./startup-home-screen.module.css";

function formatActivityDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

export function RecentActivity({ activities }: { activities: ActivitySummary[] }) {
  return (
    <section className={styles.recentActivity} aria-labelledby="recent-activity-title">
      <div className={styles.sectionHeadingRow}>
        <h2 id="recent-activity-title">Atividade recente</h2>
        {activities.length > 0 ? (
          <span>
            {activities.length} {activities.length === 1 ? "registro recente" : "registros recentes"}
          </span>
        ) : null}
      </div>
      {activities.length > 0 ? (
        <ul className={styles.activityList}>
          {activities.map((activity) => (
            <li key={activity.id}>
              <span className={styles.activityIcon} aria-hidden="true">
                <ProductIcon name="check" />
              </span>
              <div>
                <strong>{activity.kindLabel}</strong>
                <p>{activity.description}</p>
              </div>
              <div className={styles.activityMeta}>
                <strong>+{activity.xpAwarded} XP</strong>
                <time dateTime={activity.occurredAt}>{formatActivityDate(activity.occurredAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyActivity}>
          <ProductIcon name="mission" />
          <p>
            Sua primeira evidência aparecerá aqui depois de registrar uma entrevista ou concluir
            uma etapa.
          </p>
        </div>
      )}
    </section>
  );
}
