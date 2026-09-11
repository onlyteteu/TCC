import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { clearAuthCookie } from "@/lib/server-auth";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type { StartupCreatePayload, StartupListPayload } from "@/lib/startup-types";

function unauthorizedResponse() {
  return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const backendResponse = await fetchBackend("/startups/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);
      const response = NextResponse.json(
        errorPayload ?? { message: "Não foi possível carregar as startups agora." },
        { status: backendResponse.status }
      );

      if (backendResponse.status === 401) {
        clearAuthCookie(response);
      }

      return response;
    }

    const payload = await readJsonResponse<StartupListPayload>(backendResponse);

    if (!payload) {
      return NextResponse.json({ message: "Resposta invalida do backend." }, { status: 502 });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente em instantes." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const backendResponse = await fetchBackend("/startups/create/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);
      const response = NextResponse.json(
        errorPayload ?? { message: "Não foi possível criar a startup agora." },
        { status: backendResponse.status }
      );

      if (backendResponse.status === 401) {
        clearAuthCookie(response);
      }

      return response;
    }

    const payload = await readJsonResponse<StartupCreatePayload>(backendResponse);

    if (!payload) {
      return NextResponse.json({ message: "Resposta invalida do backend." }, { status: 502 });
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente em instantes." },
      { status: 503 }
    );
  }
}
