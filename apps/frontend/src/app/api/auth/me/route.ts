import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { clearAuthCookie } from "@/lib/server-auth";
import type { AuthenticatedUserPayload } from "@/lib/auth-types";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao nao encontrada." }, { status: 401 });
  }

  try {
    const backendResponse = await fetchBackend("/auth/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const response = NextResponse.json({ message: "Sessao invalida ou expirada." }, { status: 401 });
      clearAuthCookie(response);
      return response;
    }

    const payload = await readJsonResponse<AuthenticatedUserPayload>(backendResponse);

    if (!payload) {
      return NextResponse.json({ message: "Resposta invalida do backend." }, { status: 502 });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel validar a sessao agora." },
      { status: 503 }
    );
  }
}

