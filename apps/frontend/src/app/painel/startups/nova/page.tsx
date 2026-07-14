import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CreateStartupRouteScreen } from "@/components/startups/create-startup-route-screen";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function CreateStartupPage() {
  const cookieStore = await cookies();

  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/");
  }

  return <CreateStartupRouteScreen />;
}
