# Assinatura em duas linhas — Plano de Implementação

> **Para agentes de implementação:** SUB-SKILL OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Implementar a assinatura `Startup / Quest` em duas linhas, com símbolo estruturalmente dimensionado e aparência idêntica nas cinco etapas de criação da startup.

**Arquitetura:** O componente compartilhado `QuestMark` ganhará um modo `compact` dimensionado por uma variável CSS herdada. A tela de criação usará um único lockup horizontal independente da etapa; o formulário continuará centralizado pela grade da página. Breakpoints poderão alterar apenas o modo desktop ou compacto, nunca a assinatura por etapa.

**Stack:** Next.js 16, React 19, TypeScript, CSS Modules e validação visual no navegador local.

## Restrições globais

- símbolo com caixa real de `52 x 52px` no desktop e `48 x 48px` até `760px` de largura;
- nome em duas linhas: `Startup` dourado e `Quest` creme;
- `font-size: 0.78rem`, `line-height: 1` e `letter-spacing: 0.18em`;
- distância de `10px` entre símbolo e nome;
- assinatura idêntica nas etapas 1 a 5;
- posição desktop em `top: 32px; left: 40px`;
- posição para alturas até `820px` em `top: 16px; left: 24px`;
- não deslocar o formulário central;
- não alterar os modos `login` e `register` do `QuestMark`;
- não adicionar dependências ao frontend.

---

## Estrutura dos arquivos

- `apps/frontend/src/components/quest-mark.tsx`: expõe o novo modo estrutural `compact`.
- `apps/frontend/src/components/quest-mark.module.css`: define dimensão real do símbolo compacto por `--quest-mark-size`.
- `apps/frontend/src/components/startup-creation-screen.tsx`: renderiza um único lockup em duas linhas, independente da etapa.
- `apps/frontend/src/components/startup-creation-screen.module.css`: posiciona e padroniza a assinatura, removendo regras redundantes.
- `Documentação/progresso.md`: registra a implementação e as resoluções validadas.

### Tarefa 1: Criar o modo compacto estrutural do símbolo

**Arquivos:**

- Modificar: `apps/frontend/src/components/quest-mark.tsx`
- Modificar: `apps/frontend/src/components/quest-mark.module.css`

**Interfaces:**

- Consome: propriedade existente `mode?: "login" | "register"`.
- Produz: `mode?: "login" | "register" | "compact"` e variável herdável `--quest-mark-size`.

- [ ] **Etapa 1: registrar a falha estrutural no navegador**

Na etapa 1 da criação, executar a medição abaixo no navegador:

```js
(() => {
  const region = document.querySelector('[class*="logoRegion"]');
  const shell = region?.firstElementChild;
  const regionRect = region?.getBoundingClientRect();
  const shellRect = shell?.getBoundingClientRect();

  if (!regionRect || !shellRect) throw new Error("Assinatura não encontrada");
  if (shellRect.width !== regionRect.width || shellRect.height !== regionRect.height) {
    throw new Error(`Caixas divergentes: região ${regionRect.width}x${regionRect.height}, símbolo ${shellRect.width}x${shellRect.height}`);
  }
})();
```

Resultado esperado antes da correção: `FAIL`, pois o símbolo mantém caixa intrínseca de `132px` e depende de `transform: scale(0.48)`.

- [ ] **Etapa 2: ampliar o tipo do componente**

Em `quest-mark.tsx`, substituir o tipo de `mode` e a seleção da classe por:

```tsx
type QuestMarkProps = {
  animated?: boolean;
  mode?: "compact" | "login" | "register";
};

const modeClass =
  mode === "register" ? styles.register : mode === "compact" ? styles.compact : styles.login;
```

Usar `modeClass` na lista de classes do elemento `.shell`.

- [ ] **Etapa 3: definir o tamanho real do modo compacto**

Adicionar em `quest-mark.module.css`:

```css
.compact {
  width: var(--quest-mark-size, 52px);
  height: var(--quest-mark-size, 52px);
  margin: 0;
  transform: none;
}

.compact::before {
  inset: 6px;
  opacity: 0.78;
}
```

- [ ] **Etapa 4: verificar tipagem e lint**

Executar em `apps/frontend`:

```powershell
npx tsc --noEmit
npm run lint
```

Resultado esperado: ambos terminam com código `0`.

- [ ] **Etapa 5: registrar a unidade implementada**

```powershell
git add apps/frontend/src/components/quest-mark.tsx apps/frontend/src/components/quest-mark.module.css
git commit -m "fix: adiciona modo compacto real ao simbolo"
```

### Tarefa 2: Montar e padronizar a assinatura em duas linhas

**Arquivos:**

- Modificar: `apps/frontend/src/components/startup-creation-screen.tsx`
- Modificar: `apps/frontend/src/components/startup-creation-screen.module.css`

**Interfaces:**

- Consome: `<QuestMark animated mode="compact" />` e `--quest-mark-size` da Tarefa 1.
- Produz: `.identityCorner`, `.logoRegion` e `.brandTitle` estáveis em todas as etapas.

- [ ] **Etapa 1: atualizar o JSX do lockup**

Substituir a assinatura atual por:

```tsx
<div className={styles.identityCorner}>
  <div className={styles.logoRegion}>
    <QuestMark animated mode="compact" />
  </div>
  <div aria-label="Startup Quest" className={styles.brandTitle}>
    <span>Startup</span>
    <span>Quest</span>
  </div>
</div>
```

