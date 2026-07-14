"use client";

import Link from "next/link";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

import { ProductIcon } from "@/components/product-icon";
import type { StartupSummary } from "@/lib/startup-types";

import styles from "./startup-manager-screen.module.css";

export type StartupManagerScreenProps = {
  activeStartupId: number | null;
  onDelete: (startup: StartupSummary) => Promise<string | null>;
  onOpen: (startupId: number) => Promise<void>;
  onRename: (startup: StartupSummary, name: string) => Promise<string | null>;
  startups: StartupSummary[];
};

type PendingAction = {
  startupId: number;
  type: "open" | "rename";
};

const activityFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const dialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function progressValue(startup: StartupSummary) {
  return Math.min(100, Math.max(0, startup.journeyProgress ?? 0));
}

function lastActivity(startup: StartupSummary) {
  const value = startup.lastActivityAt ?? startup.lastOpenedAt ?? startup.updatedAt;
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Sem atividade registrada";
  }

  return activityFormatter.format(date);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function StartupManagerScreen({
  activeStartupId,
  onDelete,
  onOpen,
  onRename,
  startups,
}: StartupManagerScreenProps) {
  const [editingStartupId, setEditingStartupId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StartupSummary | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [locallyDeletedStartupIds, setLocallyDeletedStartupIds] = useState<number[]>([]);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<HTMLElement>(null);
  const shouldRestoreDeleteFocusRef = useRef(false);
  const visibleStartups = startups.filter(
    (startup) => !locallyDeletedStartupIds.includes(startup.id)
  );

  useEffect(() => {
    if (deleteTarget) {
      deleteInputRef.current?.focus();
    }
  }, [deleteTarget]);

  useEffect(() => {
    if (deleteTarget || !shouldRestoreDeleteFocusRef.current) {
      return;
    }

    shouldRestoreDeleteFocusRef.current = false;
    const trigger = deleteTriggerRef.current;

    if (trigger?.isConnected) {
      trigger.focus();
    } else {
      managerRef.current?.focus();
    }
  }, [deleteTarget]);

  function clearRowError(startupId: number) {
    setRowErrors((current) => {
      if (!current[startupId]) {
        return current;
      }

      const next = { ...current };
      delete next[startupId];
      return next;
    });
  }

  function startRename(startup: StartupSummary) {
    clearRowError(startup.id);
    setEditingStartupId(startup.id);
    setDraftName(startup.name);
  }

  function cancelRename() {
    setEditingStartupId(null);
    setDraftName("");
  }

  async function handleOpen(startup: StartupSummary) {
    clearRowError(startup.id);
    setPendingAction({ startupId: startup.id, type: "open" });

    try {
      await onOpen(startup.id);
    } catch (error) {
      setRowErrors((current) => ({
        ...current,
        [startup.id]: errorMessage(error, "Nao foi possivel abrir a startup agora."),
      }));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRename(startup: StartupSummary) {
    const name = draftName.trim();

    if (!name) {
      setRowErrors((current) => ({ ...current, [startup.id]: "Informe um nome para a startup." }));
      return;
    }

    clearRowError(startup.id);
    setPendingAction({ startupId: startup.id, type: "rename" });

    try {
      const error = await onRename(startup, name);

      if (error) {
        setRowErrors((current) => ({ ...current, [startup.id]: error }));
        return;
      }

      cancelRename();
    } catch (error) {
      setRowErrors((current) => ({
        ...current,
        [startup.id]: errorMessage(error, "Nao foi possivel renomear a startup agora."),
      }));
    } finally {
      setPendingAction(null);
    }
  }

  function openDeleteDialog(startup: StartupSummary, trigger: HTMLButtonElement) {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(startup);
    setDeleteConfirmation("");
    setDeleteError(null);
  }

  function closeDeleteDialog() {
    if (isDeleting) {
      return;
    }

    shouldRestoreDeleteFocusRef.current = true;
    setDeleteTarget(null);
    setDeleteConfirmation("");
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.name) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      const deletedStartupId = deleteTarget.id;
      const warning = (await onDelete(deleteTarget)) ?? null;
      setLocallyDeletedStartupIds((current) =>
        current.includes(deletedStartupId) ? current : [...current, deletedStartupId]
      );
      setDeleteWarning(warning);
      shouldRestoreDeleteFocusRef.current = true;
      setDeleteTarget(null);
      setDeleteConfirmation("");
    } catch (error) {
      setDeleteError(errorMessage(error, "Nao foi possivel excluir a startup agora."));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDeleteDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(dialogFocusableSelector)
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements.at(-1);

    if (!firstFocusable || !lastFocusable) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const activeElement = document.activeElement;
    if (event.shiftKey && (activeElement === firstFocusable || !dialog.contains(activeElement))) {
      event.preventDefault();
      lastFocusable.focus();
      return;
    }

    if (!event.shiftKey && (activeElement === lastFocusable || !dialog.contains(activeElement))) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  return (
    <section
      aria-labelledby="startup-manager-title"
      className={styles.page}
      ref={managerRef}
      tabIndex={-1}
    >
      <div
        aria-hidden={deleteTarget ? "true" : undefined}
        className={styles.managerContent}
        inert={deleteTarget ? true : undefined}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Portfólio</span>
            <h1 id="startup-manager-title">Suas startups</h1>
            <p>Abra uma jornada ou organize as startups vinculadas à sua conta.</p>
          </div>
          {visibleStartups.length > 0 ? (
            <Link className={styles.primaryAction} href="/painel/startups/nova">
              <ProductIcon name="plus" />
              Criar nova startup
            </Link>
          ) : null}
        </header>

        {deleteWarning ? (
          <p className={styles.pageWarning} role="status">
            {deleteWarning}
          </p>
        ) : null}

        {visibleStartups.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <ProductIcon name="building" />
            </span>
            <h2>Crie sua primeira startup</h2>
            <p>Comece pelo onboarding para transformar sua ideia em uma jornada prática.</p>
            <Link className={styles.primaryAction} href="/painel/startups/nova">
              <ProductIcon name="plus" />
              Criar nova startup
            </Link>
          </div>
        ) : (
          <ul className={styles.list} aria-label="Startups da conta">
          {visibleStartups.map((startup) => {
            const isActive = startup.id === activeStartupId;
            const isEditing = editingStartupId === startup.id;
            const isOpening =
              pendingAction?.startupId === startup.id && pendingAction.type === "open";
            const isRenaming =
              pendingAction?.startupId === startup.id && pendingAction.type === "rename";
            const progress = progressValue(startup);

            return (
              <li className={styles.row} key={startup.id}>
                <div className={styles.identity}>
                  <span className={styles.mark} aria-hidden="true">
                    {startup.name.slice(0, 1).toUpperCase() || "S"}
                  </span>
                  <div className={styles.nameBlock}>
                    {isEditing ? (
                      <div className={styles.renameForm}>
                        <label className={styles.srOnly} htmlFor={`startup-name-${startup.id}`}>
                          Novo nome de {startup.name}
                        </label>
                        <input
                          autoFocus
                          disabled={isRenaming}
                          id={`startup-name-${startup.id}`}
                          onChange={(event) => {
                            setDraftName(event.target.value);
                            clearRowError(startup.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleRename(startup);
                            }
                            if (event.key === "Escape") {
                              cancelRename();
                            }
                          }}
                          value={draftName}
                        />
                        <button
                          className={styles.saveButton}
                          disabled={isRenaming}
                          onClick={() => void handleRename(startup)}
                          type="button"
                        >
                          {isRenaming ? "Salvando..." : "Salvar nome"}
                        </button>
                        <button
                          className={styles.textButton}
                          disabled={isRenaming}
                          onClick={cancelRename}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <strong>{startup.name}</strong>
                        {isActive ? <span className={styles.activeBadge}>Startup ativa</span> : null}
                      </>
                    )}
                    {rowErrors[startup.id] ? (
                      <span className={styles.rowError} role="alert">
                        {rowErrors[startup.id]}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.phase}>
                  <span>Fase atual</span>
                  <strong>{startup.currentStageLabel || "Primeiros passos"}</strong>
                </div>

                <div className={styles.progressBlock}>
                  <div>
                    <span>Jornada</span>
                    <strong>{progress}%</strong>
                  </div>
                  <span
                    aria-label={`Progresso de ${startup.name}`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={progress}
                    className={styles.progressTrack}
                    role="progressbar"
                  >
                    <span className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </span>
                </div>

                <div className={styles.activity}>
                  <span>Última atividade</span>
                  <strong>{lastActivity(startup)}</strong>
                </div>

                <div className={styles.actions} aria-label={`Ações de ${startup.name}`}>
                  <button
                    className={styles.openButton}
                    disabled={pendingAction !== null}
                    onClick={() => void handleOpen(startup)}
                    type="button"
                  >
                    {isOpening ? "Abrindo..." : `Abrir ${startup.name}`}
                  </button>
                  <button
                    className={styles.iconButton}
                    disabled={pendingAction !== null || isEditing}
                    onClick={() => startRename(startup)}
                    type="button"
                  >
                    Renomear {startup.name}
                  </button>
                  <button
                    className={[styles.iconButton, styles.dangerButton].join(" ")}
                    disabled={pendingAction !== null}
                    onClick={(event) => openDeleteDialog(startup, event.currentTarget)}
                    type="button"
                  >
                    Excluir {startup.name}
                  </button>
                </div>
              </li>
            );
          })}
          </ul>
        )}
      </div>

      {deleteTarget ? (
        <div className={styles.modalBackdrop}>
          <div
            aria-labelledby="delete-startup-title"
            aria-modal="true"
            className={styles.dialog}
            onKeyDown={handleDialogKeyDown}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <span className={styles.dangerIcon} aria-hidden="true">
              !
            </span>
            <h2 id="delete-startup-title">Excluir {deleteTarget.name}?</h2>
            <p>
              Esta ação é permanente. A jornada, missoes e evidencias desta startup serão removidas.
            </p>
            <label className={styles.confirmField}>
              <span>Digite {deleteTarget.name} para confirmar</span>
              <input
                autoComplete="off"
                disabled={isDeleting}
                onChange={(event) => {
                  setDeleteConfirmation(event.target.value);
                  setDeleteError(null);
                }}
                ref={deleteInputRef}
                value={deleteConfirmation}
              />
            </label>
            {deleteError ? (
              <p className={styles.dialogError} role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className={styles.dialogActions}>
              <button
                className={styles.textButton}
                disabled={isDeleting}
                onClick={closeDeleteDialog}
                type="button"
              >
                Cancelar
              </button>
              <button
                className={styles.confirmDeleteButton}
                disabled={isDeleting || deleteConfirmation !== deleteTarget.name}
                onClick={() => void handleDelete()}
                type="button"
              >
                {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
