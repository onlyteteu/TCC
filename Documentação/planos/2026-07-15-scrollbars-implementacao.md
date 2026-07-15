# Scrollbars da paleta da Startup Quest - Plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Aplicar a todas as barras de rolagem visíveis do frontend um acabamento escuro e discreto, com polegar cinza-azulado e estados interativos em âmbar.

**Arquitetura:** A personalização ficará em `globals.css`, usando tokens semânticos e as APIs nativas de Firefox e navegadores WebKit/Blink. Um teste de contrato lerá o CSS global para impedir que os tokens, seletores e estados essenciais sejam removidos sem percepção.

**Stack:** Next.js 16, React 19, CSS global, Vitest 4.

## Restrições globais

- Aplicar o estilo a todas as barras de rolagem visíveis do frontend.
- Manter contêineres propositalmente fixos ou sem scrollbar como estão.
- Usar aproximadamente `10px` nos navegadores WebKit/Blink e `thin` no Firefox.
- Usar cinza-azulado em repouso e âmbar somente em `hover` e `active`.
- Não adicionar JavaScript, biblioteca externa ou animação.
- Preservar teclado, roda do mouse, touchpad e arraste nativos.
- Manter compatibilidade com Chrome, Edge e Firefox.

---

## Estrutura de arquivos

- Criar `apps/frontend/src/app/scrollbar-theme.test.ts`: contrato dos tokens e estados globais.
- Modificar `apps/frontend/src/app/globals.css`: tokens e personalização global das scrollbars.
- Modificar `Documentação/progresso.md`: registro da entrega e das validações executadas.

### Tarefa 1: Tema global das barras de rolagem

**Arquivos:**

- Criar: `apps/frontend/src/app/scrollbar-theme.test.ts`
- Modificar: `apps/frontend/src/app/globals.css`

**Interfaces:**

- Consome: a folha global carregada pelo App Router.
- Produz: tokens `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-thumb-active` e `--scrollbar-size` disponíveis em todo o frontend.

- [ ] **Passo 1: escrever o teste que falha**

```ts
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
    expect(css).toContain("*::-webkit-scrollbar-thumb:hover");
    expect(css).toContain("*::-webkit-scrollbar-thumb:active");
    expect(css).toContain("*::-webkit-scrollbar-button");
  });
});
```

- [ ] **Passo 2: executar o teste e confirmar a falha**

Executar:

```powershell
npm test -- --run src/app/scrollbar-theme.test.ts
```

Resultado esperado: `2 failed`, porque os tokens e seletores ainda não existem.

- [ ] **Passo 3: implementar o CSS mínimo**

Adicionar ao `:root` de `globals.css`:

```css
--scrollbar-track: #080d15;
--scrollbar-thumb: #53677f;
--scrollbar-thumb-hover: #d99524;
--scrollbar-thumb-active: #f0ab32;
--scrollbar-size: 10px;
```

Adicionar após a regra global de `box-sizing`:

```css
* {
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
}

*::-webkit-scrollbar {
  width: var(--scrollbar-size);
  height: var(--scrollbar-size);
}

*::-webkit-scrollbar-track,
*::-webkit-scrollbar-corner {
  background: var(--scrollbar-track);
}

*::-webkit-scrollbar-thumb {
  min-height: 40px;
  border: 2px solid var(--scrollbar-track);
  border-radius: 999px;
  background: var(--scrollbar-thumb);
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

*::-webkit-scrollbar-thumb:active {
  background: var(--scrollbar-thumb-active);
}

*::-webkit-scrollbar-button {
  display: none;
}
```

- [ ] **Passo 4: executar o teste específico**

Executar:

```powershell
npm test -- --run src/app/scrollbar-theme.test.ts
```

Resultado esperado: `2 passed`.

- [ ] **Passo 5: executar lint e a suíte completa**

Executar:

```powershell
npm run lint
npm test -- --maxWorkers=1
```

Resultado esperado: ambos terminam com código `0` e nenhum teste falha.

- [ ] **Passo 6: registrar a implementação**

```powershell
git add apps/frontend/src/app/globals.css apps/frontend/src/app/scrollbar-theme.test.ts
git commit -m "style: integra scrollbars a paleta do workspace"
```

### Tarefa 2: Validação visual e documentação

**Arquivos:**

- Modificar: `Documentação/progresso.md`

**Interfaces:**

- Consome: o tema global entregue pela Tarefa 1.
- Produz: evidência visual e registro permanente da alteração.

- [ ] **Passo 1: validar no workspace em execução**

Abrir `http://127.0.0.1:3000/painel/startup/8` e confirmar:

1. a rolagem principal não possui trilho branco;
2. o polegar em repouso é cinza-azulado;
3. `hover` muda o polegar para âmbar;
4. o arraste mantém a rolagem funcional;
5. uma lista ou painel interno com `overflow-y: auto` usa o mesmo estilo;
6. não há corte nem deslocamento novo no conteúdo.

- [ ] **Passo 2: registrar a entrega**

Adicionar a `Documentação/progresso.md` uma entrada datada de `2026-07-15` informando o alcance global, os estados de cor, os navegadores cobertos e os comandos de validação aprovados.

- [ ] **Passo 3: verificar o diff**

Executar:

```powershell
git diff --check
git status --short
```

Resultado esperado: nenhuma falha de formatação; apenas a documentação desta tarefa aparece como alteração ainda não commitada.

- [ ] **Passo 4: registrar a documentação**

```powershell
git add Documentação/progresso.md
git commit -m "docs: registra tema global das scrollbars"
```