Remover o uso de `logoRegionNameStep` no JSX.

- [ ] **Etapa 2: consolidar a geometria da assinatura**

Substituir as regras principais por:

```css
.identityCorner {
  --quest-mark-size: 52px;
  position: absolute;
  top: 32px;
  left: 40px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  animation: journeyLayerIn 520ms cubic-bezier(0.22, 1, 0.36, 1) 90ms forwards;
}

.brandTitle {
  display: grid;
  gap: 3px;
  margin: 0;
  padding: 0;
  color: #d7a14a;
  font-family: var(--font-heading), "Segoe UI", sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  white-space: nowrap;
}

.brandTitle span:last-child {
  color: #f4e5ca;
}

.logoRegion {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: var(--quest-mark-size);
  height: var(--quest-mark-size);
  margin: 0;
}
```

Remover de `.logoRegion` as declarações `opacity`, `transform-origin` e `animation`. Remover também
a regra `.logoRegion > *` que aplica `transform: scale(0.48)` e remover integralmente os seletores
`.logoRegionNameStep` e `.logoRegionNameStep > *`.

- [ ] **Etapa 3: consolidar os breakpoints**

No breakpoint de altura até `820px`, usar:

```css
.identityCorner {
  top: 16px;
  left: 24px;
}
```

No breakpoint de largura até `760px`, usar:

```css
.identityCorner {
  --quest-mark-size: 48px;
  top: 18px;
  left: 18px;
}
```

Remover integralmente o seletor `.contentNameStep .brandTitle` do breakpoint de altura, os seletores
`.logoRegionNameStep` e `.logoRegionNameStep > *` e o breakpoint
`@media (max-width: 1100px) and (min-width: 761px)` que oculta `.brandTitle`.

- [ ] **Etapa 4: corrigir a redução de movimento**

Na lista de `@media (prefers-reduced-motion: reduce)`, substituir `.brandTitle` e `.logoRegion` por `.identityCorner`, mantendo `opacity: 1`, `animation: none`, `transform: none` e `filter: none`.

- [ ] **Etapa 5: executar a verificação estrutural após a correção**

Reexecutar a medição da Tarefa 1. Resultado esperado: nenhuma exceção e caixas de `52 x 52px` no desktop.

- [ ] **Etapa 6: verificar o frontend**

```powershell
npx tsc --noEmit
npm run lint
```

Resultado esperado: código `0` em ambos.

- [ ] **Etapa 7: registrar a assinatura implementada**

```powershell
git add apps/frontend/src/components/startup-creation-screen.tsx apps/frontend/src/components/startup-creation-screen.module.css
git commit -m "fix: padroniza assinatura da marca no onboarding"
```

### Tarefa 3: Validar as cinco etapas e documentar

**Arquivos:**

- Modificar: `Documentação/progresso.md`

**Interfaces:**

- Consome: assinatura final das Tarefas 1 e 2.
- Produz: evidência visual e registro técnico da correção.

- [ ] **Etapa 1: medir a assinatura em cada etapa**

Em cada etapa de 1 a 5, coletar:

```js
(() => {
  const lockup = document.querySelector('[class*="identityCorner"]')?.getBoundingClientRect();
  const mark = document.querySelector('[class*="logoRegion"]')?.getBoundingClientRect();
  const card = document.querySelector('section[aria-label="Criacao da startup"]')?.getBoundingClientRect();
  if (!lockup || !mark || !card) throw new Error("Elementos esperados não encontrados");
  return {
    lockup: { x: lockup.x, y: lockup.y, width: lockup.width, height: lockup.height },
    mark: { width: mark.width, height: mark.height },
    cardCenterY: (card.top + card.bottom) / 2,
    viewportCenterY: innerHeight / 2,
    cardOverflow: card.top < 0 || card.bottom > innerHeight,
  };
})();
```

Resultado esperado: `lockup.x`, `lockup.y`, `lockup.width`, `lockup.height` e `mark` idênticos nas cinco etapas para a mesma viewport; diferença entre os centros do cartão e da viewport inferior a `1px`; `cardOverflow: false`.

- [ ] **Etapa 2: repetir a validação responsiva**

Testar `1536 x 720`, `1366 x 768`, `1280 x 720` e `1920 x 900`. Confirmar que o nome permanece visível e não sobrepõe o cartão.

- [ ] **Etapa 3: verificar regressão na autenticação**

Abrir login e cadastro e confirmar que os modos existentes do `QuestMark` preservam dimensões e transições anteriores.

- [ ] **Etapa 4: executar a verificação final de produção**

Em `apps/frontend`:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Resultado esperado: todos os comandos terminam com código `0`.

- [ ] **Etapa 5: registrar o resultado em progresso**

Adicionar em `Documentação/progresso.md` uma seção com a decisão visual, causa do desalinhamento, tamanhos finais, resoluções testadas e comandos executados.

- [ ] **Etapa 6: registrar a documentação final**

```powershell
git add "Documentação/progresso.md"
git commit -m "docs: registra padronizacao da assinatura"
```

## Autorrevisão do plano

- cobertura da especificação: símbolo estrutural, nome em duas linhas, posicionamento, breakpoints, redução de movimento, cinco etapas, autenticação e build estão cobertos;
- dependências: nenhuma nova dependência será adicionada;
- consistência de tipos: `mode="compact"` é definido na Tarefa 1 e consumido na Tarefa 2;
- escopo: nenhuma alteração no formulário, símbolo, tipografia global ou demais páginas foi incluída.
