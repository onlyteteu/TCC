import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { clearAuthCookie } from "@/lib/server-auth";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { StartupDeletePayload } from "@/lib/startup-types";

function unauthorizedResponse() {
  return NextResponse.json({ message: "Sessao nao encontrada." }, { status: 401 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  const { startupId } = await params;

  try {
    const backendResponse = await fetchBackend(`/startups/${startupId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);
      const response = NextResponse.json(
        errorPayload ?? { message: "Nao foi possivel excluir a startup agora." },
        { status: backendResponse.status }
      );

      if (backendResponse.status === 401) {
        clearAuthCookie(response);
      }

      return response;
    }

    const payload = await readJsonResponse<StartupDeletePayload>(backendResponse);

    if (!payload) {
      return NextResponse.json({ message: "Resposta invalida do backend." }, { status: 502 });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "O backend nao respondeu. Verifique se o Django esta em execucao." },
      { status: 503 }
    );
  }
}
