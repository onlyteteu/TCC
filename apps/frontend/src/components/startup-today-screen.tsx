"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ProductIcon, type ProductIconName } from "@/components/product-icon";
import { QuestMark } from "@/components/quest-mark";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { TodayPayload } from "@/lib/startup-types";

import styles from "./startup-today-screen.module.css";

type StartupTodayScreenProps = {
  startupId: number;
};

type WorkMode = "overview" | "interview" | "learning";

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

type NavigationItem = {
  icon: ProductIconName;
  label: string;
  implemented: boolean;
};

const navigationItems: NavigationItem[] = [
  { icon: "home", label: "Hoje", implemented: true },
  { icon: "journey", label: "Jornada", implemented: true },
  { icon: "mission", label: "Missões", implemented: false },
  { icon: "flask", label: "Experimentos", implemented: false },
  { icon: "book", label: "Aprendizados", implemented: false },
  { icon: "chart", label: "Métricas", implemented: false },
  { icon: "file", label: "Documentos", implemented: false },
  { icon: "award", label: "Conquistas", implemented: false },
  { icon: "settings", label: "Configurações", implemented: false },
];

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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function dayCountLabel(count: number) {
  return `${count} ${count === 1 ? "dia" : "dias"}`;
}

function interviewCountLabel(count: number) {
  return `${count} ${count === 1 ? "entrevista" : "entrevistas"}`;
}

function firstFieldError(payload: AuthErrorPayload) {
  if (!payload.fieldErrors) {
    return payload.message;
  }

  return Object.values(payload.fieldErrors)[0]?.[0] ?? payload.message;
}

