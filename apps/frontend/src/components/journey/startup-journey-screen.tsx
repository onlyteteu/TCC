"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { AuthErrorPayload } from "@/lib/auth-types";
import {
  startupJourneyHref,
  startupJourneyMapHref,
} from "@/lib/startup-navigation";
import type { JourneyPayload, StartupUpdatePayload } from "@/lib/startup-types";

import { JourneyWorkspace } from "./journey-workspace";
import { StartupMapSummary, type StartupMapField } from "./startup-map-summary";
import styles from "./startup-journey-screen.module.css";

type StartupJourneyScreenProps = {
  onWorkspaceChanged?: () => Promise<boolean>;
  startupId: number;
};

const startupMapFields = new Set<StartupMapField>([
  "name",
  "description",
  "segment",
  "problem",
  "audience",
  "initialGoal",
]);

function parseStartupMapField(value: string | null): StartupMapField | null {
  return value && startupMapFields.has(value as StartupMapField)
    ? (value as StartupMapField)
    : null;
}

class JourneyRequestError extends Error {}

export function StartupJourneyScreen({
  onWorkspaceChanged,
  startupId,
}: StartupJourneyScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<JourneyPayload | null>(null);
  const [selectedStepKey, setSelectedStepKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isSavingField, setIsSavingField] = useState(false);

  const view = searchParams.get("view") === "map" ? "map" : "journey";
  const requestedField = parseStartupMapField(searchParams.get("field"));

  const applyJourneyPayload = useCallback((nextPayload: JourneyPayload) => {
    setPayload(nextPayload);
    setSelectedStepKey((currentKey) => {
      const selected = nextPayload.journey.find(
        (step) => step.key === currentKey && step.status !== "pending"
      );
      return (
        selected?.key ??
        nextPayload.currentMilestone?.key ??
        nextPayload.journey.find((step) => step.status === "current")?.key ??
        nextPayload.journey.find((step) => step.status === "done")?.key ??
        ""
      );
    });
    if (nextPayload.message) setFlashMessage(nextPayload.message);
  }, []);

  const loadJourney = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/startups/${startupId}/journey`, {
        cache: "no-store",
      });
      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (response.status === 404) {
        setLoadError("Essa startup não existe ou não pertence à sua conta.");
        return;
      }
      if (!response.ok) {
        setLoadError("Não foi possível carregar essa startup agora.");
        return;
      }
      applyJourneyPayload((await response.json()) as JourneyPayload);
    } catch {
      setLoadError("Não foi possível carregar essa startup agora.");
    } finally {
      setIsLoading(false);
    }
  }, [applyJourneyPayload, router, startupId]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney]);

  async function patchStartup(field: StartupMapField, value: string) {
    setIsSavingField(true);
    try {
      const response = await fetch(`/api/startups/${startupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const responsePayload = (await response.json()) as
        | AuthErrorPayload
        | StartupUpdatePayload;

      if (response.status === 401) {
        router.replace("/");
        throw new JourneyRequestError("");
      }
      if (!response.ok) {
        const errorPayload = responsePayload as AuthErrorPayload;
        const firstFieldError = errorPayload.fieldErrors
          ? Object.values(errorPayload.fieldErrors)[0]?.[0]
          : undefined;
        throw new JourneyRequestError(
          firstFieldError ?? errorPayload.message ?? "Nao foi possivel salvar agora."
        );
      }

      const successPayload = responsePayload as StartupUpdatePayload;
      setPayload((current) => {
        if (!current) return current;
        const journeyField = field === "problem" || field === "audience" ? field : null;
        const updateStep = (step: JourneyPayload["journey"][number]) =>
          journeyField && step.key === journeyField ? { ...step, answer: value } : step;
        const updateStrategicItem = (
          item: JourneyPayload["strategicSummary"][number]
        ) => (journeyField && item.key === journeyField ? { ...item, value } : item);
        return {
          ...current,
          startup: successPayload.startup,
          journey: current.journey.map(updateStep),
          chapters: current.chapters.map((chapter) => ({
            ...chapter,
            steps: chapter.steps.map(updateStep),
          })),
          strategicSummary: current.strategicSummary.map(updateStrategicItem),
          currentMilestone: current.currentMilestone
            ? {
                ...current.currentMilestone,
                alreadyBuilt:
                  current.currentMilestone.alreadyBuilt.map(updateStrategicItem),
              }
            : null,
        };
      });
      setFlashMessage(successPayload.message);
      void onWorkspaceChanged?.();
    } catch (caughtError) {
      if (caughtError instanceof JourneyRequestError) throw caughtError;
      throw new Error("Nao foi possivel salvar agora.");
    } finally {
      setIsSavingField(false);
    }
  }

  const header = (
    <header className={styles.header}>
      <div>
        <span>Jornada da startup</span>
        <h1>Visão estratégica</h1>
        <p>Entenda onde a startup está e o que está sendo construído agora.</p>
      </div>
      <button
        className={styles.secondaryButton}
        onClick={() => router.replace(startupJourneyMapHref(startupId))}
        type="button"
      >
        Abrir Mapa da startup
      </button>
    </header>
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        {header}
        <div aria-busy="true" aria-live="polite" className={styles.statePanel}>
          <span className={styles.loadingMark} aria-hidden="true" />
          <strong>Preparando a jornada da startup...</strong>
        </div>
      </div>
    );
  }

  if (loadError || !payload) {
    return (
      <div className={styles.page}>
        {header}
        <div className={styles.statePanel}>
          <h2>Jornada indisponível</h2>
          <p>{loadError ?? "Não foi possível carregar essa startup agora."}</p>
          <button className={styles.primaryButton} onClick={loadJourney} type="button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (view === "map") {
    return (
      <div className={styles.page}>
        <div className={styles.mapNavigation}>
          <button
            className={styles.secondaryButton}
            onClick={() => router.replace(startupJourneyHref(startupId))}
            type="button"
          >
            Voltar à Jornada
          </button>
        </div>
        {flashMessage ? (
          <div className={styles.flashMessage} role="status">
            {flashMessage}
          </div>
        ) : null}
        <StartupMapSummary
          initialField={requestedField}
          isSaving={isSavingField}
          onSaveField={patchStartup}
          startup={payload.startup}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {header}
      {flashMessage ? (
        <div className={styles.flashMessage} role="status">
          {flashMessage}
        </div>
      ) : null}
      <JourneyWorkspace
        chapters={payload.chapters}
        currentMilestone={payload.currentMilestone}
        onReviewField={(field) =>
          router.replace(startupJourneyMapHref(startupId, field))
        }
        onSelectStep={setSelectedStepKey}
        progress={payload.progress}
        selectedStepKey={selectedStepKey}
        strategicSummary={payload.strategicSummary}
      />
    </div>
  );
}
