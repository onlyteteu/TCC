import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelResolutionError } from "@/components/panel-resolution-error";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { fetchBackend, readJsonResponse } from "@/lib/backend-api";
import { resolvePanelDestination } from "@/lib/startup-navigation";
import type { StartupListPayload } from "@/lib/startup-types";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/");
  }

  let response: Response;

  try {
    response = await fetchBackend("/startups/", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return <PanelResolutionError />;
  }

  if (response.status === 401) {
    redirect("/");
  }

  if (!response.ok) {
    return <PanelResolutionError />;
  }

  let payload: StartupListPayload | null;

  try {
    payload = await readJsonResponse<StartupListPayload>(response);
  } catch {
    return <PanelResolutionError />;
  }

  if (!payload) {
    return <PanelResolutionError />;
  }

  redirect(resolvePanelDestination(payload.startups));
}

