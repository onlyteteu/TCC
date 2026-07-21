"use client";

import { useLayoutEffect, useRef, useState } from "react";

import type { StartupSummary } from "@/lib/startup-types";

import styles from "./startup-journey-screen.module.css";

export type StartupMapField =
  | "name"
  | "description"
  | "segment"
  | "problem"
  | "audience"
  | "initialGoal";

type StartupMapSummaryProps = {
  initialField?: StartupMapField | null;
  isSaving: boolean;
  onSaveField: (field: StartupMapField, value: string) => Promise<void>;
  startup: StartupSummary;
};

const mapFields: Array<{
  key: StartupMapField;
  label: string;
  multiline: boolean;
  helper: string;
}> = [
  {
    key: "name",
    label: "Nome",
    multiline: false,
    helper: "Como a startup sera reconhecida durante a jornada.",
  },
  {
    key: "description",
    label: "Ideia",
    multiline: true,
    helper: "A ideia central, explicada de forma simples e concreta.",
  },
  {
    key: "segment",
    label: "Territorio",
    multiline: false,
    helper: "O mercado ou contexto inicial em que a startup vai atuar.",
  },
  {
    key: "problem",
    label: "Problema",
    multiline: true,
    helper: "A dor que precisa desaparecer para o publico inicial.",
  },
  {
    key: "audience",
    label: "Publico inicial",
    multiline: true,
    helper: "As primeiras pessoas ou organizacoes que sentem essa dor.",
  },
  {
    key: "initialGoal",
    label: "Objetivo inicial",
    multiline: true,
    helper: "O resultado concreto que orienta os primeiros passos.",
  },
];

export function StartupMapSummary({
  initialField = null,
  isSaving,
  onSaveField,
  startup,
}: StartupMapSummaryProps) {
  const [editingField, setEditingField] = useState<StartupMapField | null>(
    initialField
  );
  const [draft, setDraft] = useState(
    initialField ? startup[initialField] : ""
  );
  const [error, setError] = useState<string | null>(null);
  const editButtonRefs = useRef<
    Partial<Record<StartupMapField, HTMLButtonElement | null>>
  >({});
  const focusReturnFieldRef = useRef<StartupMapField | null>(null);
  useLayoutEffect(() => {
    if (!editingField && focusReturnFieldRef.current) {
      editButtonRefs.current[focusReturnFieldRef.current]?.focus();
      focusReturnFieldRef.current = null;
    }
  }, [editingField]);

  function openEditor(field: StartupMapField) {
    setEditingField(field);
    setDraft(startup[field]);
    setError(null);
  }

  function closeEditor() {
    focusReturnFieldRef.current = editingField;
    setEditingField(null);
    setDraft("");
    setError(null);
  }

  async function saveField(field: StartupMapField) {
    const value = draft.trim();
    if (!value) {
      setError(field === "name" ? "Informe um nome para a startup." : "Esse campo nao pode ficar vazio.");
      return;
    }

    if (value === startup[field]) {
      closeEditor();
      return;
    }

    setError(null);
    try {
      await onSaveField(field, value);
      closeEditor();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Nao foi possivel salvar agora."
      );
    }
  }

  return (
    <section className={styles.mapSummary} aria-labelledby="map-summary-title">
      <div className={styles.mapHeading}>
        <div>
          <h2 id="map-summary-title">Mapa da startup</h2>
          <p>Revise a base da startup sem perder o contexto da jornada.</p>
        </div>
        <span>6 fundamentos</span>
      </div>

      <dl className={styles.mapFields}>
        {mapFields.map((field) => {
          const isEditing = editingField === field.key;
          const inputId = `map-field-${field.key}`;

          return (
            <div className={styles.mapField} key={field.key}>
              <div className={styles.mapFieldHeader}>
                <div>
                  <dt>{field.label}</dt>
                  <span>{field.helper}</span>
                </div>
                {!isEditing ? (
                  <button
                    aria-label={`Editar ${field.label}`}
                    className={styles.editButton}
                    disabled={isSaving}
                    onClick={() => openEditor(field.key)}
                    ref={(node) => {
                      editButtonRefs.current[field.key] = node;
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                ) : null}
              </div>

              <dd>
                {isEditing ? (
                  <div className={styles.mapEditor}>
                    <label htmlFor={inputId}>{field.label}</label>
                    {field.multiline ? (
                      <textarea
                        autoFocus
                        disabled={isSaving}
                        id={inputId}
                        onChange={(event) => {
                          setDraft(event.target.value);
                          setError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            closeEditor();
                          }
                        }}
                        rows={4}
                        value={draft}
                      />
                    ) : (
                      <input
                        autoFocus
                        disabled={isSaving}
                        id={inputId}
                        maxLength={120}
                        onChange={(event) => {
                          setDraft(event.target.value);
                          setError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            closeEditor();
                          }
                        }}
                        type="text"
                        value={draft}
                      />
                    )}

                    {error ? (
                      <p className={styles.formError} role="alert">
                        {error}
                      </p>
                    ) : null}

                    <div className={styles.mapActions}>
                      <button
                        aria-label={`Salvar ${field.label}`}
                        className={styles.primaryButton}
                        disabled={isSaving}
                        onClick={() => void saveField(field.key)}
                        type="button"
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        className={styles.secondaryButton}
                        disabled={isSaving}
                        onClick={closeEditor}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{startup[field.key]}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
