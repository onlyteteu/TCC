"use client";

import { useState } from "react";

import type { JourneyStepSummary } from "@/lib/startup-types";

import styles from "./startup-journey-screen.module.css";

type JourneyWorkspaceProps = {
  isSaving: boolean;
  journey: JourneyStepSummary[];
  onSaveStep: (
    step: JourneyStepSummary,
    answer: string,
    complete: boolean
  ) => Promise<void>;
  onSelectStep: (stepKey: string) => void;
  progress: number;
  selectedStepKey: string;
};

type StepGuide = {
  helper: string;
  placeholder: string;
  question: string;
};

const stepGuides: Record<string, StepGuide> = {
  problem: {
    helper: "Foque no prejuizo, atraso, medo, incomodo ou desperdicio. A solucao vem depois.",
    placeholder:
      "Ex: Restaurantes pequenos compram ingrediente duplicado porque nao sabem o que ja existe no estoque.",
    question: "Que dor precisa desaparecer?",
  },
  audience: {
    helper: "Junte pessoa, contexto e sinal da dor. Publico bom parece gente real, nao estatistica.",
    placeholder:
      "Ex: Donos de restaurantes pequenos, com ate 15 funcionarios, que controlam estoque por caderno.",
    question: "Quem sente essa dor primeiro?",
  },
  value: {
    helper: "Uma frase: para quem, o que sua startup entrega e por que e melhor que o jeito atual.",
    placeholder:
      "Ex: Para donos de restaurantes pequenos, o Estoca reduz desperdicio em 30% sem precisar de planilhas.",
    question: "Qual e a promessa central?",
  },
  differentiators: {
    helper: "O que torna essa startup dificil de copiar: acesso, conhecimento, custo, comunidade, dados.",
    placeholder:
      "Ex: Integracao direta com fornecedores locais e leitura automatica de notas fiscais.",
    question: "Por que voce, e nao qualquer outro?",
  },
  validation: {
    helper:
      "Como testar a promessa com gente real, gastando pouco: conversas, lista de espera, prototipo.",
    placeholder:
      "Ex: Entrevistar 10 donos de restaurante e medir quantos aceitam testar por 30 dias.",
    question: "Como provar que a dor e real?",
  },
  business_model: {
    helper: "Quem paga, quanto, com que frequencia - e o que custa para entregar.",
    placeholder: "Ex: Assinatura mensal de R$149 por restaurante, com teste gratis de 14 dias.",
    question: "Como a startup captura valor?",
  },
  mvp: {
    helper: "A menor versao que entrega a promessa central. Corte tudo que nao prova a tese.",
    placeholder:
      "Ex: App com foto da nota fiscal, lista do estoque atual e alerta de item duplicado.",
    question: "Qual e a menor versao que ja resolve?",
  },
  goals: {
    helper: "Duas ou tres metas pequenas e mensuraveis para as proximas semanas.",
    placeholder: "Ex: 10 entrevistas em 3 semanas; 5 restaurantes testando em 2 meses.",
    question: "Quais sao as primeiras metas?",
  },
};

const fallbackGuide: StepGuide = {
  helper: "Registre uma resposta concreta que ajude a orientar a proxima decisao.",
  placeholder: "Descreva o que voce ja sabe e o que ainda precisa validar.",
  question: "O que precisa ficar claro nesta etapa?",
};

function StepEditor({
  isSaving,
  onSaveStep,
  step,
}: Pick<JourneyWorkspaceProps, "isSaving" | "onSaveStep"> & {
  step: JourneyStepSummary;
}) {
  const [draft, setDraft] = useState(step.answer);
  const [error, setError] = useState<string | null>(null);
  const guide = stepGuides[step.key] ?? fallbackGuide;

  async function submitStep() {
    const answer = draft.trim();
    if (!answer) {
      setError("A resposta dessa etapa nao pode ficar vazia.");
      return;
    }

    setError(null);
    try {
      await onSaveStep(step, answer, step.status === "current");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nao foi possivel salvar a etapa agora."
      );
    }
  }

  return (
    <>
      <div className={styles.stepDetailHeader}>
        <span>{step.status === "done" ? "Etapa concluida" : "Etapa atual"}</span>
        <h2>{step.title}</h2>
      </div>

      <div className={styles.stepPrompt}>
        <strong>{guide.question}</strong>
        <p>{guide.helper}</p>
      </div>

      <label className={styles.answerField}>
        <span>Sua resposta</span>
        <textarea
          disabled={isSaving}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          placeholder={guide.placeholder}
          rows={9}
          value={draft}
        />
      </label>

      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.detailActions}>
        <button
          className={styles.primaryButton}
          disabled={isSaving}
          onClick={() => void submitStep()}
          type="button"
        >
          {isSaving
            ? "Salvando..."
            : step.status === "current"
              ? "Concluir etapa"
              : "Salvar alteracao"}
        </button>
      </div>
    </>
  );
}

export function JourneyWorkspace({
  isSaving,
  journey,
  onSaveStep,
  onSelectStep,
  progress,
  selectedStepKey,
}: JourneyWorkspaceProps) {
  const selectedStep =
    journey.find((step) => step.key === selectedStepKey && step.status !== "pending") ??
    journey.find((step) => step.status === "current") ??
    journey.find((step) => step.status === "done") ??
    null;
  return (
    <div className={styles.journeyGrid}>
      <aside className={styles.stepList} aria-label="Etapas da jornada">
        <div className={styles.progressHeader}>
          <span>Progresso da jornada</span>
          <strong>{progress}%</strong>
        </div>
        <div
          aria-label={`${progress}% concluido`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className={styles.progressTrack}
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <ol className={styles.steps}>
          {journey.map((step, index) => {
            const isSelected = selectedStep?.key === step.key;
            const isPending = step.status === "pending";

            return (
              // O brief exige aria-disabled no li para expor o bloqueio junto da etapa.
              // eslint-disable-next-line jsx-a11y/role-supports-aria-props
              <li aria-disabled={isPending ? "true" : undefined} key={step.key}>
                {isPending ? (
                  <div className={styles.lockedStep}>
                    <span className={styles.stepIndex} aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>
                      <strong>{step.title}</strong>
                      <small>Conclua a etapa atual para desbloquear</small>
                    </span>
                    <span aria-hidden="true" className={styles.lockIcon}>
                      &#128274;
                    </span>
                  </div>
                ) : (
                  <button
                    aria-current={isSelected ? "step" : undefined}
                    className={styles.stepButton}
                    onClick={() => onSelectStep(step.key)}
                    type="button"
                  >
                    <span className={styles.stepIndex} aria-hidden="true">
                      {step.status === "done" ? "✓" : index + 1}
                    </span>
                    <span>
                      <strong>{step.title}</strong>
                      <small>{step.status === "done" ? "Concluida" : "Etapa atual"}</small>
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </aside>

      <section className={styles.stepDetail} aria-live="polite">
        {selectedStep ? (
          <StepEditor
            isSaving={isSaving}
            key={`${selectedStep.key}:${selectedStep.answer}`}
            onSaveStep={onSaveStep}
            step={selectedStep}
          />
        ) : (
          <div className={styles.emptyState}>
            <h2>Jornada em preparacao</h2>
            <p>As etapas desta startup aparecerao aqui.</p>
          </div>
        )}
      </section>
    </div>
  );
}