export function StartupTodayScreen({ startupId }: StartupTodayScreenProps) {
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
  const streak = payload?.gamification.currentStreak ?? 0;
  const streakStatus = payload?.gamification.streakStatus ?? "inactive";
  const levelProgress = payload
    ? Math.round(
        (payload.gamification.xpIntoLevel / payload.gamification.xpPerLevel) * 100
      )
    : 0;

  const streakMessage = useMemo(() => {
    if (streakStatus === "maintained") {
      return "Sequência mantida hoje.";
    }
    if (streakStatus === "at_risk") {
      return "Registre uma atividade hoje para manter.";
    }
    if (streakStatus === "broken") {
      return "Recomece com uma atividade significativa.";
    }
    return "Conclua uma atividade para iniciar sua sequência.";
  }, [streakStatus]);

  function applySuccess(nextPayload: TodayPayload) {
    setPayload(nextPayload);
    setWorkMode("overview");
    setFormError(null);
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
      setFormError("A entrevista não foi registrada. Verifique sua conexão e tente novamente.");
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
      setFormError("A missão não foi concluída. Verifique sua conexão e tente novamente.");
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.loadingPage} aria-busy="true" aria-live="polite">
        <div className={styles.loadingShell}>
          <span className={styles.loadingMark} />
          <div className={styles.loadingLines}>
            <span />
            <span />
          </div>
        </div>
        <span className={styles.srOnly}>Preparando a missão de hoje.</span>
      </main>
    );
  }

  if (loadError || !payload) {
    return (
      <main className={styles.errorPage}>
        <div className={styles.errorPanel}>
          <ProductIcon name="info" />
          <h1>Não conseguimos abrir o trabalho de hoje</h1>
          <p>{loadError ?? "Tente carregar a página novamente."}</p>
          <div className={styles.errorActions}>
            <button className={styles.primaryButton} onClick={loadToday} type="button">
              Tentar novamente
            </button>
            <Link className={styles.secondaryButton} href="/painel">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const userInitials = initials(payload.user.firstName) || "SQ";
  const journeyHref = `/painel/startup/${startupId}/jornada`;

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#today-content">
        Ir para o conteúdo principal
      </a>

      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/painel" aria-label="Startup Quest: voltar ao painel">
          <span className={styles.brandMark}>
            <QuestMark />
          </span>
          <span className={styles.brandName}>Startup Quest</span>
        </Link>

        <nav className={styles.navigation} aria-label="Navegação da startup">
          {navigationItems.map((item) => {
            if (item.label === "Hoje") {
              return (
                <Link className={styles.navItemActive} href={`/painel/startup/${startupId}`} key={item.label}>
                  <ProductIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            if (item.label === "Jornada") {
              return (
                <Link className={styles.navItem} href={journeyHref} key={item.label}>
                  <ProductIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <span
                aria-disabled="true"
                className={styles.navItemDisabled}
                key={item.label}
                title={`${item.label}: planejado para os próximos ciclos`}
              >
                <ProductIcon name={item.icon} />
                <span>{item.label}</span>
                <small>em breve</small>
              </span>
            );
          })}
        </nav>

        <Link className={styles.backToPanel} href="/painel">
          <span aria-hidden="true">←</span>
          <span>Trocar startup</span>
        </Link>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Link className={styles.startupSwitcher} href="/painel">
            <ProductIcon name="building" />
            <span>{payload.startup.name}</span>
            <ProductIcon className={styles.switcherChevron} name="chevron" />
          </Link>

          <div className={styles.topbarProgress} aria-label="Progresso da conta">
            <div className={styles.topbarStat}>
              <ProductIcon className={styles.fireIcon} name="flame" />
              <span>{streak > 0 ? dayCountLabel(streak) : "Comece hoje"}</span>
            </div>
            <div className={styles.topbarStat}>
              <ProductIcon className={styles.levelIcon} name="level" />
              <span>Nível {payload.gamification.level}</span>
            </div>
            <span className={styles.avatar} aria-label={`Conta de ${payload.user.firstName}`}>
              {userInitials}
            </span>
          </div>
        </header>

        <main className={styles.main} id="today-content">
          <header className={styles.pageHeader}>
            <h1>Bom dia, {payload.user.firstName}</h1>
            <p>Hoje, o foco é entender o problema antes de construir a solução.</p>
          </header>

          {payload.message ? (
            <div className={styles.successMessage} role="status">
              <ProductIcon name="check" />
              <span>{payload.message}</span>
            </div>
          ) : null}

          {payload.celebration ? (
            <section className={styles.celebration} aria-live="polite">
              <div className={styles.celebrationMark}>
                <ProductIcon name="flame" />
              </div>
              <div>
                <strong>{payload.celebration.title}</strong>
                <p>
                  +{payload.celebration.xpAwarded} XP · {payload.celebration.unlocked} desbloqueado
                </p>
              </div>
            </section>
          ) : null}

          <div className={styles.primaryGrid}>
            <section className={styles.missionPanel} aria-labelledby="mission-title">
              {mission ? (
                <>
                  <div className={styles.missionHeader}>
                    <div>
                      <span className={styles.missionType}>
                        <ProductIcon name="mission" />
                        {mission.typeLabel}
                      </span>
                      <h2 id="mission-title">{mission.title}</h2>
                      <p className={styles.missionObjective}>{mission.objective}</p>
                    </div>
                    <span className={styles.reward}>+{mission.xpReward} XP</span>
                  </div>

                  <div className={styles.missionProgressLabel}>
                    <span>
                      <strong>{mission.evidenceCount}</strong> de {mission.requiredEvidenceCount} entrevistas
                    </span>
                    <span>{mission.progress}%</span>
                  </div>
                  <div
                    aria-label={`${mission.progress}% da missão concluída`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={mission.progress}
                    className={styles.progressTrack}
                    role="progressbar"
                  >
                    <span style={{ width: `${mission.progress}%` }} />
                  </div>

                  <ol className={styles.missionSteps}>
                    {mission.steps.map((step, index) => (
                      <li className={styles[`step_${step.status}`]} key={step.key}>
                        <span className={styles.stepMarker} aria-hidden="true">
                          {step.status === "completed" ? (
                            <ProductIcon name="check" />
                          ) : step.status === "locked" ? (
                            <ProductIcon name="lock" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div>
                          <strong>{step.title}</strong>
                          <span>{step.description}</span>
                        </div>
                        <small>
                          {step.status === "completed"
                            ? "Concluído"
                            : step.status === "locked"
                              ? "Bloqueado"
                              : step.status === "current"
                                ? "Em andamento"
                                : "Disponível"}
                        </small>
                      </li>
                    ))}
                  </ol>

                  <div className={styles.tip}>
                    <ProductIcon name="info" />
                    <p>{mission.contextualTip}</p>
                  </div>

                  {workMode === "interview" ? (
                    <form className={styles.workForm} onSubmit={submitInterview}>
                      <div className={styles.formHeading}>
                        <div>
                          <h3>Registrar entrevista</h3>
                          <p>Registre o que aconteceu. A qualidade da evidência importa mais que a quantidade de texto.</p>
                        </div>
                        <span>{mission.evidenceCount + 1}ª entrevista</span>
                      </div>

                      <div className={styles.formGrid}>
                        <label>
                          <span>Nome ou identificação</span>
                          <input
                            autoFocus
                            disabled={isSaving}
                            maxLength={120}
                            onChange={(event) =>
                              setInterview((current) => ({
                                ...current,
                                intervieweeName: event.target.value,
                              }))
                            }
                            placeholder="Ex.: Cliente 01 ou João"
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
                              setInterview((current) => ({
                                ...current,
                                intervieweeProfile: event.target.value,
                              }))
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
                              setInterview((current) => ({
                                ...current,
                                occurredOn: event.target.value,
                              }))
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
                              setInterview((current) => ({
                                ...current,
                                context: event.target.value,
                              }))
                            }
                            placeholder="Ex.: conversa de 20 minutos por vídeo"
                            value={interview.context}
                          />
                        </label>
                      </div>

                      <label className={styles.fullField}>
                        <span>O que a pessoa contou?</span>
                        <textarea
                          disabled={isSaving}
                          onChange={(event) =>
                            setInterview((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          placeholder="Registre situações, frequência da dor, alternativas usadas e frases importantes."
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
                        <button
                          className={styles.secondaryButton}
                          disabled={isSaving}
                          onClick={() => {
                            setWorkMode("overview");
                            setFormError(null);
                          }}
                          type="button"
                        >
                          Continuar depois
                        </button>
                      </div>
                    </form>
                  ) : workMode === "learning" ? (
                    <form className={styles.workForm} onSubmit={submitLearning}>
                      <div className={styles.formHeading}>
                        <div>
                          <h3>Resumir aprendizados</h3>
                          <p>Transforme as cinco conversas em uma conclusão que oriente a próxima decisão.</p>
                        </div>
                      </div>

                      <label className={styles.fullField}>
                        <span>Qual padrão apareceu nas entrevistas?</span>
                        <textarea
                          autoFocus
                          disabled={isSaving}
                          onChange={(event) =>
                            setLearning((current) => ({ ...current, content: event.target.value }))
                          }
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
                            onChange={(event) =>
                              setLearning((current) => ({ ...current, impact: event.target.value }))
                            }
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
                            onChange={(event) =>
                              setLearning((current) => ({
                                ...current,
                                nextAction: event.target.value,
                              }))
                            }
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
                        <button
                          className={styles.secondaryButton}
                          disabled={isSaving}
                          onClick={() => {
                            setWorkMode("overview");
                            setFormError(null);
                          }}
                          type="button"
                        >
                          Continuar depois
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className={styles.missionActions}>
                      {mission.status === "completed" ? (
                        <Link className={styles.primaryButton} href={journeyHref}>
                          Refinar proposta de valor
                          <ProductIcon name="chevron" />
                        </Link>
                      ) : mission.canComplete ? (
                        <button
                          className={styles.primaryButton}
                          disabled={isCompleting}
                          onClick={() => void completeMission()}
                          type="button"
                        >
                          <ProductIcon name="check" />
                          {isCompleting ? "Concluindo missão..." : "Concluir missão"}
                        </button>
                      ) : mission.canAddLearning ? (
                        <button
                          className={styles.primaryButton}
                          onClick={() => setWorkMode("learning")}
                          type="button"
                        >
                          <ProductIcon name="book" />
                          Registrar aprendizado
                        </button>
                      ) : (
                        <button
                          className={styles.primaryButton}
                          onClick={() => setWorkMode("interview")}
                          type="button"
                        >
                          <ProductIcon name="plus" />
                          Registrar entrevista
                        </button>
                      )}

                      <details className={styles.missionDetails}>
                        <summary>Entender esta missão</summary>
                        <div>
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
                      </details>
                    </div>
                  )}

                  {formError && workMode === "overview" ? (
                    <p className={styles.formError}>{formError}</p>
                  ) : null}
                </>
              ) : (
                <div className={styles.emptyMission}>
                  <ProductIcon name="mission" />
                  <h2 id="mission-title">Preparando sua próxima missão</h2>
                  <p>A plataforma ainda não encontrou uma missão disponível para esta startup.</p>
                  <Link className={styles.secondaryButton} href={journeyHref}>
                    Revisar a Jornada
                  </Link>
                </div>
              )}
            </section>

            <aside className={styles.statusRail} aria-label="Progresso e consistência">
              <section className={styles.statusPanel}>
                <div className={styles.streakRow}>
                  <span className={styles.streakMark}>
                    <ProductIcon name="flame" />
                  </span>
                  <div>
                    <strong>{streak > 0 ? dayCountLabel(streak) : "Comece hoje"}</strong>
                    <p>{streakMessage}</p>
                  </div>
                </div>
              </section>

              <section className={styles.statusPanel}>
                <div className={styles.levelRow}>
                  <ProductIcon name="level" />
                  <div>
                    <strong>Nível {payload.gamification.level}</strong>
                    <span>
                      {payload.gamification.xpIntoLevel}/{payload.gamification.xpPerLevel} XP
                    </span>
                  </div>
                </div>
                <div
                  aria-label={`${levelProgress}% do nível concluído`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={levelProgress}
                  className={styles.levelTrack}
                  role="progressbar"
                >
                  <span style={{ width: `${levelProgress}%` }} />
                </div>
              </section>

              <section className={styles.statusPanel}>
                <div className={styles.phaseHeader}>
                  <div>
                    <strong>Descoberta</strong>
                    <span>{payload.journey.progress}%</span>
                  </div>
                  <p>Etapa atual: {payload.journey.currentStepLabel ?? "Jornada inicial concluída"}</p>
                </div>

                <div className={styles.phaseDots} aria-hidden="true">
                  {Array.from({ length: payload.journey.totalSteps }).map((_, index) => (
                    <span
                      className={index < payload.journey.completedSteps ? styles.phaseDotDone : ""}
                      key={index}
                    />
                  ))}
                </div>

                <div className={styles.healthCue}>
                  <ProductIcon name={mission?.evidenceCount ? "check" : "info"} />
                  <p>
                    {mission?.evidenceCount
                      ? `Você já registrou ${interviewCountLabel(mission.evidenceCount)}. Continue até identificar padrões.`
                      : "A saúde desta fase cresce com entrevistas e evidências registradas."}
                  </p>
                </div>
              </section>
            </aside>
          </div>

          <div className={styles.secondaryGrid}>
            <section className={styles.secondarySection}>
              <div className={styles.sectionTitleRow}>
                <h2>Próximos passos</h2>
                <Link href={journeyHref}>Ver Jornada</Link>
              </div>

              <div className={styles.nextStepRow}>
                <span className={payload.nextUnlock.available ? styles.nextStepAvailable : styles.nextStepLocked}>
                  <ProductIcon name={payload.nextUnlock.available ? "check" : "lock"} />
                </span>
                <div>
                  <strong>{payload.nextUnlock.title}</strong>
                  <p>{payload.nextUnlock.description}</p>
                </div>
                <small>{payload.nextUnlock.available ? "Disponível" : "Bloqueado"}</small>
              </div>

              <div className={styles.nextStepRow}>
                <span className={mission?.canAddLearning ? styles.nextStepAvailable : styles.nextStepLocked}>
                  <ProductIcon name="book" />
                </span>
                <div>
                  <strong>Registrar aprendizado</strong>
                  <p>Consolide os padrões das entrevistas antes de tomar uma decisão.</p>
                </div>
                {mission?.canAddLearning ? (
                  <button onClick={() => setWorkMode("learning")} type="button">
                    Registrar
                  </button>
                ) : (
                  <small>Após 5 entrevistas</small>
                )}
              </div>
            </section>

            <section className={styles.secondarySection}>
              <div className={styles.sectionTitleRow}>
                <h2>Atividade recente</h2>
              </div>

              {payload.recentActivities.length ? (
                <ul className={styles.activityList}>
                  {payload.recentActivities.map((activity) => (
                    <li key={activity.id}>
                      <span className={styles.activityIcon}>
                        <ProductIcon
                          name={activity.kind === "learning_recorded" ? "book" : "check"}
                        />
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
                    <strong>Seu histórico começa com trabalho real</strong>
                    <p>Registre a primeira entrevista para criar a primeira atividade.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
