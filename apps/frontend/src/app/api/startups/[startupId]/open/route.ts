import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;
  return proxyAuthenticatedBackend(`/startups/${startupId}/open/`, {
    fallbackMessage: "Nao foi possivel abrir a startup agora.",
    method: "POST",
  });
}
