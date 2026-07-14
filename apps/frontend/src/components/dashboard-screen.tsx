"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import type { AuthUser, AuthenticatedUserPayload } from "@/lib/auth-types";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type {
  AccountProgress,
  StartupDeletePayload,
  StartupListPayload,
  StartupSummary,
  StartupUpdatePayload,
} from "@/lib/startup-types";

import { StartupCreationScreen } from "./startup-creation-screen";
import { StartupOverviewScreen } from "./startup-overview-screen";
import styles from "./dashboard-screen.module.css";

export function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [startups, setStartups] = useState<StartupSummary[]>([]);
  const [accountProgress, setAccountProgress] = useState<AccountProgress | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [flashTone, setFlashTone] = useState<"error" | "success">("success");
  const [highlightStartupId, setHighlightStartupId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingStartupId, setDeletingStartupId] = useState<number | null>(null);
  const [isCreatingStartup, setIsCreatingStartup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [userResponse, startupsResponse] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/startups", { cache: "no-store" }),
      ]);

      if (userResponse.status === 401 || startupsResponse.status === 401) {
        router.replace("/");
        return;
      }

      if (!userResponse.ok || !startupsResponse.ok) {
        setLoadError("Nao foi possivel carregar sua area interna agora.");
        return;
      }

      const userPayload = (await userResponse.json()) as AuthenticatedUserPayload;
      const startupPayload = (await startupsResponse.json()) as StartupListPayload;

      setUser(userPayload.user);
      setStartups(startupPayload.startups);
      setAccountProgress(startupPayload.accountProgress ?? null);
      setHighlightStartupId(null);
      setIsCreatingStartup(false);
    } catch {
      setLoadError("Nao foi possivel carregar sua area interna agora.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const refreshStartupsQuietly = useCallback(async () => {
    try {
      const response = await fetch("/api/startups", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as StartupListPayload;
      setStartups(payload.startups);
      setAccountProgress(payload.accountProgress ?? null);
    } catch {
      // atualizacao silenciosa; a proxima carga completa corrige
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    startLogoutTransition(() => {
      router.replace("/");
    });
  }

  function handleStartupCreated(startup: StartupSummary, message: string) {
    setStartups((current) => [startup, ...current]);
    setFlashMessage(message);
    setFlashTone("success");
    setHighlightStartupId(startup.id);
    setIsCreatingStartup(false);
    void refreshStartupsQuietly();
  }

  async function handleRenameStartup(
    startup: StartupSummary,
    name: string
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const payload = (await response.json()) as AuthErrorPayload | StartupUpdatePayload;

      if (response.status === 401) {
        router.replace("/");
        return { ok: false };
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload;
        return {
          ok: false,
          message:
            errorPayload.fieldErrors?.name?.[0] ??
            errorPayload.message ??
            "Nao foi possivel renomear a startup agora.",
        };
      }

      const successPayload = payload as StartupUpdatePayload;
      setStartups((current) =>
        current.map((item) => (item.id === startup.id ? successPayload.startup : item))
      );
      setFlashMessage(successPayload.message);
      setFlashTone("success");
      setHighlightStartupId(startup.id);
      return { ok: true };
    } catch {
      return { ok: false, message: "Nao foi possivel renomear a startup agora." };
    }
  }

  async function handleDeleteStartup(startup: StartupSummary) {
    setDeletingStartupId(startup.id);

    try {
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as AuthErrorPayload | StartupDeletePayload;

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        setFlashMessage(payload.message ?? "Nao foi possivel excluir a startup agora.");
        setFlashTone("error");
        return;
      }

      const successPayload = payload as StartupDeletePayload;
      setStartups((current) => current.filter((item) => item.id !== startup.id));
      setFlashMessage(successPayload.message);
      setFlashTone("success");
      setHighlightStartupId((current) => (current === startup.id ? null : current));
      void refreshStartupsQuietly();
    } catch {
      setFlashMessage("Nao foi possivel excluir a startup agora.");
      setFlashTone("error");
    } finally {
      setDeletingStartupId(null);
    }
  }

  if (isLoading) {
    return <JourneyLoadingState />;
  }

  if (loadError) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.feedbackCard}>
          <strong>Area interna indisponivel</strong>
          <p>{loadError}</p>
          <button className={styles.retryButton} onClick={loadDashboard} type="button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <JourneyLoadingState />;
  }

  if (startups.length === 0 || isCreatingStartup) {
    return (
      <StartupCreationScreen
        canGoBack={startups.length > 0}
        isLoggingOut={isLoggingOut}
        onBack={() => setIsCreatingStartup(false)}
        onCreated={handleStartupCreated}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <StartupOverviewScreen
      accountProgress={accountProgress}
      flashMessage={flashMessage}
      flashTone={flashTone}
      highlightStartupId={highlightStartupId}
      deletingStartupId={deletingStartupId}
      isLoggingOut={isLoggingOut}
      onCreateAnother={() => {
        setFlashMessage(null);
        setFlashTone("success");
        setHighlightStartupId(null);
        setIsCreatingStartup(true);
      }}
      onDeleteStartup={handleDeleteStartup}
      onLogout={handleLogout}
      onRenameStartup={handleRenameStartup}
      startups={startups}
      user={user}
    />
  );
}

function JourneyLoadingState() {
  return (
    <div className={styles.loadingState}>
      <div className={styles.loadingPortal} aria-live="polite">
        <span className={styles.loadingGlyph} aria-hidden="true" />
        <strong>Preparando sua jornada...</strong>
        <p>Buscando seu mapa inicial.</p>
      </div>
    </div>
  );
}
