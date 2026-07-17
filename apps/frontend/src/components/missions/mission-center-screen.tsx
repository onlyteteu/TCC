"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ProductIcon, type ProductIconName } from "@/components/product-icon";
import { missionExecutionHref } from "@/lib/startup-navigation";
import type { MissionCardSummary, MissionCenterPayload } from "@/lib/startup-types";

import styles from "./mission-center-screen.module.css";

type MissionCenterScreenProps = {
  startupId: number;
};

const LOAD_ERROR = "Nao foi possivel carregar as missoes agora.";
const NOT_FOUND_ERROR = "Esta startup nao existe ou voce nao pode mais acessa-la.";

function boundedProgress(progress: number) {
  return Math.max(0, Math.min(100, progress));
}

function missionTrail(payload: MissionCenterPayload) {
  const missions = [
    ...(payload.recommendedMission ? [payload.recommendedMission] : []),
    ...payload.availableMissions,
    ...payload.lockedMissions,
    ...payload.completedMissions,
  ];
  const unique = new Map<string, MissionCardSummary>();

  for (const mission of missions) {
    if (!unique.has(mission.key)) {
      unique.set(mission.key, mission);
    }
  }

  return [...unique.values()].sort((left, right) => left.order - right.order);
}

function missionIcon(mission: MissionCardSummary): ProductIconName {
  if (mission.status === "completed") return "check";
  if (mission.status === "locked") return "lock";
  return "mission";
}

function MissionProgress({ mission }: { mission: MissionCardSummary }) {
  const progress = boundedProgress(mission.progress);

  return (
    <div className={styles.missionProgress}>
      <div className={styles.progressLabel}>
        <span>Progresso da missao</span>
        <strong>{progress}%</strong>
      </div>
      <div
        aria-label={`Progresso de ${mission.title}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function TrailItem({ mission, startupId }: { mission: MissionCardSummary; startupId: number }) {
  const content = (
    <>
      <span className={styles.trailIcon}>
        <ProductIcon name={missionIcon(mission)} />
      </span>
      <span className={styles.trailCopy}>
        <strong>{mission.title}</strong>
        <span>{mission.objective}</span>
        {mission.status === "locked" && mission.lockedReasons[0] ? (
          <small>{mission.lockedReasons[0]}</small>
        ) : null}
      </span>
      <span className={styles.trailState}>{mission.statusLabel}</span>
    </>
  );

  return (
    <li className={styles[`trail_${mission.status}`]}>
      {mission.status === "locked" ? (
        <div aria-disabled="true" className={styles.trailRow}>
          {content}
        </div>
      ) : (
        <Link
          aria-current={mission.status === "in_progress" ? "step" : undefined}
          aria-label={`Abrir missao ${mission.order} na trilha, ${mission.statusLabel}`}
          className={styles.trailRow}
          href={missionExecutionHref(startupId, mission.key, mission.actionType)}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

function MissionCenterSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando central de missoes"
      className={styles.skeletonPage}
      role="status"
    >
      <span className={styles.srOnly}>Carregando central de missoes.</span>
      <div className={styles.skeletonHeader}>
        <span />
        <span />
      </div>
      <div className={styles.skeletonFocus} />
      <div className={styles.skeletonTrail}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function MissionCenterScreen({ startupId }: MissionCenterScreenProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<MissionCenterPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMissions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/startups/${startupId}/missions`, { cache: "no-store" });

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

      setPayload((await response.json()) as MissionCenterPayload);
    } catch {
      setPayload(null);
      setLoadError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [router, startupId]);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  if (isLoading) {
    return <MissionCenterSkeleton />;
  }

  if (loadError || !payload) {
    return (
      <section className={styles.errorPanel} role="alert">
        <ProductIcon name="info" />
        <h1>Nao conseguimos abrir a Central de missoes</h1>
        <p>{loadError ?? LOAD_ERROR}</p>
        <button className={styles.retryButton} onClick={() => void loadMissions()} type="button">
          Tentar novamente
        </button>
      </section>
    );
  }

  const trail = missionTrail(payload);
  const recommended = payload.recommendedMission;
  const arcCompleted = recommended === null && payload.arc.progress === 100;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Missoes</h1>
          <p>Transforme a proxima duvida da startup em acao.</p>
        </div>
        <div
          aria-label={`${payload.arc.progress}% do arco concluido`}
          className={styles.arcProgress}
        >
          <strong>{payload.arc.title}</strong>
          <span>
            {payload.arc.completed} de {payload.arc.total}
          </span>
          <div aria-hidden="true" className={styles.arcTrack}>
            <span style={{ width: `${boundedProgress(payload.arc.progress)}%` }} />
          </div>
        </div>
      </header>

      <section
        className={`${styles.focus} ${arcCompleted ? styles.focusCompleted : ""}`}
        aria-labelledby="mission-focus-title"
      >
        {arcCompleted ? (
          <div className={styles.completedFocus}>
            <span className={styles.completedIcon}>
              <ProductIcon name="check" />
            </span>
            <div>
              <h2 id="mission-focus-title">Arco de {payload.arc.title} concluido</h2>
              <p>
                Voce concluiu as missoes desta etapa. A proxima trilha ainda nao foi liberada.
              </p>
            </div>
          </div>
        ) : recommended ? (
          <>
            <div className={styles.focusCopy}>
              <p className={styles.focusReason}>
                {recommended.recommendationReason ?? "Esta e a proxima acao mais importante agora."}
              </p>
              <h2 id="mission-focus-title">{recommended.title}</h2>
              <p className={styles.focusObjective}>{recommended.objective}</p>
              <MissionProgress mission={recommended} />
            </div>
            <div className={styles.focusAction}>
              <span className={styles.reward}>+{recommended.xpReward} XP</span>
              <Link
                className={styles.primaryAction}
                href={missionExecutionHref(startupId, recommended.key, recommended.actionType)}
              >
                Continuar missao
                <ProductIcon name="chevron" />
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.noFocus}>
            <ProductIcon name="info" />
            <div>
              <h2 id="mission-focus-title">Nenhuma missao recomendada agora</h2>
              <p>A trilha permanece visivel abaixo enquanto uma nova prioridade e preparada.</p>
            </div>
          </div>
        )}
      </section>

      {payload.availableMissions.length > 0 ? (
        <section className={styles.availableSection} aria-labelledby="available-title">
          <div className={styles.sectionHeading}>
            <h2 id="available-title">Tambem disponivel</h2>
            <p>Escolha outra frente se ela fizer mais sentido para o momento da startup.</p>
          </div>
          <ul className={styles.availableList}>
            {payload.availableMissions.map((mission) => (
              <li key={mission.key}>
                <Link
                  className={styles.alternativeLink}
                  href={missionExecutionHref(startupId, mission.key, mission.actionType)}
                >
                  <span>
                    <strong>{mission.title}</strong>
                    <small>{mission.objective}</small>
                  </span>
                  <span className={styles.alternativeMeta}>
                    +{mission.xpReward} XP
                    <ProductIcon name="chevron" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.trailSection} aria-labelledby="trail-title">
        <div className={styles.sectionHeading}>
          <h2 id="trail-title">Trilha completa</h2>
          <p>Acompanhe o que avancou, o que esta disponivel e o que ainda depende de outra missao.</p>
        </div>
        <ol className={styles.trail}>
          {trail.map((mission) => (
            <TrailItem key={mission.key} mission={mission} startupId={startupId} />
          ))}
        </ol>
      </section>
    </div>
  );
}
