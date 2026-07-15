import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  return proxyAuthenticatedBackend(`/startups/${startupId}/today/`, {
    fallbackMessage: "Não foi possível carregar o trabalho de hoje.",
  });
}
