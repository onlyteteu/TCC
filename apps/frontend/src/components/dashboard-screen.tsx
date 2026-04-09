"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import type { AuthUser, AuthenticatedUserPayload } from "@/lib/auth-types";
import type { StartupListPayload, StartupSummary } from "@/lib/startup-types";

import { StartupCreationScreen } from "./startup-creation-screen";
import { StartupOverviewScreen } from "./startup-overview-screen";
import styles from "./dashboard-screen.module.css";

export function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [startups, setStartups] = useState<StartupSummary[]>([]);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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
    setIsCreatingStartup(false);
  }

  if (isLoading) {
    return <div className={styles.loadingState}>Conectando sua jornada...</div>;
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
    return <div className={styles.loadingState}>Conectando sua jornada...</div>;
  }

  if (startups.length === 0 || isCreatingStartup) {
    return (
      <StartupCreationScreen
        canGoBack={startups.length > 0}
        onBack={() => setIsCreatingStartup(false)}
        onCreated={handleStartupCreated}
      />
    );
  }

  return (
    <StartupOverviewScreen
      flashMessage={flashMessage}
      isLoggingOut={isLoggingOut}
      onCreateAnother={() => {
        setFlashMessage(null);
        setIsCreatingStartup(true);
      }}
      onLogout={handleLogout}
      startups={startups}
      user={user}
    />
  );
}
