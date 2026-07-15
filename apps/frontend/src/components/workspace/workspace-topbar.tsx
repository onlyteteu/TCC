"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ProductIcon } from "@/components/product-icon";

import { useWorkspace } from "./workspace-context";
import { closeDetailsMenu } from "./details-menu";
import styles from "./workspace-shell.module.css";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function WorkspaceTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accountProgress, activeStartup, openStartup, startups, user } = useWorkspace();
  const [openingStartupId, setOpeningStartupId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const startupPickerRef = useRef<HTMLDetailsElement>(null);
  const profileMenuRef = useRef<HTMLDetailsElement>(null);
  const streak = accountProgress?.currentStreak ?? 0;

  async function handleOpenStartup(startupId: number) {
    setOpeningStartupId(startupId);
    await openStartup(startupId);
    closeDetailsMenu(startupPickerRef.current, { restoreFocus: true });
    setOpeningStartupId(null);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      closeDetailsMenu(profileMenuRef.current, { restoreFocus: true });
      router.replace("/");
      setIsLoggingOut(false);
    }
  }

  return (
    <header className={styles.topbar}>
      <details className={styles.startupPicker} ref={startupPickerRef}>
        <summary aria-label="Selecionar startup" className={styles.startupPickerSummary}>
          <span className={styles.startupPickerMark} aria-hidden="true">
            {activeStartup?.name.slice(0, 1).toUpperCase() ?? "S"}
          </span>
          <span>
            <small>Startup ativa</small>
            <strong>{activeStartup?.name ?? "Nenhuma startup"}</strong>
          </span>
          <ProductIcon className={styles.chevronIcon} name="chevron" />
        </summary>
        <div className={styles.startupMenu}>
          {startups.slice(0, 4).map((startup) => (
            <button
              aria-current={startup.id === activeStartup?.id ? "true" : undefined}
              className={styles.startupOption}
              disabled={openingStartupId !== null}
              key={startup.id}
              onClick={() => void handleOpenStartup(startup.id)}
              type="button"
            >
              <span aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</span>
              <strong>{startup.name}</strong>
            </button>
          ))}
          <div className={styles.startupMenuLinks}>
            <Link
              onClick={() => closeDetailsMenu(startupPickerRef.current, {
                restoreFocus: pathname === "/painel/startups",
              })}
              href="/painel/startups"
            >
              Ver todas as startups
            </Link>
            <Link
              onClick={() => closeDetailsMenu(startupPickerRef.current, {
                restoreFocus: pathname === "/painel/startups/nova",
              })}
              href="/painel/startups/nova"
            >
              Criar nova startup
            </Link>
          </div>
        </div>
      </details>

      <div className={styles.topbarActions}>
        <span className={styles.progressPill} title="Sequencia atual">
          <ProductIcon name="flame" />
          <strong>{streak > 0 ? `${streak} ${streak === 1 ? "dia" : "dias"}` : "Comece hoje"}</strong>
        </span>
        <span className={styles.progressPill} title="Nivel global">
          <ProductIcon name="level" />
          <strong>Nivel {accountProgress?.level ?? 1} · {accountProgress?.xp ?? 0} XP</strong>
        </span>
        <details className={styles.profileMenu} ref={profileMenuRef}>
          <summary aria-label="Abrir menu do perfil" className={styles.avatar}>
            {initials(user?.name ?? "Usuario") || "U"}
          </summary>
          <div className={styles.profilePopover}>
            <div>
              <strong>{user?.name ?? "Usuario"}</strong>
              <small>{user?.email ?? ""}</small>
            </div>
            <button disabled={isLoggingOut} onClick={() => void handleLogout()} type="button">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
