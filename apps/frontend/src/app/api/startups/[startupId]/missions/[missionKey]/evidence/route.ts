import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ startupId: string; missionKey: string }> }
) {
  const { startupId, missionKey } = await params;

  return proxyAuthenticatedBackend(
    `/startups/${startupId}/missions/${missionKey}/evidence/`,
    {
      body: await request.text(),
      fallbackMessage: "Não foi possível registrar a entrevista.",
      method: "POST",
    }
  );
}
