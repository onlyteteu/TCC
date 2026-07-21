import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(
  path.join(__dirname, "startup-journey-screen.module.css"),
  "utf8"
);

describe("journey visual contract", () => {
  it("reserves amber for current action and teal for completion", () => {
    expect(css).toContain("#f2a51a");
    expect(css).toContain("#35c68a");
    expect(css).toMatch(/\.chapter\[data-status=["']current["']\]/);
    expect(css).toMatch(/\.chapter\[data-status=["']done["']\]/);
  });

  it("turns the chapter route vertical without horizontal overflow", () => {
    expect(css).toContain("@media (max-width: 820px)");
    expect(css).toMatch(
      /@media \(max-width: 820px\)[\s\S]*\.chapterTrack[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/
    );
    expect(css).toMatch(/\.page[\s\S]*overflow-x:\s*hidden/);
  });

  it("honors reduced motion and visible keyboard focus", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(":focus-visible");
  });
});
