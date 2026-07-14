"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AuthErrorPayload } from "@/lib/auth-types";
import type {
  JourneyPayload,
  JourneyStepSummary,
  StartupSummary,
  StartupUpdatePayload,
} from "@/lib/startup-types";

import { JourneyWorkspace } from "./journey-workspace";
import { StartupMapSummary, type StartupMapField } from "./startup-map-summary";
import styles from "./startup-journey-screen.module.css";

type StartupJourneyScreenProps = {
  onWorkspaceChanged?: () => Promise<boolean>;
  startupId: number;
};

type JourneyTab = "journey" | "initial-map";

const tabOrder: JourneyTab[] = ["journey", "initial-map"];

class JourneyRequestError extends Error {}

export function StartupJourneyScreen({ onWorkspaceChanged, startupId }: StartupJourneyScreenProps) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupSummary | null>(null);
  const [journey, setJourney] = useState<JourneyStepSummary[]>([]);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<JourneyTab>("journey");
  const [selectedStepKey, setSelectedStepKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isSavingField, setIsSavingField] = useState(false);
  const [celebratingStepKey, setCelebratingStepKey] = useState<string | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const journeyTabRef = useRef<HTMLButtonElement>(null);
  const initialMapTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current !== null) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const applyJourneyPayload = useCallback(
    (payload: JourneyPayload, preferredStepKey?: string) => {
      setStartup(payload.startup);
      setJourney(payload.journey);
      setProgress(payload.progress);
      setSelectedStepKey((currentKey) => {
        const requestedKey = preferredStepKey ?? currentKey;
        const requestedStep = payload.journey.find(
          (step) => step.key === requestedKey && step.status !== "pending"
        );

        return (
          requestedStep?.key ??
          payload.journey.find((step) => step.status === "current")?.key ??
          payload.journey.find((step) => step.status === "done")?.key ??
          ""
        );
      });

      if (payload.message) {
        setFlashMessage(payload.message);
      }
    },
    []
  );

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
        setLoadError("Essa startup nao existe ou nao pertence a sua conta.");
        return;
      }

      if (!response.ok) {
        setLoadError("Nao foi possivel carregar essa startup agora.");
        return;
      }

      const payload = (await response.json()) as JourneyPayload;
      applyJourneyPayload(payload);
    } catch {
      setLoadError("Nao foi possivel carregar essa startup agora.");
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
      const payload = (await response.json()) as AuthErrorPayload | StartupUpdatePayload;

      if (response.status === 401) {
        router.replace("/");
        throw new JourneyRequestError("");
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        const firstFieldError = errorPayload.fieldErrors
          ? Object.values(errorPayload.fieldErrors)[0]?.[0]
          : undefined;
        throw new JourneyRequestError(
          firstFieldError ?? errorPayload.message ?? "Nao foi possivel salvar agora."
        );
      }

      const successPayload = payload as StartupUpdatePayload;
      setStartup(successPayload.startup);
      setFlashMessage(successPayload.message);
      void onWorkspaceChanged?.();

      if (field === "problem" || field === "audience") {
        setJourney((current) =>
          current.map((step) => (step.key === field ? { ...step, answer: value } : step))
        );
      }
    } catch (caughtError) {
      if (caughtError instanceof JourneyRequestError) {
        throw caughtError;
      }
      throw new Error("Nao foi possivel salvar agora.");
    } finally {
      setIsSavingField(false);
    }
  }

  async function patchJourneyStep(
    step: JourneyStepSummary,
    answer: string,
    complete: boolean
  ) {
    setIsSavingStep(true);

    try {
      const response = await fetch(`/api/startups/${startupId}/journey/${step.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, complete }),
      });
      const payload = (await response.json()) as AuthErrorPayload | JourneyPayload;

      if (response.status === 401) {
        router.replace("/");
        throw new JourneyRequestError("");
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        throw new JourneyRequestError(
          errorPayload.fieldErrors?.answer?.[0] ??
            errorPayload.message ??
            "Nao foi possivel salvar a etapa agora."
        );
      }

      const successPayload = payload as JourneyPayload;
      const nextStepKey = complete
        ? successPayload.journey.find((item) => item.status === "current")?.key
        : step.key;
      applyJourneyPayload(successPayload, nextStepKey);
      void onWorkspaceChanged?.();

      if (complete) {
        if (celebrationTimeoutRef.current !== null) {
          window.clearTimeout(celebrationTimeoutRef.current);
        }
        setCelebratingStepKey(step.key);
        celebrationTimeoutRef.current = window.setTimeout(() => {
          celebrationTimeoutRef.current = null;
          setCelebratingStepKey(null);
        }, 1500);
      }
    } catch (caughtError) {
      if (caughtError instanceof JourneyRequestError) {
        throw caughtError;
      }
      throw new Error("Nao foi possivel salvar a etapa agora.");
    } finally {
      setIsSavingStep(false);
    }
  }

  function openCurrentStep() {
    const currentStep = journey.find((step) => step.status === "current");
    const fallbackStep = journey.find((step) => step.status === "done");
    setSelectedStepKey(currentStep?.key ?? fallbackStep?.key ?? "");
    setTab("journey");
    journeyTabRef.current?.focus();
  }

  function selectTab(nextTab: JourneyTab, moveFocus = false) {
    setTab(nextTab);
    if (moveFocus) {
      (nextTab === "journey" ? journeyTabRef : initialMapTabRef).current?.focus();
    }
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, activeTab: JourneyTab) {
    const activeIndex = tabOrder.indexOf(activeTab);
    let nextTab: JourneyTab | null = null;

    if (event.key === "ArrowRight") {
      nextTab = tabOrder[(activeIndex + 1) % tabOrder.length];
    } else if (event.key === "ArrowLeft") {
      nextTab = tabOrder[(activeIndex - 1 + tabOrder.length) % tabOrder.length];
    } else if (event.key === "Home") {
      nextTab = tabOrder[0];
    } else if (event.key === "End") {
      nextTab = tabOrder[tabOrder.length - 1];
    }

    if (nextTab) {
      event.preventDefault();
      selectTab(nextTab, true);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div aria-busy="true" aria-live="polite" className={styles.statePanel}>
          <span className={styles.loadingMark} aria-hidden="true" />
          <strong>Preparando a jornada da startup...</strong>
        </div>
      </div>
    );
  }

  if (loadError || !startup) {
    return (
      <div className={styles.page}>
        <div className={styles.statePanel}>
          <h1>Jornada indisponivel</h1>
          <p>{loadError ?? "Nao foi possivel carregar essa startup agora."}</p>
          <button className={styles.primaryButton} onClick={loadJourney} type="button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const completedCount = journey.filter((step) => step.status === "done").length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span>Jornada da startup</span>
          <h1>{startup.currentStageLabel}</h1>
          <p>
            {completedCount} de {journey.length} etapas concluidas
          </p>
        </div>
        <button className={styles.continueButton} onClick={openCurrentStep} type="button">
          Continuar etapa atual
        </button>
      </header>

      {flashMessage ? (
        <div className={styles.flashMessage} role="status">
          {flashMessage}
        </div>
      ) : null}
      {celebratingStepKey ? (
        <div className={styles.celebration} role="status">
          Etapa concluida. A proxima parte da jornada esta pronta.
        </div>
      ) : null}

      <div aria-label="Visoes da startup" className={styles.tabs} role="tablist">
        <button
          aria-controls="journey-panel"
          aria-selected={tab === "journey"}
          id="journey-tab"
          onClick={() => selectTab("journey")}
          onKeyDown={(event) => handleTabKeyDown(event, "journey")}
          ref={journeyTabRef}
          role="tab"
          tabIndex={tab === "journey" ? 0 : -1}
          type="button"
        >
          Jornada
        </button>
        <button
          aria-controls="initial-map-panel"
          aria-selected={tab === "initial-map"}
          id="initial-map-tab"
          onClick={() => selectTab("initial-map")}
          onKeyDown={(event) => handleTabKeyDown(event, "initial-map")}
          ref={initialMapTabRef}
          role="tab"
          tabIndex={tab === "initial-map" ? 0 : -1}
          type="button"
        >
          Mapa inicial
        </button>
      </div>

      <section aria-labelledby={`${tab}-tab`} id={`${tab}-panel`} role="tabpanel">
        {tab === "journey" ? (
          <JourneyWorkspace
            isSaving={isSavingStep}
            journey={journey}
            onSaveStep={patchJourneyStep}
            onSelectStep={setSelectedStepKey}
            progress={progress}
            selectedStepKey={selectedStepKey}
          />
        ) : (
          <StartupMapSummary
            isSaving={isSavingField}
            onSaveField={patchStartup}
            startup={startup}
          />
        )}
      </section>
    </div>
  );
}
