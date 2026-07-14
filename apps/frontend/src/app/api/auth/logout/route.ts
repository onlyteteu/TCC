import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/server-auth";

export async function POST() {
  const response = NextResponse.json({ message: "Sessao encerrada." });
  clearAuthCookie(response);
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookie(response);
  return response;
}
