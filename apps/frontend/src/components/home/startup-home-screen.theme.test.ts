import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/components/home/startup-home-screen.module.css"),
  "utf8"
);

function rule(selector: string) {
  const match = Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g)).find((candidate) =>
    candidate[1]
      .split(",")
      .map((item) => item.trim())
      .includes(selector)
  );

  expect(match, `regra CSS ausente: ${selector}`).not.toBeNull();
  return match?.[2] ?? "";
}

function hexColor(selector: string, property: string) {
  const match = rule(selector).match(new RegExp(`${property}:\\s*(#[0-9a-f]{6})`, "i"));

  expect(match, `${property} hexadecimal ausente em ${selector}`).not.toBeNull();
  return match?.[1] ?? "#000000";
}

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe("contrato visual da Home", () => {
  it("usa as superfícies escuras e o texto principal do workspace", () => {
    expect(rule(".pageHeader h1")).toMatch(/color:\s*#f7efe3;/i);
    expect(rule(".missionPanel")).toMatch(/border:\s*1px solid #203145;/i);
    expect(rule(".missionPanel")).toMatch(/background:\s*#0b111c;/i);
    expect(rule(".missionPanel")).not.toMatch(/box-shadow:/i);
    expect(rule(".statusPanel")).toMatch(/background:\s*#0b111c;/i);
    expect(css).not.toMatch(/(?:background|color):\s*#fff\s*;/i);
  });

  it("reserva âmbar para ação, XP, progresso e etapa atual", () => {
    expect(rule(".primaryButton")).toMatch(/background:\s*#f2a51a;/i);
    expect(rule(".primaryButton")).toMatch(/color:\s*#070b13;/i);
    expect(rule(".reward")).toMatch(/color:\s*#f2a51a;/i);
    expect(rule(".progressTrack > span")).toMatch(/background:\s*#f2a51a;/i);
    expect(rule(".step_current .stepAction")).toMatch(/border-color:\s*rgb\(242 165 26 \/ 45%\);/i);
  });

  it("mantém teal em sucesso e contraste AA nos textos de leitura", () => {
    expect(rule(".successMessage")).toMatch(/color:\s*#bfe8ce;/i);
    expect(rule(".successMessage")).toMatch(/background:\s*#10241b;/i);

    const pairs = [
      [hexColor(".pageHeader h1", "color"), "#070b13"],
      [hexColor(".pageHeader p", "color"), "#070b13"],
      [hexColor(".missionObjective", "color"), "#0b111c"],
      [hexColor(".workForm input::placeholder", "color"), "#070b13"],
    ] as const;

    for (const [foreground, background] of pairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
