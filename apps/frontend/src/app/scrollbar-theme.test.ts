import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("tema global das barras de rolagem", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

  it("define os tokens semanticos da scrollbar", () => {
    for (const token of [
      "--scrollbar-track",
      "--scrollbar-thumb",
      "--scrollbar-thumb-hover",
      "--scrollbar-thumb-active",
      "--scrollbar-size",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("cobre Firefox e navegadores WebKit com estados interativos", () => {
    expect(css).toContain("scrollbar-color:");
    expect(css).toContain("@supports not selector(::-webkit-scrollbar)");
    expect(css).toContain("*::-webkit-scrollbar-thumb:hover");
    expect(css).toContain("*::-webkit-scrollbar-thumb:active");
    expect(css).toContain("*::-webkit-scrollbar-button");
  });
});
