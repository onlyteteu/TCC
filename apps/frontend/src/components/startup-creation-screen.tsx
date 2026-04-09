"use client";

import { useEffect, useRef, useState } from "react";

import { QuestMark } from "@/components/quest-mark";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { StartupCreatePayload, StartupSummary } from "@/lib/startup-types";

import styles from "./startup-creation-screen.module.css";

type StartupCreationScreenProps = {
  canGoBack?: boolean;
  isLoggingOut?: boolean;
  onBack?: () => void;
  onCreated: (startup: StartupSummary, message: string) => void;
  onLogout?: () => void;
};

type StartupFormState = {
  audience: string;
  deferNaming: boolean;
  description: string;
  name: string;
  problem: string;
  segment: string;
};

type StepKey = "name" | "description" | "segment" | "problem" | "audience";

type StepContent = {
  badge: string;
  helper?: string;
  key: StepKey;
  label: string;
  placeholder?: string;
  subtitle: string;
  title: string;
};

type CelebrationState = {
  message: string;
  startup: StartupSummary;
};

const FOUNDATION_SEQUENCE_MS = 2500;

const initialState: StartupFormState = {
  audience: "",
  deferNaming: false,
  description: "",
  name: "",
  problem: "",
  segment: "",
};

const steps: StepContent[] = [
  {
    badge: "Etapa 1 / 5",
    key: "name",
    label: "Nome da startup",
    placeholder: "De um nome a sua startup",
    subtitle: "O primeiro passo da jornada e dar um nome ao que vai nascer.",
    title: "Crie sua startup",
  },
  {
    badge: "Etapa 2 / 5",
    helper: "Dica: escreva como se contasse para um amigo em 20 segundos.",
    key: "description",
    label: "Minha startup e...",
    placeholder: "Ex: Um app que ajuda restaurantes pequenos a controlar estoque e evitar desperdicio.",
    subtitle: "Sem plano de negocio ainda. So queremos entender o que esta nascendo.",
    title: "Conte a ideia em uma frase.",
  },
  {
    badge: "Etapa 3 / 5",
    key: "segment",
    label: "Territorio inicial",
    subtitle: "Escolha um ponto de partida. Segmento nao e prisao, e so o primeiro mapa.",
    title: "Qual \u00e9 o territ\u00f3rio dessa ideia?",
  },
  {
    badge: "Etapa 4 / 5",
    helper: "Foque no prejuizo, atraso, medo, incomodo ou desperdicio. A solucao vem depois.",
    key: "problem",
    label: "O problema e...",
    placeholder: "Ex: Restaurantes pequenos compram ingrediente duplicado porque nao sabem o que ja existe no estoque.",
    subtitle: "Descreva o problema antes da solucao. Quem sente isso aparece na proxima porta.",
    title: "Que dor precisa desaparecer?",
  },
  {
    badge: "Etapa 5 / 5",
    helper: "Tente juntar pessoa, contexto e sinal da dor. Quanto mais concreto, melhor.",
    key: "audience",
    label: "Meu primeiro publico e...",
    placeholder: "Ex: Donos de restaurantes pequenos, com ate 15 funcionarios, que controlam estoque por caderno ou planilha.",
    subtitle: "Comece por um grupo pequeno. Publico inicial bom parece pessoa real, nao estatistica.",
    title: "Quem sente essa dor primeiro?",
  },
];

const segmentOptions = [
  {
    description: "restaurantes, delivery, estoque, cozinha, desperdicio",
    value: "Alimentacao",
  },
  {
    description: "alunos, professores, cursos, aprendizagem, carreira",
    value: "Educacao",
  },
  {
    description: "clinicas, pacientes, cuidado, bem-estar, rotina",
    value: "Saude",
  },
  {
    description: "pagamentos, credito, controle, renda, planejamento",
    value: "Financas",
  },
  {
    description: "software, dados, automacao, IA, produtividade",
    value: "IA / Tecnologia",
  },
  {
    description: "impacto, residuos, reuso, energia, meio ambiente",
    value: "Sustentabilidade",
  },
  {
    description: "moda, games, eventos ou outro mercado inicial",
    value: "Outro territorio",
  },
];

const lastStepIndex = steps.length - 1;

