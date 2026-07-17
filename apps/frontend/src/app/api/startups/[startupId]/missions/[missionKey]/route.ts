import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ startupId: string; missionKey: string }> }
) {
  const { startupId, missionKey } = await params;

  return proxyAuthenticatedBackend(`/startups/${startupId}/missions/${missionKey}/`, {
    fallbackMessage: "Nao foi possivel carregar esta missao.",
  });
}
