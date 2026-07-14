"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { QuestMark } from "@/components/quest-mark";
import type { AuthUser } from "@/lib/auth-types";
import type { AccountProgress, StartupSummary } from "@/lib/startup-types";

import styles from "./startup-overview-screen.module.css";

type RenameResult = { ok: boolean; message?: string };

type StartupOverviewScreenProps = {
  accountProgress?: AccountProgress | null;
  flashMessage?: string | null;
  flashTone?: "error" | "success";
  highlightStartupId?: number | null;
  deletingStartupId?: number | null;
  isLoggingOut?: boolean;
  onCreateAnother: () => void;
  onDeleteStartup: (startup: StartupSummary) => void;
  onLogout: () => void;
  onRenameStartup: (startup: StartupSummary, name: string) => Promise<RenameResult>;
  startups: StartupSummary[];
  user: AuthUser;
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

export function StartupOverviewScreen({
  accountProgress = null,
  flashMessage,
  flashTone = "success",
  highlightStartupId = null,
  deletingStartupId = null,
  isLoggingOut = false,
  onCreateAnother,
  onDeleteStartup,
  onLogout,
  onRenameStartup,
  startups,
  user,
}: StartupOverviewScreenProps) {
  const startupsWithProgress = startups.filter(
    (startup) => typeof startup.journeyProgress === "number"
  );
  const averageProgress =
    startupsWithProgress.length > 0
      ? Math.round(
          startupsWithProgress.reduce(
            (total, startup) => total + (startup.journeyProgress ?? 0),
            0
          ) / startupsWithProgress.length
        )
      : 0;

  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StartupSummary | null>(null);

  function openRename(startup: StartupSummary) {
    setRenameTargetId(startup.id);
    setRenameDraft(isDeferredName(startup) ? "" : startup.name);
    setRenameError(null);
  }

  function closeRename() {
    setRenameTargetId(null);
    setRenameDraft("");
    setRenameError(null);
  }

  async function submitRename(startup: StartupSummary) {
    const nextName = renameDraft.trim();

    if (!nextName) {
      setRenameError("Informe um nome para a startup.");
      return;
    }

    if (nextName === startup.name) {
      closeRename();
      return;
    }

    setIsSavingRename(true);

    try {
      const result = await onRenameStartup(startup, nextName);

      if (result.ok) {
        closeRename();
        return;
      }

      if (result.message) {
        setRenameError(result.message);
      }
    } finally {
      setIsSavingRename(false);
    }
  }

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
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <QuestMark animated />

            <div className={styles.brandCopy}>
              <span className={styles.eyebrow}>Startup Quest</span>
              <h1>Ola, {user.name}.</h1>
              <p>Sua conta ja tem startup criada e pronta para os proximos passos.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryButton} onClick={onCreateAnother} type="button">
              Nova startup
            </button>
            <button className={styles.primaryButton} onClick={onLogout} type="button">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </header>

        {flashMessage ? (
          <div
            className={[
              styles.flash,
              flashTone === "error" ? styles.flashError : "",
              highlightStartupId ? styles.flashFresh : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {flashMessage}
          </div>
        ) : null}

        <section className={styles.metrics}>
          <article className={styles.metricCard}>
            <span>Startups</span>
            <strong>{startups.length.toString().padStart(2, "0")}</strong>
          </article>

          <article className={styles.metricCard}>
            <span>Nivel</span>
            <strong>
              {(accountProgress?.level ?? 1).toString().padStart(2, "0")}
              {accountProgress ? (
                <em className={styles.metricDetail}>{accountProgress.xp} XP</em>
              ) : null}
            </strong>
          </article>

          <article className={styles.metricCard}>
            <span>Progresso medio</span>
            <strong>{averageProgress}%</strong>
          </article>
        </section>

        {accountProgress ? (
          <section className={styles.achievements} aria-label="Conquistas">
            <span className={styles.achievementsTitle}>
              Conquistas · {accountProgress.unlockedCount} de {accountProgress.achievements.length}
            </span>

            <div className={styles.achievementsRow}>
              {accountProgress.achievements.map((achievement) => (
                <span
                  className={[
                    styles.achievementChip,
                    achievement.unlocked ? styles.achievementUnlocked : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={achievement.key}
                  title={achievement.description}
                >
                  {achievement.unlocked ? "★" : "☆"} {achievement.title}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Suas startups</h2>
            <p>Enquanto o hub completo nao entra, esta area ja mostra o que voce criou.</p>
          </div>

          <div className={styles.grid}>
            {startups.map((startup) => {
              const isDeleting = deletingStartupId === startup.id;

              return (
                <article
                  className={[styles.card, highlightStartupId === startup.id ? styles.cardFresh : ""]
                    .filter(Boolean)
                    .join(" ")}
                  key={startup.id}
                >
                <div className={styles.cardHeader}>
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

                  <span className={styles.dateChip}>{formatCreatedAt(startup.createdAt)}</span>
                </div>

                {renameTargetId === startup.id ? (
                  <form
                    className={styles.renameForm}
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitRename(startup);
                    }}
                  >
                    <input
                      autoFocus
                      className={styles.renameInput}
                      disabled={isSavingRename}
                      maxLength={120}
                      onChange={(event) => {
                        setRenameDraft(event.target.value);
                        setRenameError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          closeRename();
                        }
                      }}
                      placeholder="Nome da startup"
                      type="text"
                      value={renameDraft}
                    />

                    {renameError ? <span className={styles.renameError}>{renameError}</span> : null}

                    <div className={styles.renameActions}>
                      <button
                        className={styles.renameSave}
                        disabled={isSavingRename}
                        type="submit"
                      >
                        {isSavingRename ? "Salvando..." : "Salvar nome"}
                      </button>
                      <button
                        className={styles.renameCancel}
                        disabled={isSavingRename}
                        onClick={closeRename}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.nameRow}>
                    <h3>
                      <Link className={styles.nameLink} href={`/painel/startup/${startup.id}`}>
                        {startup.name}
                      </Link>
                    </h3>
                    <button
                      className={[
                        styles.renameButton,
                        isDeferredName(startup) ? styles.renameButtonCallout : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => openRename(startup)}
                      type="button"
                    >
                      {isDeferredName(startup) ? "Dar nome agora" : "Renomear"}
                    </button>
                  </div>
                )}

                {typeof startup.journeyProgress === "number" ? (
                  <div className={styles.journeyRow}>
                    <div className={styles.journeyTrack} aria-hidden="true">
                      <span
                        className={styles.journeyFill}
                        style={{ width: `${startup.journeyProgress}%` }}
                      />
                    </div>
                    <span className={styles.journeyLabel}>
                      {startup.journeyProgress}%
                      {startup.nextStepLabel ? ` · Proxima: ${startup.nextStepLabel}` : " · Jornada completa"}
                    </span>
                  </div>
                ) : null}

                <dl className={styles.details}>
                  {startup.description ? (
                    <div>
                      <dt>Ideia</dt>
                      <dd>{startup.description}</dd>
                    </div>
                  ) : null}

                  {startup.segment ? (
                    <div>
                      <dt>Segmento</dt>
                      <dd>{startup.segment}</dd>
                    </div>
                  ) : null}

                  {startup.problem ? (
                    <div>
                      <dt>Problema</dt>
                      <dd>{startup.problem}</dd>
                    </div>
                  ) : null}

                  {startup.audience ? (
                    <div>
                      <dt>Publico inicial</dt>
                      <dd>{startup.audience}</dd>
                    </div>
                  ) : null}

                  <div>
                    <dt>Etapa atual</dt>
                    <dd>{startup.currentStageLabel}</dd>
                  </div>

                  <div>
                    <dt>Status</dt>
                    <dd>{isDeferredName(startup) ? "Pode receber nome depois" : "Nome definido"}</dd>
                  </div>
                </dl>

                <div className={styles.cardFooter}>
                  <Link className={styles.enterButton} href={`/painel/startup/${startup.id}`}>
                    Entrar na startup
                  </Link>

                  <button
                    className={styles.dangerButton}
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(startup)}
                    type="button"
                  >
                    {isDeleting ? "Excluindo..." : "Excluir startup"}
                  </button>
                </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {deleteTarget ? (
        <DeleteConfirmationDialog
          startup={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            onDeleteStartup(deleteTarget);
            setDeleteTarget(null);
          }}
        />
      ) : null}
    </main>
  );
}

function DeleteConfirmationDialog({
  onCancel,
  onConfirm,
  startup,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  startup: StartupSummary;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      aria-labelledby="delete-dialog-title"
      aria-modal="true"
      className={styles.dialogOverlay}
      onClick={onCancel}
      role="dialog"
    >
      <div className={styles.dialogCard} onClick={(event) => event.stopPropagation()}>
        <span className={styles.dialogEyebrow}>Decisao importante</span>
        <strong className={styles.dialogTitle} id="delete-dialog-title">
          Excluir {startup.name}?
        </strong>
        <p className={styles.dialogText}>
          O mapa inicial dessa startup sera apagado da sua conta. Essa acao nao pode ser desfeita.
        </p>

        <div className={styles.dialogActions}>
          <button autoFocus className={styles.dialogCancel} onClick={onCancel} type="button">
            Manter startup
          </button>
          <button className={styles.dialogConfirm} onClick={onConfirm} type="button">
            Excluir de vez
          </button>
        </div>
      </div>
    </div>
  );
}
