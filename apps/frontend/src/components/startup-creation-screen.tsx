"use client";

import { useState } from "react";

import { QuestMark } from "@/components/quest-mark";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { StartupCreatePayload, StartupSummary } from "@/lib/startup-types";

import styles from "./startup-creation-screen.module.css";

type StartupCreationScreenProps = {
  canGoBack?: boolean;
  onBack?: () => void;
  onCreated: (startup: StartupSummary, message: string) => void;
};

export function StartupCreationScreen({
  canGoBack = false,
  onBack,
  onCreated,
}: StartupCreationScreenProps) {
  const [name, setName] = useState("");
  const [deferNaming, setDeferNaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setFieldErrors({});

    if (!name.trim() && !deferNaming) {
      setFieldErrors({
        name: ["Informe o nome da startup ou marque que vai definir isso depois."],
      });
      setStatusMessage("Falta so decidir como voce quer iniciar essa startup.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          deferNaming,
        }),
      });

      const payload = (await response.json()) as AuthErrorPayload | StartupCreatePayload;

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        setFieldErrors(errorPayload.fieldErrors ?? {});
        setStatusMessage(errorPayload.message);
        return;
      }

      const successPayload = payload as StartupCreatePayload;
      setStatusMessage(successPayload.message);
      onCreated(successPayload.startup, successPayload.message);
    } catch {
      setStatusMessage(
        "Nao foi possivel criar a startup agora. Confira se o backend Django esta rodando."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.beam} />
      <div className={styles.auraPrimary} />
      <div className={styles.auraSecondary} />
      <div className={styles.orbitLeft} />
      <div className={styles.orbitRight} />
      <div className={styles.orbitLower} />
      {Array.from({ length: 8 }).map((_, index) => (
        <span className={styles.star} key={index} />
      ))}

      <div className={styles.content}>
        <div className={styles.brandTitle}>Startup Quest</div>

        <div className={styles.logoRegion}>
          <QuestMark animated />
        </div>

        <div className={styles.cardFrame}>
          <section className={styles.card} aria-label="Criacao da startup">
            {canGoBack && onBack ? (
              <button className={styles.backButton} onClick={onBack} type="button">
                Voltar
              </button>
            ) : null}

            <span className={styles.badge}>Comece aqui</span>
            <h1 className={styles.title}>Crie sua startup</h1>
            <p className={styles.subtitle}>
              O primeiro passo da jornada e dar um nome ao que vai nascer.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Nome da startup</span>

                <span
                  className={[
                    styles.inputShell,
                    fieldErrors.name?.length ? styles.inputShellError : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <input
                    className={styles.input}
                    name="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="De um nome a sua startup"
                    type="text"
                    value={name}
                  />
                </span>

                <span className={styles.fieldMessage}>{fieldErrors.name?.[0] ?? ""}</span>
              </label>

              <label className={styles.deferRow}>
                <input
                  checked={deferNaming}
                  className={styles.checkboxInput}
                  onChange={(event) => setDeferNaming(event.target.checked)}
                  type="checkbox"
                />
                <span className={styles.checkboxBox} aria-hidden="true" />
                <span className={styles.deferCopy}>
                  <strong>Ainda nao sei o nome</strong>
                  <span>Posso definir isso depois</span>
                </span>
              </label>

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

              <button className={styles.submitButton} disabled={isSubmitting} type="submit">
                {isSubmitting ? "Criando startup..." : "Criar startup"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
