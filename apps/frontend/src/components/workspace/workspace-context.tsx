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
import type {
  AccountProgress,
  StartupListPayload,
  StartupOpenPayload,
  StartupSummary,
} from "@/lib/startup-types";

export type WorkspaceState = {
  accountProgress: AccountProgress | null;
  activeStartup: StartupSummary | null;
  error: string | null;
  isLoading: boolean;
  startups: StartupSummary[];
  user: AuthUser | null;
};

type WorkspaceContextValue = WorkspaceState & {
  isWorkspaceModalOpen: boolean;
  openStartup: (startupId: number) => Promise<boolean>;
  refreshWorkspace: (options?: RefreshWorkspaceOptions) => Promise<boolean>;
  setWorkspaceModalOpen: (open: boolean) => void;
};

export type RefreshWorkspaceOptions = {
  silent?: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceProviderProps = {
  activeStartupId?: number | null;
  children: ReactNode;
};

function reconcileStartupList(
  incoming: StartupSummary[],
  current: StartupSummary[],
  mutationVersions: Map<number, number>,
  requestVersion: number
) {
  const preserved = current.filter(
    (startup) => (mutationVersions.get(startup.id) ?? 0) > requestVersion
  );
  const preservedIds = new Set(preserved.map((startup) => startup.id));
  const incomingById = new Map(incoming.map((startup) => [startup.id, startup]));

  return [
    ...preserved.map((startup) => ({ ...incomingById.get(startup.id), ...startup })),
    ...incoming.filter((startup) => !preservedIds.has(startup.id)),
  ];
}

export function WorkspaceProvider({ activeStartupId = null, children }: WorkspaceProviderProps) {
  const router = useRouter();
  const [accountProgress, setAccountProgress] = useState<AccountProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [startups, setStartups] = useState<StartupSummary[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(activeStartupId);
  const lastMarkedStartupId = useRef<number | null>(null);
  const workspaceMutationVersion = useRef(0);
  const startupMutationVersions = useRef(new Map<number, number>());

  const refreshWorkspace = useCallback(async ({ silent = false }: RefreshWorkspaceOptions = {}) => {
    const mutationVersionAtRequest = workspaceMutationVersion.current;
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
      if (mutationVersionAtRequest === workspaceMutationVersion.current) {
        setStartups(startupPayload.startups);
      } else {
        setStartups((current) =>
          reconcileStartupList(
            startupPayload.startups,
            current,
            startupMutationVersions.current,
            mutationVersionAtRequest
          )
        );
      }
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
    async (startupId: number): Promise<StartupSummary | null> => {
      try {
        const response = await fetch(`/api/startups/${startupId}/open`, { method: "POST" });

        if (response.status === 401) {
          router.replace("/");
          return null;
        }

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as StartupOpenPayload;
        return payload.startup;
      } catch {
        return null;
      }
    },
    [router]
  );

  const openStartup = useCallback(
    async (startupId: number) => {
      const previousMarkedStartupId = lastMarkedStartupId.current;
      lastMarkedStartupId.current = startupId;
      const openedStartup = await markStartupOpened(startupId);
      if (!openedStartup) {
        lastMarkedStartupId.current = previousMarkedStartupId;
        return false;
      }

      workspaceMutationVersion.current += 1;
      startupMutationVersions.current.set(startupId, workspaceMutationVersion.current);
      setSelectedStartupId(startupId);
      setStartups((current) => {
        const previous = current.find((startup) => startup.id === startupId);
        const merged = { ...previous, ...openedStartup } as StartupSummary;
        return [merged, ...current.filter((startup) => startup.id !== startupId)];
      });
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
      return;
    }

    setSelectedStartupId(activeStartupId);

    if (lastMarkedStartupId.current === activeStartupId) {
      return;
    }

    lastMarkedStartupId.current = activeStartupId;
    void markStartupOpened(activeStartupId).then((openedStartup) => {
      if (!openedStartup) {
        lastMarkedStartupId.current = null;
        return;
      }
      workspaceMutationVersion.current += 1;
      startupMutationVersions.current.set(activeStartupId, workspaceMutationVersion.current);
      setStartups((current) => {
        const previous = current.find((startup) => startup.id === activeStartupId);
        const merged = { ...previous, ...openedStartup } as StartupSummary;
        return [merged, ...current.filter((startup) => startup.id !== activeStartupId)];
      });
    });
  }, [activeStartupId, markStartupOpened]);

  const activeStartup = useMemo(() => {
    if (selectedStartupId === null) {
      return startups[0] ?? null;
    }

    return startups.find((startup) => startup.id === selectedStartupId) ?? startups[0] ?? null;
  }, [selectedStartupId, startups]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      accountProgress,
      activeStartup,
      error,
      isLoading,
      isWorkspaceModalOpen,
      openStartup,
      refreshWorkspace,
      setWorkspaceModalOpen,
      startups,
      user,
    }),
    [
      accountProgress,
      activeStartup,
      error,
      isLoading,
      isWorkspaceModalOpen,
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
