import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/server-auth";

export async function POST() {
  const response = NextResponse.json({ message: "Sessao encerrada." });
  clearAuthCookie(response);
  return response;
}
