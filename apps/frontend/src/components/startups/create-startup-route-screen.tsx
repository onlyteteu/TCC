"use client";

import { useRouter } from "next/navigation";

import { StartupCreationScreen } from "@/components/startup-creation-screen";
import { startupHomeHref } from "@/lib/startup-navigation";

export function CreateStartupRouteScreen() {
  const router = useRouter();

  return (
    <StartupCreationScreen
      canGoBack
      onBack={() => router.push("/painel/startups")}
      onCreated={(startup) => router.replace(startupHomeHref(startup.id))}
    />
  );
}
