"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { QuestMark } from "@/components/quest-mark";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type {
  JourneyPayload,
  JourneyStepSummary,
  StartupSummary,
  StartupUpdatePayload,
} from "@/lib/startup-types";

import styles from "./startup-detail-screen.module.css";

type StartupDetailScreenProps = {
  startupId: number;
};

type EditableField = "description" | "segment" | "problem" | "audience";

type MapBlock = {
  field: EditableField;
  helper: string;
  label: string;
  multiline: boolean;
};

type StepGuide = {
  helper: string;
  placeholder: string;
  question: string;
};

const mapBlocks: MapBlock[] = [
  {
    field: "description",
    helper: "A ideia central, contada como para um amigo.",
    label: "Ideia",
    multiline: true,
  },
  {
    field: "segment",
    helper: "O territorio inicial dessa startup.",
    label: "Segmento",
    multiline: false,
  },
  {
    field: "problem",
    helper: "A dor que essa startup quer fazer desaparecer.",
    label: "Problema",
    multiline: true,
  },
  {
    field: "audience",
    helper: "Quem sente essa dor primeiro.",
    label: "Publico inicial",
    multiline: true,
  },
];

const stepGuides: Record<string, StepGuide> = {
  problem: {
    helper: "Foque no prejuizo, atraso, medo, incomodo ou desperdicio. A solucao vem depois.",
    placeholder: "Ex: Restaurantes pequenos compram ingrediente duplicado porque nao sabem o que ja existe no estoque.",
    question: "Que dor precisa desaparecer?",
  },
  audience: {
    helper: "Junte pessoa, contexto e sinal da dor. Publico bom parece gente real, nao estatistica.",
    placeholder: "Ex: Donos de restaurantes pequenos, com ate 15 funcionarios, que controlam estoque por caderno.",
    question: "Quem sente essa dor primeiro?",
  },
  value: {
    helper: "Uma frase: para quem, o que sua startup entrega e por que e melhor que o jeito atual.",
    placeholder: "Ex: Para donos de restaurantes pequenos, o Estoca reduz desperdicio em 30% sem precisar de planilhas.",
    question: "Qual e a promessa central?",
  },
  differentiators: {
    helper: "O que torna essa startup dificil de copiar: acesso, conhecimento, custo, comunidade, dados.",
    placeholder: "Ex: Integracao direta com fornecedores locais e leitura automatica de notas fiscais.",
    question: "Por que voce, e nao qualquer outro?",
  },
  validation: {
    helper: "Como testar a promessa com gente real, gastando pouco: conversas, lista de espera, prototipo.",
    placeholder: "Ex: Entrevistar 10 donos de restaurante e medir quantos aceitam testar por 30 dias.",
    question: "Como provar que a dor e real?",
  },
  business_model: {
    helper: "Quem paga, quanto, com que frequencia — e o que custa para entregar.",
    placeholder: "Ex: Assinatura mensal de R$149 por restaurante, com teste gratis de 14 dias.",
    question: "Como a startup captura valor?",
  },
  mvp: {
    helper: "A menor versao que entrega a promessa central. Corte tudo que nao prova a tese.",
    placeholder: "Ex: App com foto da nota fiscal, lista do estoque atual e alerta de item duplicado.",
    question: "Qual e a menor versao que ja resolve?",
  },
  goals: {
    helper: "Duas ou tres metas pequenas e mensuraveis para as proximas semanas.",
    placeholder: "Ex: 10 entrevistas em 3 semanas; 5 restaurantes testando em 2 meses.",
    question: "Quais sao as primeiras metas?",
  },
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

export function StartupDetailScreen({ startupId }: StartupDetailScreenProps) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupSummary | null>(null);
  const [journey, setJourney] = useState<JourneyStepSummary[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSavingField, setIsSavingField] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [openStepKey, setOpenStepKey] = useState<string | null>(null);
  const [stepDraft, setStepDraft] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [celebratingStepKey, setCelebratingStepKey] = useState<string | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current !== null) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const loadJourney = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/startups/${startupId}/journey`, { cache: "no-store" });

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
      setStartup(payload.startup);
      setJourney(payload.journey);
      setProgress(payload.progress);
    } catch {
      setLoadError("Nao foi possivel carregar essa startup agora.");
    } finally {
      setIsLoading(false);
    }
  }, [router, startupId]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney]);

  function applyJourneyPayload(payload: JourneyPayload) {
    setStartup(payload.startup);
    setJourney(payload.journey);
    setProgress(payload.progress);

    if (payload.message) {
      setFlashMessage(payload.message);
    }
  }

  async function patchStartup(body: Record<string, string>): Promise<
    | { ok: true; startup: StartupSummary; message: string }
    | { ok: false; message: string }
  > {
    try {
      const response = await fetch(`/api/startups/${startupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as AuthErrorPayload | StartupUpdatePayload;

      if (response.status === 401) {
        router.replace("/");
        return { ok: false, message: "" };
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        const firstFieldError = errorPayload.fieldErrors
          ? Object.values(errorPayload.fieldErrors)[0]?.[0]
          : undefined;

        return {
          ok: false,
          message: firstFieldError ?? errorPayload.message ?? "Nao foi possivel salvar agora.",
        };
      }

      const successPayload = payload as StartupUpdatePayload;
      return { ok: true, startup: successPayload.startup, message: successPayload.message };
    } catch {
      return { ok: false, message: "Nao foi possivel salvar agora." };
    }
  }

  async function patchJourneyStep(
    stepKey: string,
    body: { answer: string; complete?: boolean }
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/startups/${startupId}/journey/${stepKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as AuthErrorPayload | JourneyPayload;

      if (response.status === 401) {
        router.replace("/");
        return { ok: false };
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        return {
          ok: false,
          message:
            errorPayload.fieldErrors?.answer?.[0] ??
            errorPayload.message ??
            "Nao foi possivel salvar a etapa agora.",
        };
      }

      applyJourneyPayload(payload as JourneyPayload);
      return { ok: true };
    } catch {
      return { ok: false, message: "Nao foi possivel salvar a etapa agora." };
    }
  }

  function openFieldEditor(field: EditableField) {
    if (!startup) {
      return;
    }

    setEditingField(field);
    setFieldDraft(startup[field]);
    setFieldError(null);
  }

  function closeFieldEditor() {
    setEditingField(null);
    setFieldDraft("");
    setFieldError(null);
  }

  async function submitFieldEditor(field: EditableField) {
    const value = fieldDraft.trim();

    if (!value) {
      setFieldError("Esse campo nao pode ficar vazio.");
      return;
    }

    if (startup && value === startup[field]) {
      closeFieldEditor();
      return;
    }

    setIsSavingField(true);

    try {
      const result = await patchStartup({ [field]: value });

      if (result.ok) {
        setStartup(result.startup);
        setFlashMessage(result.message);
        closeFieldEditor();

        // Problema e publico tambem aparecem na jornada; recarregar para manter em sincronia.
        if (field === "problem" || field === "audience") {
          setJourney((current) =>
            current.map((step) =>
              step.key === field ? { ...step, answer: value } : step
            )
          );
        }

        return;
      }

      if (result.message) {
        setFieldError(result.message);
      }
    } finally {
      setIsSavingField(false);
    }
  }

  function openNameEditor() {
    if (!startup) {
      return;
    }

    setIsEditingName(true);
    setNameDraft(isDeferredName(startup) ? "" : startup.name);
    setNameError(null);
  }

  function closeNameEditor() {
    setIsEditingName(false);
    setNameDraft("");
    setNameError(null);
  }

  async function submitNameEditor() {
    const value = nameDraft.trim();

    if (!value) {
      setNameError("Informe um nome para a startup.");
      return;
    }

    if (startup && value === startup.name) {
      closeNameEditor();
      return;
    }

    setIsSavingName(true);

    try {
      const result = await patchStartup({ name: value });

      if (result.ok) {
        setStartup(result.startup);
        setFlashMessage(result.message);
        closeNameEditor();
        return;
      }

      if (result.message) {
        setNameError(result.message);
      }
    } finally {
      setIsSavingName(false);
    }
  }

  function openStepEditor(step: JourneyStepSummary) {
    setOpenStepKey(step.key);
    setStepDraft(step.answer);
    setStepError(null);
  }

  function closeStepEditor() {
    setOpenStepKey(null);
    setStepDraft("");
    setStepError(null);
  }

  async function submitStep(step: JourneyStepSummary, complete: boolean) {
    const value = stepDraft.trim();

    if (!value) {
      setStepError("A resposta dessa etapa nao pode ficar vazia.");
      return;
    }

    setIsSavingStep(true);

    try {
      const result = await patchJourneyStep(step.key, { answer: value, complete });

      if (result.ok) {
        closeStepEditor();

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

        return;
      }

      if (result.message) {
        setStepError(result.message);
      }
    } finally {
      setIsSavingStep(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateCard} aria-live="polite">
          <span className={styles.stateGlyph} aria-hidden="true" />
          <strong>Abrindo o mapa da startup...</strong>
        </div>
      </main>
    );
  }

  if (loadError || !startup) {
    return (
      <main className={styles.page}>
        <div className={styles.stateCard}>
          <strong>Mapa indisponivel</strong>
          <p>{loadError ?? "Nao foi possivel carregar essa startup agora."}</p>
          <div className={styles.stateActions}>
            <button className={styles.secondaryButton} onClick={loadJourney} type="button">
              Tentar novamente
            </button>
            <Link className={styles.primaryButton} href="/painel">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = journey.find((step) => step.status === "current") ?? null;
  const completedStages = journey.filter((step) => step.status === "done").length;
  const journeyDone = journey.length > 0 && completedStages === journey.length;

  const nextStep = isDeferredName(startup)
    ? {
        action: "Dar nome agora",
        detail: "Uma startup com nome fica mais real. Esse ainda e o proximo passo dela.",
        onAction: openNameEditor,
        title: "De um nome a sua startup",
      }
    : journeyDone
      ? {
          action: null,
          detail:
            "Todas as portas da estruturacao inicial foram abertas. Continue refinando as respostas conforme a startup evolui.",
          onAction: null,
          title: "Jornada inicial completa",
        }
      : currentStep
        ? {
            action: "Abrir etapa",
            detail: stepGuides[currentStep.key]?.question ?? "A proxima porta da jornada esta aberta.",
            onAction: () => openStepEditor(currentStep),
            title: currentStep.title,
          }
        : {
            action: null,
            detail: "A jornada esta sendo preparada.",
            onAction: null,
            title: "Jornada",
          };

  return (
    <main className={styles.page}>
      <div className={styles.beam} />
      <div className={styles.orbitLeft} />
      <div className={styles.orbitRight} />
      {Array.from({ length: 6 }).map((_, index) => (
        <span className={styles.star} key={index} />
      ))}

      <div className={styles.content}>
        <nav className={styles.topbar} aria-label="Navegacao da startup">
          <Link className={styles.backLink} href="/painel">
            <span aria-hidden="true">&larr;</span> Voltar ao painel
          </Link>

          <div className={styles.brandMark}>
            <QuestMark animated />
          </div>
        </nav>

        <header className={styles.header}>
          <div className={styles.headerChips}>
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
            <span className={styles.dateChip}>Fundada em {formatCreatedAt(startup.createdAt)}</span>
          </div>

          {isEditingName ? (
            <form
              className={styles.nameForm}
              onSubmit={(event) => {
                event.preventDefault();
                void submitNameEditor();
              }}
            >
              <input
                autoFocus
                className={styles.nameInput}
                disabled={isSavingName}
                maxLength={120}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  setNameError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeNameEditor();
                  }
                }}
                placeholder="Nome da startup"
                type="text"
                value={nameDraft}
              />

              {nameError ? <span className={styles.editError}>{nameError}</span> : null}

              <div className={styles.editActions}>
                <button className={styles.saveButton} disabled={isSavingName} type="submit">
                  {isSavingName ? "Salvando..." : "Salvar nome"}
                </button>
                <button
                  className={styles.cancelButton}
                  disabled={isSavingName}
                  onClick={closeNameEditor}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.nameRow}>
              <h1>{startup.name}</h1>
              <button
                className={[
                  styles.renameButton,
                  isDeferredName(startup) ? styles.renameButtonCallout : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={openNameEditor}
                type="button"
              >
                {isDeferredName(startup) ? "Dar nome agora" : "Renomear"}
              </button>
            </div>
          )}

          {startup.description ? (
            <p className={styles.headerIdea}>{startup.description}</p>
          ) : null}
        </header>

        {flashMessage ? <div className={styles.flash}>{flashMessage}</div> : null}

        <section className={styles.nextStepCard} aria-label="Proximo passo">
          <div>
            <span className={styles.nextStepEyebrow}>Proximo passo</span>
            <strong className={styles.nextStepTitle}>{nextStep.title}</strong>
            <p className={styles.nextStepDetail}>{nextStep.detail}</p>
          </div>

          {nextStep.action && nextStep.onAction ? (
            <button className={styles.primaryButton} onClick={nextStep.onAction} type="button">
              {nextStep.action}
            </button>
          ) : (
            <span className={styles.soonChip}>
              {journeyDone ? "Completa" : "Em preparacao"}
            </span>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Jornada</h2>
            <p>
              {completedStages} de {journey.length} etapas concluidas. Uma porta de cada vez: a
              etapa atual abre, as proximas destravam na sequencia.
            </p>
          </div>

          <div className={styles.journeyProgressTrack} aria-hidden="true">
            <span className={styles.journeyProgressFill} style={{ width: `${progress}%` }} />
          </div>

          <ol className={styles.journeyList}>
            {journey.map((step, index) => {
              const guide = stepGuides[step.key];
              const isOpen = openStepKey === step.key;
              const isCurrent = step.status === "current";
              const isDone = step.status === "done";
              const isCelebrating = celebratingStepKey === step.key;

              return (
                <li
                  className={[
                    styles.journeyItem,
                    isDone ? styles.journeyItemDone : "",
                    isCurrent ? styles.journeyItemCurrent : "",
                    isCelebrating ? styles.journeyItemCelebrating : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={step.key}
                >
                  <span className={styles.journeyMarker} aria-hidden="true">
                    {isDone ? "✓" : index + 1}

                    {isCelebrating ? (
                      <>
                        <span className={styles.markerRing} />
                        {Array.from({ length: 6 }).map((_, sparkIndex) => (
                          <span
                            className={styles.markerSpark}
                            key={sparkIndex}
                            style={{ "--spark-index": sparkIndex } as React.CSSProperties}
                          />
                        ))}
                      </>
                    ) : null}
                  </span>

                  <div className={styles.journeyCopy}>
                    <div className={styles.journeyTitleRow}>
                      <strong>{step.title}</strong>

                      {isCurrent ? (
                        <span className={styles.journeyBadge}>Voce esta aqui</span>
                      ) : null}
                    </div>

                    {guide ? <p>{guide.question}</p> : null}

                    {isDone && !isOpen && step.answer ? (
                      <p className={styles.journeyAnswer}>{step.answer}</p>
                    ) : null}

                    {isOpen ? (
                      <form
                        className={styles.editForm}
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submitStep(step, isCurrent);
                        }}
                      >
                        <textarea
                          autoFocus
                          className={styles.editTextarea}
                          disabled={isSavingStep}
                          onChange={(event) => {
                            setStepDraft(event.target.value);
                            setStepError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              closeStepEditor();
                            }
                          }}
                          placeholder={guide?.placeholder}
                          rows={4}
                          value={stepDraft}
                        />

                        {guide ? <span className={styles.mapHelper}>{guide.helper}</span> : null}
                        {stepError ? <span className={styles.editError}>{stepError}</span> : null}

                        <div className={styles.editActions}>
                          <button
                            className={styles.saveButton}
                            disabled={isSavingStep}
                            type="submit"
                          >
                            {isSavingStep
                              ? "Salvando..."
                              : isCurrent
                                ? "Concluir etapa"
                                : "Salvar"}
                          </button>

                          {isCurrent ? (
                            <button
                              className={styles.cancelButton}
                              disabled={isSavingStep}
                              onClick={() => void submitStep(step, false)}
                              type="button"
                            >
                              Salvar rascunho
                            </button>
                          ) : null}

                          <button
                            className={styles.cancelButton}
                            disabled={isSavingStep}
                            onClick={closeStepEditor}
                            type="button"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : isCurrent ? (
                      <div className={styles.journeyActions}>
                        <button
                          className={styles.saveButton}
                          onClick={() => openStepEditor(step)}
                          type="button"
                        >
                          {step.answer ? "Continuar etapa" : "Abrir etapa"}
                        </button>
                      </div>
                    ) : isDone ? (
                      <div className={styles.journeyActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => openStepEditor(step)}
                          type="button"
                        >
                          Refinar resposta
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Mapa inicial</h2>
            <p>O que voce definiu na fundacao. Tudo aqui pode ser refinado a qualquer momento.</p>
          </div>

          <div className={styles.mapGrid}>
            {mapBlocks.map((block) => {
              const isEditing = editingField === block.field;

              return (
                <article className={styles.mapCard} key={block.field}>
                  <div className={styles.mapCardHeader}>
                    <span className={styles.mapLabel}>{block.label}</span>

                    {!isEditing ? (
                      <button
                        className={styles.editButton}
                        onClick={() => openFieldEditor(block.field)}
                        type="button"
                      >
                        Editar
                      </button>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <form
                      className={styles.editForm}
                      onSubmit={(event) => {
                        event.preventDefault();
                        void submitFieldEditor(block.field);
                      }}
                    >
                      {block.multiline ? (
                        <textarea
                          autoFocus
                          className={styles.editTextarea}
                          disabled={isSavingField}
                          onChange={(event) => {
                            setFieldDraft(event.target.value);
                            setFieldError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              closeFieldEditor();
                            }
                          }}
                          rows={4}
                          value={fieldDraft}
                        />
                      ) : (
                        <input
                          autoFocus
                          className={styles.editInput}
                          disabled={isSavingField}
                          maxLength={120}
                          onChange={(event) => {
                            setFieldDraft(event.target.value);
                            setFieldError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              closeFieldEditor();
                            }
                          }}
                          type="text"
                          value={fieldDraft}
                        />
                      )}

                      {fieldError ? <span className={styles.editError}>{fieldError}</span> : null}

                      <div className={styles.editActions}>
                        <button className={styles.saveButton} disabled={isSavingField} type="submit">
                          {isSavingField ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          className={styles.cancelButton}
                          disabled={isSavingField}
                          onClick={closeFieldEditor}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className={styles.mapValue}>{startup[block.field]}</p>
                      <span className={styles.mapHelper}>{block.helper}</span>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
