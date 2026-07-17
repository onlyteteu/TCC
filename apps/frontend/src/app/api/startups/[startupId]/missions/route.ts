import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  return proxyAuthenticatedBackend(`/startups/${startupId}/missions/`, {
    fallbackMessage: "Nao foi possivel carregar as missoes.",
  });
}
