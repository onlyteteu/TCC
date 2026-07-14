"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { ProductIcon } from "@/components/product-icon";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { ActivitySummary, TodayPayload } from "@/lib/startup-types";

import { FounderProgressRail } from "./founder-progress-rail";
import { MissionFocusPanel } from "./mission-focus-panel";
import styles from "./startup-home-screen.module.css";

type StartupHomeScreenProps = {
  startupId: number;
};

type WorkMode = "overview" | "interview" | "learning" | "details";

type InterviewDraft = {
  intervieweeName: string;
  intervieweeProfile: string;
  context: string;
  notes: string;
  occurredOn: string;
};

type LearningDraft = {
  confidence: "low" | "medium" | "high";
  content: string;
  impact: string;
  nextAction: string;
};

function localDateValue() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

const emptyInterview = (): InterviewDraft => ({
  intervieweeName: "",
  intervieweeProfile: "",
  context: "",
  notes: "",
  occurredOn: localDateValue(),
});

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

function formatActivityDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const prefix = sameDay(date, today)
    ? "Hoje"
    : sameDay(date, yesterday)
      ? "Ontem"
      : new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
        }).format(date);

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${prefix}, ${time}`;
}

function RecentActivity({ activities }: { activities: ActivitySummary[] }) {
  return (
    <section className={styles.secondarySection}>
      <h2>Atividade recente</h2>
      {activities.length ? (
        <ul className={styles.activityList}>
          {activities.map((activity) => (
            <li key={activity.id}>
              <span className={styles.activityIcon}>
                <ProductIcon name={activity.kind === "learning_recorded" ? "book" : "check"} />
              </span>
              <div>
                <strong>{activity.kindLabel}</strong>
                <p>{activity.description}</p>
              </div>
              <time dateTime={activity.occurredAt}>{formatActivityDate(activity.occurredAt)}</time>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyActivity}>
          <ProductIcon name="mission" />
          <div>
            <strong>Seu historico comeca com trabalho real</strong>
            <p>Registre a primeira entrevista para criar a primeira atividade.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function NextUnlock({ unlock }: { unlock: TodayPayload["nextUnlock"] }) {
  return (
    <section className={styles.secondarySection}>
      <h2>Proximo desbloqueio</h2>
      <div className={styles.unlockRow}>
        <span className={unlock.available ? styles.unlockAvailable : styles.unlockLocked}>
          <ProductIcon name={unlock.available ? "check" : "lock"} />
        </span>
        <div>
          <strong>{unlock.title}</strong>
          <p>{unlock.description}</p>
        </div>
        <small>{unlock.available ? "Disponivel" : "Bloqueado"}</small>
      </div>
    </section>
  );
}

export function StartupHomeScreen({ startupId }: StartupHomeScreenProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<TodayPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>("overview");
  const [interview, setInterview] = useState<InterviewDraft>(emptyInterview);
  const [learning, setLearning] = useState<LearningDraft>(emptyLearning);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
        setLoadError("Essa startup nao existe ou nao pertence a sua conta.");
        return;
      }
      if (!response.ok) {
        const error = (await response.json()) as AuthErrorPayload;
        setLoadError(error.message ?? "Nao foi possivel carregar o trabalho de hoje.");
        return;
      }

      setPayload((await response.json()) as TodayPayload);
    } catch {
      setLoadError("Nao foi possivel carregar o trabalho de hoje.");
    } finally {
      setIsLoading(false);
    }
  }, [router, startupId]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const mission = payload?.mission ?? null;

  function closeWorkDialog() {
    setWorkMode("overview");
    setFormError(null);
  }

  function applySuccess(nextPayload: TodayPayload) {
    setPayload(nextPayload);
    closeWorkDialog();
  }

  async function submitInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mission) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/startups/${startupId}/missions/${mission.key}/evidence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(interview),
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

      setInterview(emptyInterview());
      applySuccess(nextPayload as TodayPayload);
    } catch {
      setFormError("A entrevista nao foi registrada. Verifique sua conexao e tente novamente.");
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
      setFormError("O aprendizado nao foi registrado. Verifique sua conexao e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function completeMission() {
    if (!mission) {
      return;
    }

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
      setFormError("A missao nao foi concluida. Verifique sua conexao e tente novamente.");
    } finally {
      setIsCompleting(false);
    }
  }

  function handleOpenMissionStep(stepKey: string) {
    setFormError(null);
    setWorkMode(stepKey === "interviews" ? "interview" : stepKey === "review" ? "learning" : "details");
  }

  function handlePrimaryMissionAction() {
    if (!mission) {
      return;
    }
    if (mission.canComplete) {
      void completeMission();
      return;
    }
    setWorkMode(mission.canAddLearning ? "learning" : "interview");
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
          : "Entender esta missao";

    return (
      <div className={styles.dialogBackdrop} onMouseDown={closeWorkDialog}>
        <section
          aria-labelledby="work-dialog-title"
          aria-modal="true"
          className={styles.workDialog}
          onMouseDown={(event) => event.stopPropagation()}
          role="dialog"
        >
          <div className={styles.dialogHeader}>
            <div>
              <h2 id="work-dialog-title">{title}</h2>
              {workMode === "interview" ? (
                <p>Registre o que aconteceu. A qualidade da evidencia importa mais que a quantidade de texto.</p>
              ) : workMode === "learning" ? (
                <p>Transforme as conversas em uma conclusao que oriente a proxima decisao.</p>
              ) : (
                <p>{mission.objective}</p>
              )}
            </div>
            <button aria-label="Fechar" className={styles.closeButton} onClick={closeWorkDialog} type="button">
              x
            </button>
          </div>

          {workMode === "interview" ? (
            <form className={styles.workForm} onSubmit={submitInterview}>
              <div className={styles.formGrid}>
                <label>
                  <span>Nome ou identificacao</span>
                  <input
                    autoFocus
                    disabled={isSaving}
                    maxLength={120}
                    onChange={(event) =>
                      setInterview((current) => ({ ...current, intervieweeName: event.target.value }))
                    }
                    placeholder="Ex.: Cliente 01 ou Joao"
                    required
                    value={interview.intervieweeName}
                  />
                </label>
                <label>
                  <span>Perfil da pessoa</span>
                  <input
                    disabled={isSaving}
                    maxLength={180}
                    onChange={(event) =>
                      setInterview((current) => ({ ...current, intervieweeProfile: event.target.value }))
                    }
                    placeholder="Ex.: dono de restaurante pequeno"
                    value={interview.intervieweeProfile}
                  />
                </label>
                <label>
                  <span>Data da conversa</span>
                  <input
                    disabled={isSaving}
                    max={localDateValue()}
                    onChange={(event) =>
                      setInterview((current) => ({ ...current, occurredOn: event.target.value }))
                    }
                    required
                    type="date"
                    value={interview.occurredOn}
                  />
                </label>
                <label>
                  <span>Contexto</span>
                  <input
                    disabled={isSaving}
                    maxLength={300}
                    onChange={(event) =>
                      setInterview((current) => ({ ...current, context: event.target.value }))
                    }
                    placeholder="Ex.: conversa de 20 minutos por video"
                    value={interview.context}
                  />
                </label>
              </div>
              <label className={styles.fullField}>
                <span>O que a pessoa contou?</span>
                <textarea
                  disabled={isSaving}
                  onChange={(event) =>
                    setInterview((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Registre situacoes, frequencia da dor, alternativas usadas e frases importantes."
                  required
                  rows={5}
                  value={interview.notes}
                />
              </label>
              {formError ? <p className={styles.formError}>{formError}</p> : null}
              <div className={styles.formActions}>
                <button className={styles.primaryButton} disabled={isSaving} type="submit">
                  {isSaving ? "Registrando entrevista..." : "Registrar entrevista"}
                </button>
                <button className={styles.secondaryButton} disabled={isSaving} onClick={closeWorkDialog} type="button">
                  Continuar depois
                </button>
              </div>
            </form>
          ) : workMode === "learning" ? (
            <form className={styles.workForm} onSubmit={submitLearning}>
              <label className={styles.fullField}>
                <span>Qual padrao apareceu nas entrevistas?</span>
                <textarea
                  autoFocus
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
                    placeholder="Explique o impacto sobre o problema, publico ou solucao."
                    required
                    rows={4}
                    value={learning.impact}
                  />
                </label>
                <label>
                  <span>Qual deve ser a proxima acao?</span>
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
                <span>Confianca nesse aprendizado</span>
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
                  <option value="low">Baixa - ainda ha poucos sinais</option>
                  <option value="medium">Media - o padrao apareceu mais de uma vez</option>
                  <option value="high">Alta - o padrao foi recorrente e consistente</option>
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
              <strong>Criterio de conclusao</strong>
              <p>{mission.completionCriteria}</p>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingPage} aria-busy="true" aria-live="polite">
        <span className={styles.loadingMark} />
        <span className={styles.srOnly}>Preparando a missao de hoje.</span>
      </div>
    );
  }

  if (loadError || !payload) {
    return (
      <section className={styles.errorPanel}>
        <ProductIcon name="info" />
        <h1>Nao conseguimos abrir o trabalho de hoje</h1>
        <p>{loadError ?? "Tente carregar a pagina novamente."}</p>
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
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Bom dia, {payload.user.firstName}</h1>
        <p>Hoje, o foco e entender o problema antes de construir a solucao.</p>
      </header>

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
              +{payload.celebration.xpAwarded} XP - {payload.celebration.unlocked} desbloqueado
            </p>
          </div>
        </section>
      ) : null}

      <div
        aria-hidden={workMode !== "overview" ? "true" : undefined}
        className={styles.primaryGrid}
      >
        {payload.mission ? (
          <MissionFocusPanel
            mission={payload.mission}
            onOpenStep={handleOpenMissionStep}
            onPrimaryAction={handlePrimaryMissionAction}
          />
        ) : (
          <section className={styles.missionUnavailable}>
            <h2>Sua proxima missao ainda esta bloqueada</h2>
            <p>Continue a etapa atual da Jornada para liberar uma nova missao.</p>
            <Link href={`/painel/startup/${startupId}/jornada`}>Continuar Jornada</Link>
          </section>
        )}
        <FounderProgressRail account={payload.gamification} journey={payload.journey} />
      </div>

      <div
        aria-hidden={workMode !== "overview" ? "true" : undefined}
        className={styles.secondaryGrid}
      >
        <RecentActivity activities={payload.recentActivities} />
        <NextUnlock unlock={payload.nextUnlock} />
      </div>

      {formError && workMode === "overview" ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      {isCompleting ? <p className={styles.srOnly}>Concluindo missao...</p> : null}
      {workMode !== "overview" ? renderWorkDialog() : null}
    </div>
  );
}
