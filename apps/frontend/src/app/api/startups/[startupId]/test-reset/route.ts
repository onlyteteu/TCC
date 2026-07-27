import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  return proxyAuthenticatedBackend(`/startups/${startupId}/test-reset/`, {
    body: await request.text(),
    fallbackMessage: "Não foi possível reiniciar o ambiente de teste.",
    method: "POST",
  });
}
