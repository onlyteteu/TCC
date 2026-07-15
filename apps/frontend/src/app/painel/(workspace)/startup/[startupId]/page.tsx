import { notFound } from "next/navigation";

import { StartupHomeRouteScreen } from "@/components/home/startup-home-route-screen";

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

  return <StartupHomeRouteScreen startupId={numericId} />;
}
