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

  it("fixa o frontend em 3001 e recusa um processo desconhecido nessa porta", () => {
    expect(script).toContain("$FrontendPort = 3001");
    expect(script).toContain(
      "Get-NetTCPConnection -State Listen -LocalPort $FrontendPort",
    );
    expect(script).toContain(
      "A porta $FrontendPort esta sendo usada por outro programa",
    );
  });

  it("inicia o Next com o prefixo correto da API", () => {
    expect(script).toContain(
      '$BackendApiBaseUrl = "http://127.0.0.1:$BackendPort/api"',
    );
    expect(script).toContain(
      "`$env:BACKEND_API_BASE_URL = '$BackendApiBaseUrl'",
    );
  });
});
