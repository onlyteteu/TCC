import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/components/workspace/workspace-shell.module.css"),
  "utf8"
);

function ruleBody(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

describe("workspace shell CSS contract", () => {
  it("keeps only content scrollable across compact and reduced-motion modes", () => {
    const shellWidths = [...css.matchAll(/\.shell\s*\{[^}]*grid-template-columns:\s*(\d+)px/g)].map(
      ([, width]) => Number(width)
    );
    const reducedMotion = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect.soft(shellWidths).toEqual([272, 240]);
    expect.soft(ruleBody(".navigation")).not.toMatch(/overflow(?:-y)?\s*:/);
    expect.soft(reducedMotion).toMatch(/\.skipLink\s*\{[^}]*transition:\s*none/);
  });
});
