"use client";

import { useRouter } from "next/navigation";

import { StartupManagerScreen } from "@/components/startups/startup-manager-screen";
import { useWorkspace } from "@/components/workspace/workspace-context";
import type { AuthErrorPayload } from "@/lib/auth-types";
import { startupHomeHref } from "@/lib/startup-navigation";
import type {
  StartupDeletePayload,
  StartupSummary,
  StartupUpdatePayload,
} from "@/lib/startup-types";

async function readPayload<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function StartupManagerPage() {
  const router = useRouter();
  const { activeStartup, openStartup, refreshWorkspace, startups } = useWorkspace();

  async function handleOpen(startupId: number) {
    const opened = await openStartup(startupId);

    if (!opened) {
      throw new Error("Nao foi possivel abrir a startup agora.");
    }
  }

  async function handleRename(startup: StartupSummary, name: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/startups/${startup.id}`, {
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = await readPayload<AuthErrorPayload | StartupUpdatePayload>(response);

      if (response.status === 401) {
        router.replace("/");
        return "Sua sessao expirou. Entre novamente para continuar.";
      }

      if (!response.ok) {
        const errorPayload = payload as AuthErrorPayload | null;
        return (
          errorPayload?.fieldErrors?.name?.[0] ??
          errorPayload?.message ??
          "Nao foi possivel renomear a startup agora."
        );
      }

      const refreshed = await refreshWorkspace({ silent: true });
      if (!refreshed) {
        return "Nome alterado, mas nao foi possivel atualizar a lista.";
      }
      return null;
    } catch {
      return "Nao foi possivel renomear a startup agora.";
    }
  }

  async function handleDelete(startup: StartupSummary) {
    let response: Response;

    try {
      response = await fetch(`/api/startups/${startup.id}`, { method: "DELETE" });
    } catch {
      throw new Error("Nao foi possivel excluir a startup agora.");
    }

    const payload = await readPayload<AuthErrorPayload | StartupDeletePayload>(response);

    if (response.status === 401) {
      router.replace("/");
      throw new Error("Sua sessao expirou. Entre novamente para continuar.");
    }

    if (!response.ok) {
      throw new Error(
        (payload as AuthErrorPayload | null)?.message ??
          "Nao foi possivel excluir a startup agora."
      );
    }

    if (!payload) {
      throw new Error("Nao foi possivel confirmar a exclusao da startup.");
    }

    const successPayload = payload as StartupDeletePayload;
    const refreshed = await refreshWorkspace({ silent: true });
    if (!refreshed) {
      throw new Error("Startup excluida, mas nao foi possivel atualizar a lista.");
    }

    if (startup.id === activeStartup?.id) {
      router.replace(
        successPayload.nextStartupId
          ? startupHomeHref(successPayload.nextStartupId)
          : "/painel/startups/nova"
      );
    }
  }

  return (
    <StartupManagerScreen
      activeStartupId={activeStartup?.id ?? null}
      onDelete={handleDelete}
      onOpen={handleOpen}
      onRename={handleRename}
      startups={startups}
    />
  );
}
