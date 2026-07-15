import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { clearAuthCookie } from "@/lib/server-auth";

type ProxyOptions = {
  body?: string;
  fallbackMessage: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export async function proxyAuthenticatedBackend(path: string, options: ProxyOptions) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
  }

  try {
    const backendResponse = await fetchBackend(path, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      ...(options.body ? { body: options.body } : {}),
    });
    const payload = await readJsonResponse<unknown>(backendResponse);
    const response = NextResponse.json(
      payload ?? { message: options.fallbackMessage },
      { status: backendResponse.status }
    );

    if (backendResponse.status === 401) {
      clearAuthCookie(response);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "O backend não respondeu. Verifique se o Django está em execução." },
      { status: 503 }
    );
  }
}
