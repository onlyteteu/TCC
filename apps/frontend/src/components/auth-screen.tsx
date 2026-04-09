"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useState, useTransition } from "react";

import { QuestMark } from "@/components/quest-mark";
import type { AuthErrorPayload, AuthMode, AuthSuccessPayload } from "@/lib/auth-types";

import styles from "./auth-screen.module.css";

type AuthFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialState: AuthFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const fieldLabels: Record<keyof AuthFormState, string> = {
  name: "Nome",
  email: "E-mail",
  password: "Senha",
  confirmPassword: "Confirmar senha",
};

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formState, setFormState] = useState<AuthFormState>(initialState);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const submitLabel = mode === "login" ? "Entrar na plataforma" : "Criar conta";

  const activeFields =
    mode === "login"
      ? [
          {
            name: "email" as const,
            placeholder: "voce@startup.quest",
            autoComplete: "email",
            type: "email",
            tone: "warm" as const,
          },
          {
            name: "password" as const,
            placeholder: "••••••••••",
            autoComplete: "current-password",
            type: "password",
            tone: "cool" as const,
          },
        ]
      : [
          {
            name: "name" as const,
            placeholder: "Nome",
            autoComplete: "name",
            type: "text",
            tone: "warm" as const,
          },
          {
            name: "email" as const,
            placeholder: "voce@startup.quest",
            autoComplete: "email",
            type: "email",
            tone: "warm" as const,
          },
          {
            name: "password" as const,
            placeholder: "••••••••••",
            autoComplete: "new-password",
            type: "password",
            tone: "cool" as const,
          },
          {
            name: "confirmPassword" as const,
            placeholder: "••••••••••",
            autoComplete: "new-password",
            type: "password",
            tone: "cool" as const,
          },
        ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setFieldErrors({});

    if (mode === "register" && formState.password !== formState.confirmPassword) {
      setFieldErrors({
        confirmPassword: ["A confirmacao de senha nao confere."],
      });
      setStatusMessage("Revise os campos do cadastro antes de continuar.");
      return;
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? {
            email: formState.email,
            password: formState.password,
          }
        : formState;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as AuthErrorPayload;
        setFieldErrors(errorPayload.fieldErrors ?? {});
        setStatusMessage(errorPayload.message);
        return;
      }

      const successPayload = (await response.json()) as AuthSuccessPayload;
      setStatusMessage(successPayload.message);

      startTransition(() => {
        router.push("/painel");
      });
    } catch {
      setStatusMessage(
        "Nao foi possivel falar com o servidor agora. Confira se o backend Django esta rodando."
      );
    }
  }

  function updateField<K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStatusMessage(null);
    setFieldErrors({});
  }

  function togglePasswordVisibility(field: "password" | "confirmPassword") {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  const activeTabIndex = mode === "login" ? 0 : 1;

  return (
    <main className={styles.page}>
      <div className={styles.beam} />
      <div className={styles.orbitLeft} />
      <div className={styles.orbitRight} />
      <div className={styles.orbitLower} />
      {Array.from({ length: 8 }).map((_, index) => (
        <span className={styles.star} key={index} />
      ))}

      <div className={styles.content}>
        <div
          className={[styles.stack, mode === "register" ? styles.stackRegister : styles.stackLogin]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.brandTitle}>Startup Quest</div>

          <section
            className={[styles.card, mode === "register" ? styles.cardRegister : styles.cardLogin]
              .filter(Boolean)
              .join(" ")}
            aria-label="Autenticacao"
          >
            <div className={styles.logoRegion}>
              <QuestMark animated mode={mode} />
            </div>

            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Escolha entre login e cadastro"
              style={{ "--active-tab-index": activeTabIndex } as CSSProperties}
            >
              <span className={styles.tabIndicator} aria-hidden="true" />
              <button
                className={[styles.tab, mode === "login" ? styles.tabActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isPending}
                onClick={() => changeMode("login")}
                role="tab"
                type="button"
                aria-selected={mode === "login"}
              >
                Entrar
              </button>
              <button
                className={[styles.tab, mode === "register" ? styles.tabActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isPending}
                onClick={() => changeMode("register")}
                role="tab"
                type="button"
                aria-selected={mode === "register"}
              >
                Criar conta
              </button>
            </div>

            <div
              className={[
                styles.formMotion,
                mode === "login" ? styles.formMotionLogin : styles.formMotionRegister,
              ]
                .filter(Boolean)
                .join(" ")}
              key={mode}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                {activeFields.map((field, index) => {
                  const errors = fieldErrors[field.name] ?? [];
                  const isPasswordField =
                    field.name === "password" || field.name === "confirmPassword";
                  const inputType = isPasswordField
                    ? visiblePasswords[field.name]
                      ? "text"
                      : "password"
                    : field.type;

                  return (
                    <label
                      className={[styles.field, errors.length > 0 ? styles.fieldError : ""]
                        .filter(Boolean)
                        .join(" ")}
                      key={field.name}
                      style={{ "--field-index": index } as CSSProperties}
                    >
                      <span className={styles.label}>{fieldLabels[field.name]}</span>

                      <span className={styles.inputShell}>
                        <span
                          className={field.tone === "warm" ? styles.dotWarm : styles.dotCool}
                          aria-hidden="true"
                        />
                        <input
                          autoComplete={field.autoComplete}
                          className={styles.input}
                          name={field.name}
                          onChange={(event) => updateField(field.name, event.target.value)}
                          placeholder={field.placeholder}
                          type={inputType}
                          value={formState[field.name]}
                        />
                        {isPasswordField ? (
                          <button
                            aria-label={
                              visiblePasswords[field.name]
                                ? "Ocultar senha"
                                : "Mostrar senha"
                            }
                            className={styles.visibilityToggle}
                            onClick={() => togglePasswordVisibility(field.name)}
                            type="button"
                          >
                            {visiblePasswords[field.name] ? (
                              <svg
                                aria-hidden="true"
                                className={styles.visibilityIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 3L21 21"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M9.88 5.09C10.56 4.89 11.27 4.79 12 4.79C16.78 4.79 20.78 9.09 22 12C21.53 13.12 20.73 14.38 19.66 15.45"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6.53 6.53C4.59 7.85 3.21 9.89 2 12C3.22 14.91 7.22 19.21 12 19.21C13.98 19.21 15.76 18.47 17.24 17.4"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                aria-hidden="true"
                                className={styles.visibilityIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2 12C3.22 9.09 7.22 4.79 12 4.79C16.78 4.79 20.78 9.09 22 12C20.78 14.91 16.78 19.21 12 19.21C7.22 19.21 3.22 14.91 2 12Z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        ) : null}
                      </span>

                      <span className={styles.fieldMessage}>{errors[0] ?? ""}</span>
                    </label>
                  );
                })}

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

                <button className={styles.submitButton} disabled={isPending} type="submit">
                  <span>{isPending ? "Preparando sua jornada..." : submitLabel}</span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
