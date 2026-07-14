import { describe, expect, it } from "vitest";

import * as logoutRoute from "./route";

describe("GET /api/auth/logout", () => {
  it("clears the invalid cookie before redirecting the browser to login", async () => {
    expect(logoutRoute).toHaveProperty("GET");

    const response = await logoutRoute.GET!(
      new Request("http://localhost/api/auth/logout?returnTo=/")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
    expect(response.headers.get("set-cookie")).toContain("startup_quest_session=");
    expect(response.headers.get("set-cookie")).toContain("Expires=Thu, 01 Jan 1970");
  });
});
