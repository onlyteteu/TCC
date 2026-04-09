import { NextResponse } from "next/server";

import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { attachAuthCookie } from "@/lib/server-auth";
import type { AuthBackendPayload, AuthErrorPayload, AuthSuccessPayload } from "@/lib/auth-types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetchBackend("/auth/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);

      return NextResponse.json(
        errorPayload ?? { message: "Nao foi possivel criar a conta agora." },
        {
          status: backendResponse.status,
        }
      );
    }

    const payload = await readJsonResponse<AuthBackendPayload>(backendResponse);

    if (!payload) {
      return NextResponse.json({ message: "Resposta invalida do backend." }, { status: 502 });
    }

    const response = NextResponse.json<AuthSuccessPayload>({
      message: payload.message,
      user: payload.user,
    });

    attachAuthCookie(response, payload.token);
    return response;
  } catch {
    return NextResponse.json(
      { message: "O backend nao respondeu. Verifique se o Django esta em execucao." },
      { status: 503 }
    );
  }
}

