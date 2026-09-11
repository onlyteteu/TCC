import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { clearAuthCookie } from "@/lib/server-auth";
import type { AuthErrorPayload } from "@/lib/auth-types";
import type {
  StartupDeletePayload,
  StartupDetailPayload,
  StartupUpdatePayload,
} from "@/lib/startup-types";

function unauthorizedResponse() {
  return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
}

export async function GET(
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);
      const response = NextResponse.json(
        errorPayload ?? { message: "Não foi possível carregar a startup agora." },
        { status: backendResponse.status }
      );

      if (backendResponse.status === 401) {
        clearAuthCookie(response);
      }

      return response;
    }

    const payload = await readJsonResponse<StartupDetailPayload>(backendResponse);

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  const { startupId } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const backendResponse = await fetchBackend(`/startups/${startupId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorPayload = await readJsonResponse<AuthErrorPayload>(backendResponse);
      const response = NextResponse.json(
        errorPayload ?? { message: "Não foi possível atualizar a startup agora." },
        { status: backendResponse.status }
      );

      if (backendResponse.status === 401) {
        clearAuthCookie(response);
      }

      return response;
    }

    const payload = await readJsonResponse<StartupUpdatePayload>(backendResponse);

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
        errorPayload ?? { message: "Não foi possível excluir a startup agora." },
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
      { message: "Não foi possível conectar ao servidor. Tente novamente em instantes." },
      { status: 503 }
    );
  }
}
