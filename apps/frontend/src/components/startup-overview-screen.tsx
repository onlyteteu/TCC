"use client";

import { QuestMark } from "@/components/quest-mark";
import type { AuthUser } from "@/lib/auth-types";
import type { StartupSummary } from "@/lib/startup-types";

import styles from "./startup-overview-screen.module.css";

type StartupOverviewScreenProps = {
  flashMessage?: string | null;
  isLoggingOut?: boolean;
  onCreateAnother: () => void;
  onLogout: () => void;
  startups: StartupSummary[];
  user: AuthUser;
};

function isDeferredName(startup: StartupSummary) {
  return startup.name.toLowerCase().startsWith("startup sem nome");
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function StartupOverviewScreen({
  flashMessage,
  isLoggingOut = false,
  onCreateAnother,
  onLogout,
  startups,
  user,
}: StartupOverviewScreenProps) {
  const namedStartups = startups.filter((startup) => !isDeferredName(startup)).length;
  const deferredStartups = startups.length - namedStartups;

  return (
    <main className={styles.page}>
      <div className={styles.beam} />
      <div className={styles.orbitLeft} />
      <div className={styles.orbitRight} />
      <div className={styles.orbitLower} />
      {Array.from({ length: 8 }).map((_, index) => (
        <span className={styles.star} key={index} />
      ))}

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <QuestMark animated />

            <div className={styles.brandCopy}>
              <span className={styles.eyebrow}>Startup Quest</span>
              <h1>Ola, {user.name}.</h1>
              <p>Sua conta ja tem startup criada e pronta para os proximos passos.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryButton} onClick={onCreateAnother} type="button">
              Nova startup
            </button>
            <button className={styles.primaryButton} onClick={onLogout} type="button">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </header>

        {flashMessage ? <div className={styles.flash}>{flashMessage}</div> : null}

        <section className={styles.metrics}>
          <article className={styles.metricCard}>
            <span>Startups</span>
            <strong>{startups.length.toString().padStart(2, "0")}</strong>
          </article>

          <article className={styles.metricCard}>
            <span>Com nome definido</span>
            <strong>{namedStartups.toString().padStart(2, "0")}</strong>
          </article>

          <article className={styles.metricCard}>
            <span>A definir depois</span>
            <strong>{deferredStartups.toString().padStart(2, "0")}</strong>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Suas startups</h2>
            <p>Enquanto o hub completo nao entra, esta area ja mostra o que voce criou.</p>
          </div>

          <div className={styles.grid}>
            {startups.map((startup) => (
              <article className={styles.card} key={startup.id}>
                <div className={styles.cardHeader}>
                  <span
                    className={[
                      styles.stageChip,
                      isDeferredName(startup) ? styles.stageChipDeferred : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isDeferredName(startup) ? "Nome pendente" : startup.currentStageLabel}
                  </span>

                  <span className={styles.dateChip}>{formatCreatedAt(startup.createdAt)}</span>
                </div>

                <h3>{startup.name}</h3>

                <dl className={styles.details}>
                  <div>
                    <dt>Etapa atual</dt>
                    <dd>{startup.currentStageLabel}</dd>
                  </div>

                  <div>
                    <dt>Status</dt>
                    <dd>{isDeferredName(startup) ? "Pode receber nome depois" : "Nome definido"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
