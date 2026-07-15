import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("contrato do inicializador local", () => {
  const script = readFileSync(resolve(process.cwd(), "../../start.ps1"), "utf8");

  it("descarta o cache do Next antes de iniciar o servidor de desenvolvimento", () => {
    const cacheCleanup = script.indexOf("Remove-Item -LiteralPath $FrontendCache");
    const frontendStart = script.indexOf("npm run dev");

    expect(cacheCleanup).toBeGreaterThan(-1);
    expect(frontendStart).toBeGreaterThan(-1);
    expect(cacheCleanup).toBeLessThan(frontendStart);
  });

  it("nao aceita silenciosamente um processo desconhecido na porta 3000", () => {
    expect(script).toContain("Get-NetTCPConnection -State Listen -LocalPort 3000");
    expect(script).toContain("A porta 3000 esta sendo usada por outro programa");
  });
});
