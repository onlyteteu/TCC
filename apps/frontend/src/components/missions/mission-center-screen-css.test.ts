import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "src/components/missions/mission-center-screen.module.css"),
  "utf8"
);

describe("mission center CSS contract", () => {
  it("keeps the approved desktop composition and priority treatment", () => {
    expect(source).toMatch(/\.page\s*\{[\s\S]*max-width:\s*1540px/i);
    expect(source).toMatch(/\.focus\s*\{[\s\S]*border:\s*1px solid rgba\(242, 165, 26/i);
    expect(source).not.toMatch(/\.focus\s*\{[^}]*box-shadow:/i);
    expect(source).toMatch(/@media \(max-width:\s*1120px\)/i);
  });

  it("uses state color deliberately and avoids decorative effects", () => {
    expect(source).toContain("#070b13");
    expect(source).toContain("#0b111c");
    expect(source).toContain("#203145");
    expect(source).toContain("#f7efe3");
    expect(source).toContain("#9aa8b8");
    expect(source).toContain("#f2a51a");
    expect(source).toContain("#bfe8ce");
    expect(source).toContain("#10241b");
    expect(source).not.toMatch(/(?:linear|radial|conic)-gradient/i);
    expect(source).not.toMatch(/background-clip:\s*text/i);
    expect(source).not.toMatch(/border-radius:\s*(?:1[7-9]|[2-9]\d)px/i);
  });

  it("preserves keyboard focus and respects reduced motion", () => {
    expect(source).toMatch(/:focus-visible\s*\{[\s\S]*outline:/i);
    expect(source).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)/i);
  });
});
