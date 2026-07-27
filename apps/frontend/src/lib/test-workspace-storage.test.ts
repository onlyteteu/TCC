import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearTestWorkspaceDrafts } from "./test-workspace-storage";

describe("clearTestWorkspaceDrafts", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes only interview and problem drafts owned by the reset startup", () => {
    const removedKeys = [
      "startup-quest:interview-draft:7:customer_interviews_5:1",
      "startup-quest:interview-draft:7:customer_interviews_5:2",
      "startup-quest:problem-refinement:7",
    ];
    const preservedEntries = {
      "startup-quest:interview-draft:8:customer_interviews_5:1": "startup 8",
      "startup-quest:problem-refinement:8": "startup 8",
      "startup-quest:unrelated:7": "unrelated",
    };

    removedKeys.forEach((key) => window.localStorage.setItem(key, "startup 7"));
    Object.entries(preservedEntries).forEach(([key, value]) =>
      window.localStorage.setItem(key, value)
    );

    clearTestWorkspaceDrafts(7);

    removedKeys.forEach((key) =>
      expect(window.localStorage.getItem(key)).toBeNull()
    );
    Object.entries(preservedEntries).forEach(([key, value]) =>
      expect(window.localStorage.getItem(key)).toBe(value)
    );
  });

  it("does not fail the server reset when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "length", "get").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });

    expect(() => clearTestWorkspaceDrafts(7)).not.toThrow();
  });
});
