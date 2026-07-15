import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string; missionKey: string }> }
) {
  const { startupId, missionKey } = await params;

  return proxyAuthenticatedBackend(
    `/startups/${startupId}/missions/${missionKey}/complete/`,
    {
      fallbackMessage: "Não foi possível concluir a missão.",
      method: "POST",
    }
  );
}
