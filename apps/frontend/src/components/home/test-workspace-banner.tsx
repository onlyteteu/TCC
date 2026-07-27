"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import styles from "./test-workspace-banner.module.css";

type TestWorkspaceBannerProps = {
  onModalChange?: (open: boolean) => void;
  onReset: () => Promise<void>;
};

export function TestWorkspaceBanner({
  onModalChange,
  onReset,
}: TestWorkspaceBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const requestPendingRef = useRef(false);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    onModalChange?.(isOpen);

    if (isOpen) {
      shouldRestoreFocusRef.current = true;
      cancelRef.current?.focus();
    } else if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen, onModalChange]);

  useEffect(
    () => () => {
      onModalChange?.(false);
    },
    [onModalChange]
  );

  function openDialog() {
    setError(null);
    setIsOpen(true);
  }

  function closeDialog() {
    if (requestPendingRef.current) {
      return;
    }
    setError(null);
    setIsOpen(false);
  }

  async function confirmReset() {
    if (requestPendingRef.current) {
      return;
    }

    requestPendingRef.current = true;
    setIsResetting(true);
    setError(null);

    try {
      await onReset();
      setIsOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível reiniciar o ambiente de teste."
      );
    } finally {
      requestPendingRef.current = false;
      setIsResetting(false);
    }
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const dialog =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div className={styles.backdrop} onMouseDown={closeDialog}>
            <section
              aria-busy={isResetting}
              aria-labelledby="test-workspace-dialog-title"
              aria-modal="true"
              className={styles.dialog}
              onKeyDown={handleDialogKeyDown}
              onMouseDown={(event) => event.stopPropagation()}
              ref={dialogRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className={styles.dialogHeader}>
                <span aria-hidden="true" className={styles.warningMark}>
                  !
                </span>
                <div>
                  <h2 id="test-workspace-dialog-title">
                    Reiniciar ambiente de teste
                  </h2>
                  <p>
                    A mesma startup será mantida, mas todo o trabalho criado
                    durante os testes voltará ao ponto inicial.
                  </p>
                </div>
              </div>

              <div className={styles.resetScope}>
                <strong>O que será removido</strong>
                <ul>
                  <li>Progresso da jornada</li>
                  <li>Missões e seus estados</li>
                  <li>Entrevistas e outras evidências</li>
                  <li>Aprendizados</li>
                  <li>Atividades e XP dos testes</li>
                </ul>
              </div>

              <p className={styles.preserved}>
                Sua conta, o ID e os dados-base da Startup de Teste serão
                preservados.
              </p>

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <div className={styles.actions}>
                <button
                  className={styles.cancelButton}
                  disabled={isResetting}
                  onClick={closeDialog}
                  ref={cancelRef}
                  type="button"
                >
                  Manter progresso
                </button>
                <button
                  className={styles.dangerButton}
                  disabled={isResetting}
                  onClick={() => void confirmReset()}
                  type="button"
                >
                  {isResetting
                    ? "Reiniciando..."
                    : "Reiniciar na primeira missão"}
                </button>
              </div>
            </section>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <aside aria-label="Modo de teste" className={styles.banner}>
        <span className={styles.modeLabel}>Teste</span>
        <div className={styles.bannerCopy}>
          <strong>Modo de teste</strong>
          <span>Este ambiente pode voltar à primeira missão a qualquer momento.</span>
        </div>
        <button
          className={styles.resetButton}
          onClick={openDialog}
          ref={triggerRef}
          type="button"
        >
          Reiniciar ambiente
        </button>
      </aside>
      {dialog}
    </>
  );
}
