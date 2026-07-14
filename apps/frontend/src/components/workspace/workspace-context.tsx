"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AuthenticatedUserPayload, AuthUser } from "@/lib/auth-types";
import { startupHomeHref } from "@/lib/startup-navigation";
import type { AccountProgress, StartupListPayload, StartupSummary } from "@/lib/startup-types";

export type WorkspaceState = {
  accountProgress: AccountProgress | null;
  activeStartup: StartupSummary | null;
  error: string | null;
  isLoading: boolean;
  startups: StartupSummary[];
  user: AuthUser | null;
};

type WorkspaceContextValue = WorkspaceState & {
  openStartup: (startupId: number) => Promise<boolean>;
  refreshWorkspace: (options?: RefreshWorkspaceOptions) => Promise<boolean>;
};

export type RefreshWorkspaceOptions = {
  silent?: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceProviderProps = {
  activeStartupId?: number | null;
  children: ReactNode;
};

export function WorkspaceProvider({ activeStartupId = null, children }: WorkspaceProviderProps) {
  const router = useRouter();
  const [accountProgress, setAccountProgress] = useState<AccountProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startups, setStartups] = useState<StartupSummary[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const lastMarkedStartupId = useRef<number | null>(null);

  const refreshWorkspace = useCallback(async ({ silent = false }: RefreshWorkspaceOptions = {}) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const [userResponse, startupsResponse] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/startups", { cache: "no-store" }),
      ]);

      if (userResponse.status === 401 || startupsResponse.status === 401) {
        router.replace("/");
        return false;
      }

      if (!userResponse.ok || !startupsResponse.ok) {
        if (!silent) {
          setError("Nao foi possivel carregar seu workspace agora.");
        }
        return false;
      }

      const userPayload = (await userResponse.json()) as AuthenticatedUserPayload;
      const startupPayload = (await startupsResponse.json()) as StartupListPayload;

      setUser(userPayload.user);
      setStartups(startupPayload.startups);
      setAccountProgress(startupPayload.accountProgress ?? null);
      return true;
    } catch {
      if (!silent) {
        setError("Nao foi possivel carregar seu workspace agora.");
      }
      return false;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [router]);

  const markStartupOpened = useCallback(
    async (startupId: number): Promise<boolean> => {
      try {
        const response = await fetch(`/api/startups/${startupId}/open`, { method: "POST" });

        if (response.status === 401) {
          router.replace("/");
          return false;
        }

        return response.ok;
      } catch {
        return false;
      }
    },
    [router]
  );

  const openStartup = useCallback(
    async (startupId: number) => {
      const opened = await markStartupOpened(startupId);
      if (!opened) {
        return false;
      }

      router.push(startupHomeHref(startupId));
      return true;
    },
    [markStartupOpened, router]
  );

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  useEffect(() => {
    if (activeStartupId === null) {
      lastMarkedStartupId.current = null;
      return;
    }

    if (lastMarkedStartupId.current === activeStartupId) {
      return;
    }

    lastMarkedStartupId.current = activeStartupId;
    void markStartupOpened(activeStartupId);
  }, [activeStartupId, markStartupOpened]);

  const activeStartup = useMemo(() => {
    if (activeStartupId === null) {
      return startups[0] ?? null;
    }

    return startups.find((startup) => startup.id === activeStartupId) ?? null;
  }, [activeStartupId, startups]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      accountProgress,
      activeStartup,
      error,
      isLoading,
      openStartup,
      refreshWorkspace,
      startups,
      user,
    }),
    [
      accountProgress,
      activeStartup,
      error,
      isLoading,
      openStartup,
      refreshWorkspace,
      startups,
      user,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) {
    throw new Error("useWorkspace deve ser usado dentro de WorkspaceProvider");
  }
  return value;
}
