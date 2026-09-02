"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ProductIcon } from "@/components/product-icon";
import type { AuthErrorPayload } from "@/lib/auth-types";
import { missionExecutionHref } from "@/lib/startup-navigation";
import type { TodayPayload } from "@/lib/startup-types";
import { clearTestWorkspaceDrafts } from "@/lib/test-workspace-storage";

import { GuidedInterviewFlow } from "./guided-interview-flow";
import type { InterviewEvidencePayload } from "./guided-interview-model";
import { MissionFocusPanel } from "./mission-focus-panel";
import { RecentActivity } from "./recent-activity";
import { StartupProgressPanel } from "./startup-progress-panel";
import styles from "./startup-home-screen.module.css";
import { TestWorkspaceBanner } from "./test-workspace-banner";

type StartupHomeScreenProps = {
  onWorkspaceChanged?: () => Promise<boolean>;
  onWorkspaceModalChange?: (open: boolean) => void;
  startupId: number;
};

type WorkMode = "overview" | "interview" | "learning" | "details";

type LearningDraft = {
  confidence: "low" | "medium" | "high";
  content: string;
  impact: string;
  nextAction: string;
};

const emptyLearning = (): LearningDraft => ({
  confidence: "medium",
  content: "",
  impact: "",
  nextAction: "",
});

function firstFieldError(payload: AuthErrorPayload) {
  if (!payload.fieldErrors) {
    return payload.message;
  }

  return Object.values(payload.fieldErrors)[0]?.[0] ?? payload.message;
}

function homeContextMessage(payload: TodayPayload) {
  if (payload.mission) {
    return payload.mission.objective;
  }
  if (payload.missionState === "arc_complete") {
    return "Você concluiu o arco disponível e já pode revisar o caminho construído.";
  }
  return "Conclua a etapa atual da Jornada para liberar a próxima missão.";
}

