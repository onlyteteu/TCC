import { notFound } from "next/navigation";

import { StartupJourneyScreen } from "@/components/journey/startup-journey-screen";

export default async function StartupJourneyPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  const numericId = Number(startupId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <StartupJourneyScreen startupId={numericId} />;
}
