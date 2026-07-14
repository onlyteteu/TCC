import { notFound } from "next/navigation";

import { StartupHomeScreen } from "@/components/home/startup-home-screen";

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  const numericId = Number(startupId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <StartupHomeScreen startupId={numericId} />;
}