export function StartupHomeScreen({
  onWorkspaceChanged,
  onWorkspaceModalChange,
  startupId,
}: StartupHomeScreenProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<TodayPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>("overview");
  const [learning, setLearning] = useState<LearningDraft>(emptyLearning);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTestResetOpen, setIsTestResetOpen] = useState(false);
  const completionRequestRef = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(
    () => () => {
      onWorkspaceModalChange?.(false);
    },
    [onWorkspaceModalChange]
  );

  const loadToday = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/startups/${startupId}/today`, { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (response.status === 404) {
        setLoadError("Essa startup não existe ou não pertence à sua conta.");
        return;
      }
      if (!response.ok) {
        const error = (await response.json()) as AuthErrorPayload;
        setLoadError(error.message ?? "Não foi possível carregar o trabalho de hoje.");
        return;
      }

      setPayload((await response.json()) as TodayPayload);
    } catch {
      setLoadError("Não foi possível carregar o trabalho de hoje.");
    } finally {
      setIsLoading(false);
    }
  }, [router, startupId]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const mission = payload?.mission ?? null;

  useEffect(() => {
    if (workMode === "overview") {
      const trigger = dialogTriggerRef.current;
      dialogTriggerRef.current = null;
      trigger?.focus();
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const initialTarget =
      workMode === "details"
        ? dialog
        : dialog.querySelector<HTMLElement>("[data-initial-focus]") ?? dialog;
    initialTarget.focus();
  }, [workMode]);

  function openWorkDialog(mode: Exclude<WorkMode, "overview">) {
    dialogTriggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFormError(null);
    onWorkspaceModalChange?.(true);
    setWorkMode(mode);
  }

  function closeWorkDialog() {
    onWorkspaceModalChange?.(false);
    setWorkMode("overview");
    setFormError(null);
  }

  function applySuccess(nextPayload: TodayPayload) {
    setPayload(nextPayload);
    closeWorkDialog();
    void onWorkspaceChanged?.();
  }

  const handleTestWorkspaceModalChange = useCallback(
    (open: boolean) => {
      setIsTestResetOpen(open);
      onWorkspaceModalChange?.(open);
    },
    [onWorkspaceModalChange]
  );

  async function resetTestWorkspace() {
    let response: Response;
    try {
      response = await fetch(`/api/startups/${startupId}/test-reset`, {
        body: JSON.stringify({ confirmation: "RESET_TEST_WORKSPACE" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    } catch {
      throw new Error(
        "Não foi possível reiniciar o ambiente. Verifique sua conexão e tente novamente."
      );
    }

    const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;
    if (response.status === 401) {
      router.replace("/");
      throw new Error("Sua sessão expirou. Entre novamente para continuar.");
    }
    if (!response.ok) {
      throw new Error(firstFieldError(nextPayload as AuthErrorPayload));
    }

    const todayPayload = nextPayload as TodayPayload;
    clearTestWorkspaceDrafts(startupId);
    setPayload(todayPayload);
    void onWorkspaceChanged?.();
  }

  async function completeTestMission() {
    let response: Response;
    try {
      response = await fetch(
        `/api/startups/${startupId}/test-complete-mission`,
        { method: "POST" }
      );
    } catch {
      throw new Error(
        "Não foi possível concluir a missão de teste. Verifique sua conexão e tente novamente."
      );
    }

    const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;
    if (response.status === 401) {
      router.replace("/");
      throw new Error("Sua sessão expirou. Entre novamente para continuar.");
    }
    if (!response.ok) {
      throw new Error(firstFieldError(nextPayload as AuthErrorPayload));
    }

    setPayload(nextPayload as TodayPayload);
    void onWorkspaceChanged?.();
  }

  async function submitInterview(
    nextInterview: InterviewEvidencePayload
  ): Promise<string> {
    if (!mission) {
      throw new Error("A missão de entrevistas não está disponível.");
    }

    setIsSaving(true);

    try {
      let response: Response;
      try {
        response = await fetch(
          `/api/startups/${startupId}/missions/${mission.key}/evidence`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextInterview),
          }
        );
      } catch {
        throw new Error(
          "A entrevista não foi registrada. Verifique sua conexão e tente novamente."
        );
      }
      const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;

      if (response.status === 401) {
        router.replace("/");
        throw new Error("Sua sessão expirou. Entre novamente para continuar.");
      }
      if (!response.ok) {
        throw new Error(firstFieldError(nextPayload as AuthErrorPayload));
      }

      const todayPayload = nextPayload as TodayPayload;
      setPayload(todayPayload);
      void onWorkspaceChanged?.();
      return todayPayload.message ?? "Entrevista registrada. Você ganhou 10 XP.";
    } finally {
      setIsSaving(false);
    }
  }

  async function submitLearning(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mission) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/startups/${startupId}/missions/${mission.key}/learning`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(learning),
        }
      );
      const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;

      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (!response.ok) {
        setFormError(firstFieldError(nextPayload as AuthErrorPayload));
        return;
      }

      setLearning(emptyLearning());
      applySuccess(nextPayload as TodayPayload);
    } catch {
      setFormError("O aprendizado não foi registrado. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function completeMission() {
    if (!mission || isCompleting || completionRequestRef.current) {
      return;
    }

    completionRequestRef.current = true;
    setIsCompleting(true);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/startups/${startupId}/missions/${mission.key}/complete`,
        { method: "POST" }
      );
      const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;

      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (!response.ok) {
        setFormError((nextPayload as AuthErrorPayload).message);
        return;
      }

      applySuccess(nextPayload as TodayPayload);
    } catch {
      setFormError("A missão não foi concluída. Verifique sua conexão e tente novamente.");
    } finally {
      completionRequestRef.current = false;
      setIsCompleting(false);
    }
  }

  function handleOpenMissionStep(stepKey: string) {
    if (mission && mission.actionType !== "interviews") {
      router.push(missionExecutionHref(startupId, mission.key, mission.actionType));
      return;
    }
    openWorkDialog(
      stepKey === "interviews" ? "interview" : stepKey === "learning" ? "learning" : "details"
    );
  }

  function handlePrimaryMissionAction() {
    if (!mission) {
      return;
    }
    if (mission.actionType !== "interviews") {
      router.push(missionExecutionHref(startupId, mission.key, mission.actionType));
      return;
    }
    if (mission.canComplete) {
      void completeMission();
      return;
    }
    openWorkDialog(mission.canAddLearning ? "learning" : "interview");
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeWorkDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function renderWorkDialog() {
    if (!mission || workMode === "overview") {
      return null;
    }

    const title =
      workMode === "interview"
        ? "Registrar entrevista"
        : workMode === "learning"
          ? "Resumir aprendizados"
          : "Entender esta missão";

    return (
      <div className={styles.dialogBackdrop} onMouseDown={closeWorkDialog}>
        <section
          aria-labelledby="work-dialog-title"
          aria-modal="true"
          className={styles.workDialog}
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <div className={styles.dialogHeader}>
            <div>
              <h2 id="work-dialog-title">{title}</h2>
              {workMode === "interview" ? (
                <span className={styles.dialogContext}>
                  {mission.evidenceCount + 1}ª entrevista
                </span>
              ) : workMode === "learning" ? (
                <p>Transforme as cinco conversas em uma conclusão que oriente a próxima decisão.</p>
              ) : (
                <p>{mission.objective}</p>
              )}
            </div>
            <button aria-label="Fechar" className={styles.closeButton} onClick={closeWorkDialog} type="button">
              x
            </button>
          </div>

          {workMode === "interview" ? (
            <GuidedInterviewFlow
              evidenceCount={mission.evidenceCount}
              isSaving={isSaving}
              missionKey={mission.key}
              onClose={closeWorkDialog}
              onSubmit={submitInterview}
              startupId={startupId}
            />
          ) : workMode === "learning" ? (
            <form className={styles.workForm} onSubmit={submitLearning}>
              <label className={styles.fullField}>
                <span>Qual padrão apareceu nas entrevistas?</span>
                <textarea
                  data-initial-focus
                  disabled={isSaving}
                  onChange={(event) => setLearning((current) => ({ ...current, content: event.target.value }))}
                  placeholder="Ex.: quatro das cinco pessoas enfrentam o problema toda semana."
                  required
                  rows={4}
                  value={learning.content}
                />
              </label>
              <div className={styles.formGridLearning}>
                <label>
                  <span>O que isso muda na startup?</span>
                  <textarea
                    disabled={isSaving}
                    onChange={(event) => setLearning((current) => ({ ...current, impact: event.target.value }))}
                    placeholder="Explique o impacto sobre o problema, público ou solução."
                    required
                    rows={4}
                    value={learning.impact}
                  />
                </label>
                <label>
                  <span>Qual deve ser a próxima ação?</span>
                  <textarea
                    disabled={isSaving}
                    onChange={(event) => setLearning((current) => ({ ...current, nextAction: event.target.value }))}
                    placeholder="Ex.: ajustar a proposta de valor para destacar..."
                    required
                    rows={4}
                    value={learning.nextAction}
                  />
                </label>
              </div>
              <label className={styles.confidenceField}>
                <span>Confiança nesse aprendizado</span>
                <select
                  disabled={isSaving}
                  onChange={(event) =>
                    setLearning((current) => ({
                      ...current,
                      confidence: event.target.value as LearningDraft["confidence"],
                    }))
                  }
                  value={learning.confidence}
                >
                  <option value="low">Baixa · ainda há poucos sinais</option>
                  <option value="medium">Média · o padrão apareceu mais de uma vez</option>
                  <option value="high">Alta · o padrão foi recorrente e consistente</option>
                </select>
              </label>
              {formError ? <p className={styles.formError}>{formError}</p> : null}
              <div className={styles.formActions}>
                <button className={styles.primaryButton} disabled={isSaving} type="submit">
                  {isSaving ? "Registrando aprendizado..." : "Registrar aprendizado"}
                </button>
                <button className={styles.secondaryButton} disabled={isSaving} onClick={closeWorkDialog} type="button">
                  Continuar depois
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.missionDetails}>
              <strong>Por que isso importa</strong>
              <p>{mission.whyItMatters}</p>
              <strong>Como executar</strong>
              <ol>
                {mission.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
              <strong>Critério de conclusão</strong>
              <p>{mission.completionCriteria}</p>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        aria-label="Carregando missão de hoje"
        aria-live="polite"
        className={styles.loadingPage}
        role="status"
      >
        <span aria-hidden="true" className={styles.homeSkeletonHeading} />
        <div className={styles.homeSkeletonGrid}>
          <span aria-hidden="true" className={styles.homeSkeletonMission} />
          <span aria-hidden="true" className={styles.homeSkeletonProgress} />
        </div>
        <span className={styles.srOnly}>Preparando a missão de hoje.</span>
      </div>
    );
  }

  if (loadError || !payload) {
    return (
      <section className={styles.errorPanel}>
        <ProductIcon name="info" />
        <h1>Não conseguimos abrir o trabalho de hoje</h1>
        <p>{loadError ?? "Tente carregar a página novamente."}</p>
        <div className={styles.formActions}>
          <button className={styles.primaryButton} onClick={loadToday} type="button">
            Tentar novamente
          </button>
          <Link className={styles.secondaryButton} href="/painel">
            Voltar ao painel
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <div
        aria-hidden={workMode !== "overview" || isTestResetOpen ? "true" : undefined}
        className={styles.page}
        inert={workMode !== "overview" || isTestResetOpen ? true : undefined}
      >
      <header className={styles.pageHeader}>
        <h1>Olá, {payload.user.firstName}</h1>
        <p>{homeContextMessage(payload)}</p>
      </header>

      {payload.testWorkspace.canReset ? (
        <TestWorkspaceBanner
          onCompleteMission={payload.missionState === "active" ? completeTestMission : undefined}
          onModalChange={handleTestWorkspaceModalChange}
          onReset={resetTestWorkspace}
        />
      ) : null}

      {payload.message ? (
        <div className={styles.successMessage} role="status">
          <ProductIcon name="check" />
          <span>{payload.message}</span>
        </div>
      ) : null}

      {payload.celebration ? (
        <section className={styles.celebration} aria-live="polite">
          <ProductIcon name="flame" />
          <div>
            <strong>{payload.celebration.title}</strong>
            <p>
              +{payload.celebration.xpAwarded} XP · {payload.celebration.unlocked} desbloqueado
            </p>
          </div>
        </section>
      ) : null}

      <div className={styles.primaryGrid}>
        {payload.mission ? (
          <MissionFocusPanel
            isPrimaryActionPending={isCompleting}
            mission={payload.mission}
            onOpenStep={handleOpenMissionStep}
            onPrimaryAction={handlePrimaryMissionAction}
            startupId={startupId}
          />
        ) : payload.missionState === "arc_complete" ? (
          <section className={styles.missionUnavailable}>
            <h2>Arco de Descoberta concluído</h2>
            <p>Você concluiu as missões disponíveis neste incremento.</p>
            <Link href={`/painel/startup/${startupId}/missoes`}>Rever missões</Link>
          </section>
        ) : (
          <section className={styles.missionUnavailable}>
            <h2>Sua próxima missão ainda está bloqueada</h2>
            <p>Continue a etapa atual da Jornada para liberar uma nova missão.</p>
            <Link href={`/painel/startup/${startupId}/jornada`}>Continuar Jornada</Link>
          </section>
        )}
        <StartupProgressPanel
          journey={payload.journey}
          nextUnlock={payload.nextUnlock}
          startupId={startupId}
        />
      </div>

      <RecentActivity activities={payload.recentActivities} />

      {formError && workMode === "overview" ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      {isCompleting ? <p className={styles.srOnly}>Concluindo missão...</p> : null}
      </div>
      {workMode !== "overview" ? createPortal(renderWorkDialog(), document.body) : null}
    </>
  );
}
