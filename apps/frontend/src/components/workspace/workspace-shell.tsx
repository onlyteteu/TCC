"use client";

import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { startupHomeHref } from "@/lib/startup-navigation";

import { WorkspaceBrand } from "./workspace-brand";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";
import { WorkspaceSidebar, type WorkspaceSection } from "./workspace-sidebar";
import { WorkspaceTopbar } from "./workspace-topbar";
import styles from "./workspace-shell.module.css";

function routeStartupId(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function activeSection(pathname: string): WorkspaceSection {
  if (pathname.includes("/missoes")) return "missions";
  if (pathname.endsWith("/jornada")) return "journey";
  return "home";
}

type WorkspaceFrameProps = {
  activeSection: WorkspaceSection;
  children: ReactNode;
};

function WorkspaceFrame({ activeSection: section, children }: WorkspaceFrameProps) {
  const { activeStartup, error, isLoading, isWorkspaceModalOpen, refreshWorkspace } = useWorkspace();
  const activeStartupId = activeStartup?.id ?? null;

  return (
    <>
      <a
        aria-hidden={isWorkspaceModalOpen ? "true" : undefined}
        className={styles.skipLink}
        href="#workspace-content"
        inert={isWorkspaceModalOpen ? true : undefined}
      >
        Ir para o conteudo
      </a>
      <div
        aria-hidden={isWorkspaceModalOpen ? "true" : undefined}
        className={styles.shell}
        inert={isWorkspaceModalOpen ? true : undefined}
      >
        <aside className={styles.sidebar}>
          <WorkspaceBrand
            href={activeStartupId ? startupHomeHref(activeStartupId) : "/painel/startups"}
          />
          <WorkspaceSidebar activeSection={section} startupId={activeStartupId} />
        </aside>
        <div className={styles.workspace}>
          <WorkspaceTopbar />
          <main className={styles.content} id="workspace-content" tabIndex={-1}>
            {error ? (
              <div className={styles.feedback} role="alert">
                <strong>Workspace indisponivel</strong>
                <p>{error}</p>
                <button onClick={() => void refreshWorkspace()} type="button">
                  Tentar novamente
                </button>
              </div>
            ) : isLoading ? (
              <div aria-live="polite" className={styles.loadingState}>
                Preparando seu workspace...
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const params = useParams<{ startupId?: string | string[] }>();
  const pathname = usePathname();
  const startupId = routeStartupId(params?.startupId);

  return (
    <WorkspaceProvider activeStartupId={startupId}>
      <WorkspaceFrame activeSection={activeSection(pathname)}>{children}</WorkspaceFrame>
    </WorkspaceProvider>
  );
}
