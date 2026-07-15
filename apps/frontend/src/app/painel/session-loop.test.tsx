import { describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ hasCookie: true }));
const redirect = vi.hoisted(() =>
  vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  })
);
const fetchBackend = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (authState.hasCookie ? { value: "invalid-token" } : undefined),
    has: () => authState.hasCookie,
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/backend-api", () => ({
  fetchBackend,
  readJsonResponse: vi.fn(),
}));
vi.mock("@/components/auth-screen", () => ({ AuthScreen: () => <div>Login</div> }));

import HomePage from "@/app/page";
import { GET as logoutGet } from "@/app/api/auth/logout/route";

import DashboardPage from "./page";

describe("invalid /painel session flow", () => {
  it("clears a rejected cookie and reaches login without redirecting back to /painel", async () => {
    authState.hasCookie = true;
    redirect.mockClear();
    fetchBackend.mockReset().mockResolvedValue(new Response(null, { status: 401 }));

    await expect(DashboardPage()).rejects.toThrow(
      "REDIRECT:/api/auth/logout?returnTo=/"
    );
    expect(fetchBackend).toHaveBeenCalledWith("/startups/", {
      cache: "no-store",
      headers: { Authorization: "Bearer invalid-token" },
    });

    const logoutResponse = await logoutGet(
      new Request("http://localhost/api/auth/logout?returnTo=/")
    );
    expect(logoutResponse.headers.get("set-cookie")).toContain("startup_quest_session=");
    expect(logoutResponse.headers.get("set-cookie")).toContain("Expires=Thu, 01 Jan 1970");

    authState.hasCookie = false;
    redirect.mockClear();
    const login = await HomePage();

    expect(login.type).toBeTypeOf("function");
    expect(redirect).not.toHaveBeenCalled();
  });
});
