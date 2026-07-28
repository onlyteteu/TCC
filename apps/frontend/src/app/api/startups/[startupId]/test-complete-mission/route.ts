import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  return proxyAuthenticatedBackend(
    `/startups/${startupId}/test-complete-mission/`,
    {
      fallbackMessage: "Não foi possível concluir a missão de teste.",
      method: "POST",
    }
  );
}
