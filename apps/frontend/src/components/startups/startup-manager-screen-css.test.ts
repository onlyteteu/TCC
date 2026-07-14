import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/components/startups/startup-manager-screen.module.css"),
  "utf8"
);

describe("startup manager responsive CSS contract", () => {
  it("keeps phase, progress and last activity visible at every breakpoint", () => {
    for (const selector of ["activity", "phase", "progressBlock"]) {
      expect(css).not.toMatch(
        new RegExp(`\\.${selector}\\s*\\{[^}]*display:\\s*none`, "s")
      );
    }
  });

  it("uses constrained responsive grids without horizontal overflow", () => {
    const compact = css.slice(
      css.indexOf("@media (max-width: 1180px)"),
      css.indexOf("@media (max-width: 880px)")
    );
    const narrow = css.slice(
      css.indexOf("@media (max-width: 880px)"),
      css.indexOf("@media (max-width: 640px)")
    );

    expect(compact).toMatch(/grid-template-areas:/);
    expect(compact).toMatch(/minmax\(0,/);
    expect(narrow).toMatch(/grid-template-areas:/);
    expect(narrow).toMatch(/minmax\(0,/);
    expect(css).not.toMatch(/overflow-x:\s*(?:auto|scroll)/);
  });
});
