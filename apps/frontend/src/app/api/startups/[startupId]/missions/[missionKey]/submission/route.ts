import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ startupId: string; missionKey: string }> }
) {
  const { startupId, missionKey } = await params;
  return proxyAuthenticatedBackend(
    `/startups/${startupId}/missions/${missionKey}/submission/`,
    {
      body: await request.text(),
      fallbackMessage: "Nao foi possivel registrar o entregavel da missao.",
      method: "POST",
    }
  );
}
