import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;
  return proxyAuthenticatedBackend(`/startups/${startupId}/open/`, {
    fallbackMessage: "Não foi possível abrir a startup agora.",
    method: "POST",
  });
}