export function StartupCreationScreen({
  canGoBack = false,
  isLoggingOut = false,
  onBack,
  onCreated,
  onLogout,
}: StartupCreationScreenProps) {
  const [formState, setFormState] = useState<StartupFormState>(initialState);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationState, setCelebrationState] = useState<CelebrationState | null>(null);
  const foundationTimerRef = useRef<number | null>(null);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const canStepBack = currentStepIndex > 0;
  const isFinalStep = currentStepIndex === lastStepIndex;
  const activeFieldError = fieldErrors[currentStep.key]?.[0];
  const isNameStep = currentStep.key === "name";
  const isSegmentStep = currentStep.key === "segment";
  const isCelebrating = celebrationState !== null;
  const isInteractionLocked = isSubmitting || isCelebrating;

  useEffect(() => {
    return () => {
      if (foundationTimerRef.current !== null) {
        window.clearTimeout(foundationTimerRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof StartupFormState>(field: K, value: StartupFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateCurrentStep() {
    const nextFieldErrors: Record<string, string[]> = {};
    let nextStatusMessage: string | null = null;

    if (currentStep.key === "name") {
      if (!formState.name.trim() && !formState.deferNaming) {
        nextFieldErrors.name = [
          "Informe o nome da startup ou marque que vai definir isso depois.",
        ];
        nextStatusMessage = "Falta so decidir como voce quer iniciar essa startup.";
      }
    }

    if (currentStep.key === "description" && !formState.description.trim()) {
      nextFieldErrors.description = ["Conte a ideia da startup em uma frase."];
      nextStatusMessage = "A jornada precisa de uma ideia central antes de seguir.";
    }

    if (currentStep.key === "segment" && !formState.segment) {
      nextFieldErrors.segment = ["Escolha um territorio inicial para sua startup."];
      nextStatusMessage = "Escolha um segmento para abrir a proxima porta.";
    }

    if (currentStep.key === "problem" && !formState.problem.trim()) {
      nextFieldErrors.problem = ["Descreva a dor que essa startup quer resolver."];
      nextStatusMessage = "Antes do publico, precisamos nomear a dor.";
    }

    if (currentStep.key === "audience" && !formState.audience.trim()) {
      nextFieldErrors.audience = ["Descreva quem sente essa dor primeiro."];
      nextStatusMessage = "Recorte um primeiro publico para gerar o mapa.";
    }

    setFieldErrors(nextFieldErrors);
    setStatusMessage(nextStatusMessage);
    return Object.keys(nextFieldErrors).length === 0;
  }

  function goToNextStep() {
    setStatusMessage(null);
    setFieldErrors({});
    setCurrentStepIndex((current) => Math.min(current + 1, lastStepIndex));
  }

  function goToPreviousStep() {
    setStatusMessage(null);
    setFieldErrors({});
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  }

  async function createStartup() {
    let shouldResetSubmitting = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = (await response.json()) as AuthErrorPayload | StartupCreatePayload;

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        setFieldErrors(errorPayload.fieldErrors ?? {});
        setStatusMessage(errorPayload.message);
        return;
      }

      const successPayload = payload as StartupCreatePayload;
      shouldResetSubmitting = false;
      setFieldErrors({});
      setStatusMessage(null);
      setCelebrationState({
        message: successPayload.message,
        startup: successPayload.startup,
      });

      if (foundationTimerRef.current !== null) {
        window.clearTimeout(foundationTimerRef.current);
      }

      foundationTimerRef.current = window.setTimeout(() => {
        foundationTimerRef.current = null;
        onCreated(successPayload.startup, successPayload.message);
      }, FOUNDATION_SEQUENCE_MS);
    } catch {
      setStatusMessage(
        "Nao foi possivel criar a startup agora. Confira se o backend Django esta rodando."
      );
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    if (!isFinalStep) {
      goToNextStep();
      return;
    }

    await createStartup();
  }

  const submitLabel = isFinalStep ? "Gerar meu primeiro mapa" : "Continuar";
  const submittingLabel = isFinalStep ? "Fundando sua startup..." : "Abrindo proxima porta...";

  return (
    <main className={[styles.page, isCelebrating ? styles.pageCelebrating : ""].join(" ")}>
      <div className={styles.beam} />
      <div className={styles.auraPrimary} />
      <div className={styles.auraSecondary} />
      <div className={styles.orbitLeft} />
      <div className={styles.orbitRight} />
      <div className={styles.orbitLower} />
      {Array.from({ length: 8 }).map((_, index) => (
        <span className={styles.star} key={index} />
      ))}

      <div
        className={[
          styles.content,
          isNameStep ? styles.contentNameStep : "",
          isCelebrating ? styles.contentCelebrating : "",
        ].join(" ")}
      >
        <div className={styles.brandTitle}>Startup Quest</div>

        <div className={[styles.logoRegion, isNameStep ? styles.logoRegionNameStep : ""].join(" ")}>
          <QuestMark animated />
        </div>

        <div
          className={[
            styles.cardFrame,
            isNameStep ? styles.cardFrameNameStep : "",
            isSegmentStep ? styles.cardFrameSegmentStep : "",
          ].join(" ")}
        >
          <section
            className={[
              styles.card,
              isNameStep ? styles.cardNameStep : "",
              isSegmentStep ? styles.cardSegmentStep : "",
            ].join(" ")}
            aria-label="Criacao da startup"
          >
            <div className={styles.cardNav}>
              {canStepBack ? (
                  <button
                    className={styles.backButton}
                    disabled={isInteractionLocked}
                    onClick={goToPreviousStep}
                    type="button"
                  >
                    Voltar
                  </button>
                ) : canGoBack && onBack ? (
                  <button
                    className={styles.backButton}
                    disabled={isInteractionLocked}
                    onClick={onBack}
                    type="button"
                  >
                    Voltar
                  </button>
                ) : onLogout ? (
                  <button
                    className={styles.backButton}
                    disabled={isInteractionLocked}
                    onClick={onLogout}
                    type="button"
                  >
                    {isLoggingOut ? "Saindo..." : "Sair"}
                  </button>
              ) : (
                <span />
              )}

              <span className={styles.progressText}>{currentStepIndex + 1} de {steps.length}</span>
            </div>

            <div className={styles.progressTrack} aria-hidden="true">
              <span className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <span className={styles.badge}>{currentStep.badge}</span>
            <h1 className={styles.title} key={`${currentStep.key}-title`}>
              <TypedTitle text={currentStep.title} />
            </h1>
            <div className={styles.stepMotion} key={currentStep.key}>
              <p className={styles.subtitle}>{currentStep.subtitle}</p>

              <form className={styles.form} onSubmit={handleSubmit}>
                {currentStep.key === "name" ? (
                    <NameStep
                      disabled={isInteractionLocked}
                      error={fieldErrors.name?.[0]}
                      formState={formState}
                      updateField={updateField}
                  />
                ) : null}

                {currentStep.key === "description" ||
                currentStep.key === "problem" ||
                currentStep.key === "audience" ? (
                    <LongTextStep
                      disabled={isInteractionLocked}
                      error={activeFieldError}
                      formState={formState}
                      step={currentStep}
                    updateField={updateField}
                  />
                ) : null}

                {currentStep.key === "segment" ? (
                  <SegmentStep
                    disabled={isInteractionLocked}
                    error={fieldErrors.segment?.[0]}
                    segment={formState.segment}
                    updateSegment={(segment) => updateField("segment", segment)}
                  />
                ) : null}

                {currentStep.helper ? <p className={styles.helperText}>{currentStep.helper}</p> : null}

                <div
                  className={[
                    styles.status,
                    statusMessage && Object.keys(fieldErrors).length > 0
                      ? styles.statusError
                      : styles.statusSuccess,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {statusMessage}
                </div>

                <button className={styles.submitButton} disabled={isInteractionLocked} type="submit">
                  {isSubmitting ? submittingLabel : submitLabel}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      {celebrationState ? <StartupFoundationCelebration celebrationState={celebrationState} /> : null}
    </main>
  );
}

type FieldUpdater = <K extends keyof StartupFormState>(field: K, value: StartupFormState[K]) => void;

function TypedTitle({ text }: { text: string }) {
  const titleParts = Array.from(text.matchAll(/\S+|\s+/g));

  return (
    <>
      {titleParts.map((match) => {
        const word = match[0];
        const wordIndex = match.index;

        if (word.trim() === "") {
          return (
            <span aria-hidden="true" className={styles.titleSpace} key={`space-${wordIndex}`}>
              {" "}
            </span>
          );
        }

        return (
          <span aria-hidden="true" className={styles.titleWord} key={`${word}-${wordIndex}`}>
            {Array.from(word).map((character, characterOffset) => {
              const currentIndex = wordIndex + characterOffset;

              return (
                <span
                  className={styles.titleCharacter}
                  key={`${character}-${currentIndex}`}
                  style={{ "--character-index": currentIndex } as React.CSSProperties}
                >
                  {character}
                </span>
              );
            })}
          </span>
        );
      })}
      <span className={styles.titleAccessible}>{text}</span>
    </>
  );
}

function NameStep({
  disabled = false,
  error,
  formState,
  updateField,
}: {
  disabled?: boolean;
  error?: string;
  formState: StartupFormState;
  updateField: FieldUpdater;
}) {
  return (
    <>
      <label className={styles.field}>
        <span className={styles.label}>Nome da startup</span>

        <span className={[styles.inputShell, error ? styles.inputShellError : ""].join(" ")}>
          <span className={styles.dot} aria-hidden="true" />
          <input
            className={styles.input}
            disabled={disabled}
            name="name"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="De um nome a sua startup"
            type="text"
            value={formState.name}
          />
        </span>

        <span className={styles.fieldMessage}>{error ?? ""}</span>
      </label>

      <label className={styles.deferRow}>
        <input
          checked={formState.deferNaming}
          className={styles.checkboxInput}
          disabled={disabled}
          onChange={(event) => updateField("deferNaming", event.target.checked)}
          type="checkbox"
        />
        <span className={styles.checkboxBox} aria-hidden="true" />
        <span className={styles.deferCopy}>
          <strong>Ainda nao sei o nome</strong>
          <span>Posso definir isso depois</span>
        </span>
      </label>
    </>
  );
}

function LongTextStep({
  disabled = false,
  error,
  formState,
  step,
  updateField,
}: {
  disabled?: boolean;
  error?: string;
  formState: StartupFormState;
  step: Extract<StepContent, { key: StepKey }>;
  updateField: FieldUpdater;
}) {
  const fieldName = step.key;

  if (fieldName === "name" || fieldName === "segment") {
    return null;
  }

  return (
    <label className={styles.field}>
      <span className={styles.label}>{step.label}</span>

      <span className={[styles.textareaShell, error ? styles.inputShellError : ""].join(" ")}>
        <span className={styles.dot} aria-hidden="true" />
        <textarea
          className={styles.textarea}
          disabled={disabled}
          name={fieldName}
          onChange={(event) => updateField(fieldName, event.target.value)}
          placeholder={step.placeholder}
          rows={5}
          value={formState[fieldName]}
        />
      </span>

      <span className={styles.fieldMessage}>{error ?? ""}</span>
    </label>
  );
}

function SegmentStep({
  disabled = false,
  error,
  segment,
  updateSegment,
}: {
  disabled?: boolean;
  error?: string;
  segment: string;
  updateSegment: (segment: string) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>Escolha um territorio</span>

      <div className={styles.segmentGrid}>
        {segmentOptions.map((option) => {
          const isSelected = segment === option.value;

          return (
            <button
              className={[styles.segmentOption, isSelected ? styles.segmentOptionActive : ""]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              key={option.value}
              onClick={() => updateSegment(option.value)}
              type="button"
            >
              <span className={styles.segmentName}>{option.value}</span>
              <span className={styles.segmentDescription}>{option.description}</span>
            </button>
          );
        })}
      </div>

      <span className={styles.fieldMessage}>{error ?? ""}</span>
    </div>
  );
}

function StartupFoundationCelebration({
  celebrationState,
}: {
  celebrationState: CelebrationState;
}) {
  const hasDefinedName = !celebrationState.startup.name.toLowerCase().startsWith("startup sem nome");
  const title = hasDefinedName
    ? `${celebrationState.startup.name} foi fundada.`
    : "Sua startup foi fundada.";

  return (
    <div aria-live="polite" className={styles.celebrationOverlay} role="status">
      <div className={styles.celebrationGlow} />
      <div className={styles.celebrationRing} />
      <div className={styles.celebrationRingSecondary} />

      {Array.from({ length: 12 }).map((_, index) => (
        <span
          aria-hidden="true"
          className={styles.celebrationSpark}
          key={index}
          style={{ "--spark-index": index } as React.CSSProperties}
        />
      ))}

      <div className={styles.celebrationCard}>
        <div className={styles.celebrationLogo}>
          <QuestMark animated />
        </div>
        <span className={styles.celebrationEyebrow}>Startup criada</span>
        <strong className={styles.celebrationTitle}>{title}</strong>
        <p className={styles.celebrationText}>{celebrationState.message}</p>
        <span className={styles.celebrationHint}>Abrindo seu primeiro mapa...</span>
      </div>
    </div>
  );
}
