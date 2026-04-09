import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/auth-screen";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function HomePage() {
  const cookieStore = await cookies();

  if (cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/painel");
  }

  return <AuthScreen />;
}
