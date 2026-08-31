# Painel 2.0 do workspace — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** transformar o workspace autenticado em uma bancada de trabalho coesa, com a missão como foco, progresso local sem duplicação e navegação limitada ao que já funciona.

**Architecture:** os tokens semânticos serão definidos no limite do `WorkspaceShell` e herdados por Home, Jornada e Missões, sem alterar o visual público. A Home continuará consumindo `TodayPayload`, mas distribuirá apresentação entre componentes focados; contratos, mutações e cálculos do backend serão preservados.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest e Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-31-workspace-panel-v2-design.md`

## Global Constraints

- Não alterar modelos, migrations, endpoints ou respostas do backend.
- Preservar `GET /api/startups/<id>/today/` como fonte da Home e manter a reconciliação do workspace após mutações.
- Manter conclusão, XP, sessão, isolamento entre contas e ambiente de teste com os comportamentos atuais.
- Exibir na sidebar somente Home, Jornada e Missões.
- Manter a missão e a ação principal visíveis no primeiro viewport em `1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`.
- Usar tokens `--sq-*` no workspace sem converter parcialmente autenticação, criação de startup ou `/sobre`.
- Garantir contraste mínimo de `4.5:1` para texto comum, `3:1` para elementos funcionais, foco âmbar de `2px` e alvos principais com pelo menos `44px`.
- Não introduzir cartões aninhados, faixas laterais decorativas, texto em gradiente, glassmorphism decorativo ou movimento sem função.
- Preservar o conteúdo padrão já visível; o trabalho atual continua desktop-first com base funcional abaixo de `980px`.

---

## File Structure

- `apps/frontend/src/components/workspace/workspace-shell.module.css`: tokens, shell, topbar, sidebar, skeleton e regras responsivas compartilhadas.
- `apps/frontend/src/components/workspace/workspace-shell.tsx`: estrutura estável e estados de carregamento/erro do shell.
- `apps/frontend/src/components/workspace/workspace-sidebar.tsx`: três destinos funcionais.
- `apps/frontend/src/components/workspace/workspace-topbar.tsx`: startup ativa, progresso global compacto e conta.
- `apps/frontend/src/components/home/startup-progress-panel.tsx`: progresso local da startup e entrada para Jornada.
- `apps/frontend/src/components/home/next-unlock.tsx`: próximo desbloqueio, com estado textual.
- `apps/frontend/src/components/home/recent-activity.tsx`: histórico compacto e estado vazio instrutivo.
- `apps/frontend/src/components/home/mission-focus-panel.tsx`: missão recomendada, progresso, passos e única ação primária.
- `apps/frontend/src/components/home/startup-home-screen.tsx`: carregamento, mutações, diálogos e composição da Home.
- `apps/frontend/src/components/home/startup-home-screen.module.css`: layout da Home e estados dos componentes locais.
- `apps/frontend/src/components/journey/startup-journey-screen.module.css`: migração para tokens do workspace.
- `apps/frontend/src/components/missions/mission-center-screen.module.css`: migração para tokens do workspace.
- `apps/frontend/src/components/missions/mission-detail-screen.module.css`: migração para tokens do workspace.
- `apps/frontend/src/components/workspace/workspace-visual-contract.test.ts`: contrato dos tokens e prevenção de novas paletas paralelas.
- `DESIGN.md`: regras duráveis confirmadas pela implementação.
- `Documentação/telas.md`, `Documentação/funcionalidades.md`, `Documentação/progresso.md`, `Documentação/proximos-passos.md`: estado real do produto após o ciclo.

---

### Task 1: Fundação visual e estados estáveis do shell

**Files:**
- Modify: `apps/frontend/src/components/workspace/workspace-shell.module.css`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.test.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-visual-contract.test.ts`

**Interfaces:**
- Consumes: `WorkspaceShell({ children }: { children: ReactNode })` e estado de `useWorkspace()`.
- Produces: tokens herdáveis `--sq-bg`, `--sq-sidebar`, `--sq-surface`, `--sq-surface-raised`, `--sq-surface-interactive`, `--sq-border`, `--sq-border-strong`, `--sq-text`, `--sq-text-muted`, `--sq-text-subtle`, `--sq-accent`, `--sq-accent-hover`, `--sq-success`, `--sq-success-bg`, `--sq-danger`, espaçamentos, raios, durações e foco.

- [ ] **Step 1: escrever testes que expressem o contrato visual e o skeleton**

```tsx
it("declares the semantic workspace token contract", () => {
  const css = readFileSync(resolve(process.cwd(), "src/components/workspace/workspace-shell.module.css"), "utf8");
  for (const token of ["--sq-bg", "--sq-surface", "--sq-text", "--sq-accent", "--sq-focus-ring"]) {
    expect(css).toContain(token);
  }
});

it("keeps the shell structure visible while workspace data loads", () => {
  render(<WorkspaceShell><div>Conteúdo</div></WorkspaceShell>);
  expect(screen.getByLabelText("Carregando workspace")).toBeInTheDocument();
  expect(screen.getAllByTestId("workspace-skeleton-line").length).toBeGreaterThan(2);
});
```

- [ ] **Step 2: rodar os testes e confirmar a falha esperada**

Run: `npm.cmd --prefix apps/frontend test -- workspace-shell.test.tsx workspace-visual-contract.test.ts`

Expected: FAIL porque os tokens e o skeleton geométrico ainda não existem.

- [ ] **Step 3: declarar tokens no `.shell` e substituir o loading textual por skeleton**

```tsx
<div aria-label="Carregando workspace" aria-live="polite" className={styles.loadingState}>
  <span className={styles.skeletonHeading} data-testid="workspace-skeleton-line" />
  <div className={styles.skeletonGrid}>
    <span className={styles.skeletonMission} />
    <span className={styles.skeletonRail} />
  </div>
  <span className={styles.srOnly}>Preparando seu workspace.</span>
</div>
```

O CSS deve manter sidebar e topbar estáveis, usar `var(--sq-*)`, `minmax(0, 1fr)`, `overflow-y: auto` apenas em `.content` e animação de skeleton desativada em `prefers-reduced-motion`.

- [ ] **Step 4: rodar os testes do shell**

Run: `npm.cmd --prefix apps/frontend test -- workspace-shell.test.tsx workspace-visual-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: registrar a entrega**

```powershell
git add -- apps/frontend/src/components/workspace/workspace-shell.module.css apps/frontend/src/components/workspace/workspace-shell.tsx apps/frontend/src/components/workspace/workspace-shell.test.tsx apps/frontend/src/components/workspace/workspace-visual-contract.test.ts
git commit -m "feat: establish workspace visual foundation"
```

### Task 2: Navegação enxuta e contexto global compacto

**Files:**
- Modify: `apps/frontend/src/components/workspace/workspace-sidebar.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-sidebar.test.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-topbar.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-topbar.test.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.module.css`

**Interfaces:**
- Consumes: `startupHomeHref`, `startupJourneyHref`, `startupMissionsHref` e `useWorkspace()`.
- Produces: `WorkspaceSection = "home" | "journey" | "missions"`; topbar com seletor, sequência, nível e conta.

- [ ] **Step 1: mudar o teste da sidebar para rejeitar módulos indisponíveis**

```tsx
it("shows only destinations that already work", () => {
  render(<WorkspaceSidebar activeSection="home" startupId={7} />);
  expect(screen.getAllByRole("link")).toHaveLength(3);
  expect(screen.queryByText("Experimentos")).not.toBeInTheDocument();
  expect(screen.queryByText("Conquistas")).not.toBeInTheDocument();
});
```

Adicionar ao teste da topbar as expectativas `Sequência: 4 dias` e `Nível 3, 360 XP` como nomes acessíveis quando houver progresso, mantendo os testes de foco e logout.

- [ ] **Step 2: rodar os testes e confirmar a falha**

Run: `npm.cmd --prefix apps/frontend test -- workspace-sidebar.test.tsx workspace-topbar.test.tsx`

Expected: FAIL porque os módulos futuros ainda são renderizados e os indicadores não possuem os novos nomes.

- [ ] **Step 3: limitar `items` e consolidar os indicadores da topbar**

```tsx
const items = [
  { key: "home", label: "Home", icon: "home" },
  { key: "journey", label: "Jornada", icon: "journey" },
  { key: "missions", label: "Missões", icon: "mission" },
] as const;
```

O estado sem startup mantém os três itens como texto desabilitado. Os indicadores globais ficam em pílulas compactas com `aria-label`, sem repetir cartões na Home.

- [ ] **Step 4: aplicar tokens, estados e responsividade na navegação**

Usar `var(--sq-*)`, foco compartilhado, `44px` de altura nos itens e reduzir apenas o texto auxiliar em larguras menores. Não criar rolagem própria na sidebar.

- [ ] **Step 5: rodar testes e registrar a entrega**

Run: `npm.cmd --prefix apps/frontend test -- workspace-sidebar.test.tsx workspace-topbar.test.tsx workspace-shell.test.tsx`

```powershell
git add -- apps/frontend/src/components/workspace
git commit -m "feat: simplify workspace navigation"
```

### Task 3: Progresso local e continuidade em componentes focados

**Files:**
- Create: `apps/frontend/src/components/home/startup-progress-panel.tsx`
- Create: `apps/frontend/src/components/home/startup-progress-panel.test.tsx`
- Create: `apps/frontend/src/components/home/next-unlock.tsx`
- Create: `apps/frontend/src/components/home/next-unlock.test.tsx`
- Create: `apps/frontend/src/components/home/recent-activity.tsx`
- Create: `apps/frontend/src/components/home/recent-activity.test.tsx`

**Interfaces:**
- Consumes: `TodayPayload["journey"]`, `TodayPayload["nextUnlock"]`, `ActivitySummary[]` e `startupId: number`.
- Produces: `StartupProgressPanel({ journey, nextUnlock, startupId })`, `NextUnlock({ unlock })` e `RecentActivity({ activities })`.

- [ ] **Step 1: escrever testes para o progresso local e ausência de gamificação global**

```tsx
render(<StartupProgressPanel journey={journey} nextUnlock={unlock} startupId={7} />);
expect(screen.getByRole("heading", { name: "Progresso da startup" })).toBeInTheDocument();
expect(screen.getByText("Definir o problema")).toBeInTheDocument();
expect(screen.getByRole("progressbar", { name: "Progresso da jornada" })).toHaveAttribute("aria-valuenow", "40");
expect(screen.getByRole("link", { name: "Abrir Jornada" })).toHaveAttribute("href", "/painel/startup/7/jornada");
expect(screen.queryByText(/Nível/)).not.toBeInTheDocument();
expect(screen.queryByText(/dias/)).not.toBeInTheDocument();
```

Testar também `NextUnlock` nos estados `Disponível` e `Bloqueado`, e `RecentActivity` com lista e vazio `Sua primeira evidência aparecerá aqui depois de registrar uma entrevista ou concluir uma etapa.`.

- [ ] **Step 2: rodar os novos testes e confirmar a falha de importação**

Run: `npm.cmd --prefix apps/frontend test -- startup-progress-panel.test.tsx next-unlock.test.tsx recent-activity.test.tsx`

Expected: FAIL porque os três componentes ainda não existem.

- [ ] **Step 3: implementar os componentes sem cálculos paralelos**

```tsx
export function StartupProgressPanel({ journey, nextUnlock, startupId }: StartupProgressPanelProps) {
  return (
    <aside className={styles.startupProgressPanel} aria-labelledby="startup-progress-title">
      <h2 id="startup-progress-title">Progresso da startup</h2>
      <p className={styles.currentMilestone}>{journey.currentStepLabel ?? "Jornada inicial concluída"}</p>
      <div role="progressbar" aria-label="Progresso da jornada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={journey.progress}>
        <span style={{ width: `${journey.progress}%` }} />
      </div>
      <NextUnlock unlock={nextUnlock} />
      <Link href={`/painel/startup/${startupId}/jornada`}>Abrir Jornada</Link>
    </aside>
  );
}
```

Usar somente valores recebidos; não inferir capítulo, XP, sequência ou desbloqueio.

- [ ] **Step 4: rodar os testes dos novos componentes**

Run: `npm.cmd --prefix apps/frontend test -- startup-progress-panel.test.tsx next-unlock.test.tsx recent-activity.test.tsx`

Expected: PASS. O componente antigo permanece temporariamente até a troca atômica da composição na Task 5.

- [ ] **Step 5: registrar a entrega**

```powershell
git add -- apps/frontend/src/components/home
git commit -m "feat: separate startup progress from account status"
```

### Task 4: Missão como foco inequívoco

**Files:**
- Modify: `apps/frontend/src/components/home/mission-focus-panel.tsx`
- Modify: `apps/frontend/src/components/home/mission-focus-panel.test.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.module.css`

**Interfaces:**
- Consumes: `MissionSummary`, `startupId`, `isPrimaryActionPending`, `onOpenStep(stepKey)` e `onPrimaryAction()`.
- Produces: painel com motivo da recomendação, objetivo, progresso, passos textuais, dica, recompensa secundária e uma única ação principal.

- [ ] **Step 1: escrever testes para motivo, estados e ação dominante**

```tsx
expect(screen.getByText("Comece por evidências reais.")).toBeInTheDocument();
expect(screen.getByText("Em andamento")).toBeInTheDocument();
expect(screen.getAllByRole("button")).toHaveLength(3);
expect(screen.getByRole("button", { name: "Registrar entrevista" })).toHaveAttribute("data-primary-action", "true");
```

No estado concluído, manter `Ir para a Jornada`; no bloqueado, o passo continua sem clique e informa `Bloqueado`.

- [ ] **Step 2: rodar o teste e confirmar a falha**

Run: `npm.cmd --prefix apps/frontend test -- mission-focus-panel.test.tsx`

Expected: FAIL porque o motivo e o marcador de ação principal ainda não são renderizados.

- [ ] **Step 3: reorganizar o cabeçalho e a ação**

Adicionar `mission.recommendationReason` como explicação curta quando existir, `mission.statusLabel` como texto de estado e `data-primary-action="true"` no CTA. Manter XP distante do título e não duplicar instruções do diálogo.

- [ ] **Step 4: refinar a composição visual**

Remover títulos fluidos, usar escala fixa, reduzir densidade dos passos, preservar foco de `2px`, alvos de `44px` e manter as fichas de evidência dentro do contexto da missão sem card branco ou cartão aninhado.

- [ ] **Step 5: rodar teste e registrar a entrega**

Run: `npm.cmd --prefix apps/frontend test -- mission-focus-panel.test.tsx interview-evidence-collection.test.tsx guided-interview-flow.test.tsx`

```powershell
git add -- apps/frontend/src/components/home/mission-focus-panel.tsx apps/frontend/src/components/home/mission-focus-panel.test.tsx apps/frontend/src/components/home/startup-home-screen.module.css
git commit -m "feat: make the current mission the primary workspace focus"
```

### Task 5: Composição da Home e estados honestos

**Files:**
- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.test.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.module.css`
- Delete: `apps/frontend/src/components/home/founder-progress-rail.tsx`
- Delete: `apps/frontend/src/components/home/founder-progress-rail.test.tsx`

**Interfaces:**
- Consumes: componentes das Tasks 3 e 4 e o `TodayPayload` existente.
- Produces: saudação neutra, zona principal missão/progresso, continuidade compacta, estados de arco concluído/bloqueio, erro e teste.

- [ ] **Step 1: atualizar os testes da hierarquia principal**

```tsx
expect(await screen.findByRole("heading", { name: "Olá, Ana" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "Progresso da startup" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "Atividade recente" })).toBeInTheDocument();
expect(screen.queryByText("Nível 3")).not.toBeInTheDocument();
expect(screen.queryByText("4 dias")).not.toBeInTheDocument();
```

Adicionar casos para `arc_complete`, `unavailable`, erro com `Tentar novamente`, e continuidade das mutações/diálogos já cobertos.

- [ ] **Step 2: rodar o teste e confirmar a falha**

Run: `npm.cmd --prefix apps/frontend test -- startup-home-screen.test.tsx`

Expected: FAIL em `Olá, Ana`, progresso local e remoção dos cartões globais.

- [ ] **Step 3: substituir a composição antiga**

```tsx
<header className={styles.pageHeader}>
  <h1>Olá, {payload.user.firstName}</h1>
  <p>{homeContextMessage(payload)}</p>
</header>
<div className={styles.primaryGrid}>
  {renderMissionState()}
  <StartupProgressPanel journey={payload.journey} nextUnlock={payload.nextUnlock} startupId={startupId} />
</div>
<RecentActivity activities={payload.recentActivities} />
```

`homeContextMessage(payload)` retorna objetivo da missão ativa, reconhecimento do arco concluído ou explicação do bloqueio; não usa horário local nem inventa dados. Depois da troca, excluir `FounderProgressRail` e seu teste, confirmando com `rg -n "FounderProgressRail" apps/frontend/src` que não restaram referências.

- [ ] **Step 4: ajustar o layout para os quatro viewports**

Manter `1540px` de largura máxima, `32/24/18px` de padding, rail entre `300px` e `340px`, queda para uma coluna antes de qualquer overflow e nenhuma rolagem dupla. As seções de continuidade usam divisórias, não um mosaico de cartões.

- [ ] **Step 5: rodar a suíte de Home e registrar a entrega**

Run: `npm.cmd --prefix apps/frontend test -- src/components/home`

```powershell
git add -- apps/frontend/src/components/home
git commit -m "feat: rebuild the startup home as a workbench"
```

### Task 6: Consistência de Jornada e Missões

**Files:**
- Modify: `apps/frontend/src/components/journey/startup-journey-screen.module.css`
- Modify: `apps/frontend/src/components/missions/mission-center-screen.module.css`
- Modify: `apps/frontend/src/components/missions/mission-detail-screen.module.css`
- Modify: `apps/frontend/src/components/workspace/workspace-visual-contract.test.ts`

**Interfaces:**
- Consumes: tokens da Task 1.
- Produces: três superfícies autenticadas com o mesmo vocabulário de fundo, texto, borda, foco, ação, sucesso e erro.

- [ ] **Step 1: ampliar o teste de contrato para as três folhas**

```tsx
it.each([
  "src/components/journey/startup-journey-screen.module.css",
  "src/components/missions/mission-center-screen.module.css",
  "src/components/missions/mission-detail-screen.module.css",
])("uses shared workspace roles in %s", (path) => {
  const css = readFileSync(resolve(process.cwd(), path), "utf8");
  expect(css).toContain("var(--sq-text)");
  expect(css).toContain("var(--sq-surface)");
  expect(css).toContain("var(--sq-accent)");
});
```

- [ ] **Step 2: rodar o teste e confirmar a falha**

Run: `npm.cmd --prefix apps/frontend test -- workspace-visual-contract.test.ts`

Expected: FAIL porque as folhas ainda repetem cores literais.

- [ ] **Step 3: migrar papéis equivalentes para tokens**

Substituir apenas papéis compartilhados: fundo, superfícies, textos, bordas, ação, foco, sucesso e erro. Preservar cores específicas que carregam significado próprio de capítulos e status, documentando-as em `DESIGN.md` na Task 7.

- [ ] **Step 4: rodar testes das telas afetadas**

Run: `npm.cmd --prefix apps/frontend test -- src/components/journey src/components/missions workspace-visual-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: executar o detector visual e registrar a entrega**

Run: `node C:\Users\mateu\.agents\skills\impeccable\scripts\detect.mjs --json apps/frontend/src/components/workspace apps/frontend/src/components/home apps/frontend/src/components/journey apps/frontend/src/components/missions`

Corrigir no escopo alterado qualquer contraste insuficiente, card aninhado, foco ausente, raio acima de `16px` em cards ou borda com sombra ampla.

```powershell
git add -- apps/frontend/src/components/journey/startup-journey-screen.module.css apps/frontend/src/components/missions/mission-center-screen.module.css apps/frontend/src/components/missions/mission-detail-screen.module.css apps/frontend/src/components/workspace/workspace-visual-contract.test.ts
git commit -m "refactor: unify authenticated workspace styles"
```

### Task 7: Documentação e validação renderizada

**Files:**
- Create: `DESIGN.md`
- Modify: `Documentação/telas.md`
- Modify: `Documentação/funcionalidades.md`
- Modify: `Documentação/progresso.md`
- Modify: `Documentação/proximos-passos.md`

**Interfaces:**
- Consumes: implementação final e resultados reais de testes/inspeção.
- Produces: sistema visual documentado e evidência de prontidão para apresentação.

- [ ] **Step 1: documentar somente valores confirmados**

`DESIGN.md` deve registrar paleta `--sq-*`, tipografia de produto, escala de espaçamento, raios máximos, botões, foco, estados, regras de cards, breakpoints e exemplos de uso. Os documentos funcionais devem dizer que apenas Home, Jornada e Missões estão ativas.

- [ ] **Step 2: rodar validação automatizada completa**

Run: `npm.cmd --prefix apps/frontend test`

Run: `npm.cmd --prefix apps/frontend run lint`

Run: `npm.cmd --prefix apps/frontend run build`

Run: `docker compose exec -T backend python manage.py test`

Run: `docker compose exec -T backend python manage.py check`

Run: `docker compose exec -T backend python manage.py makemigrations --check --dry-run`

Expected: suítes aprovadas; nenhuma migration nova.

- [ ] **Step 3: validar a interface renderizada**

Abrir a Home autenticada e capturar `1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`. Em cada viewport verificar: missão e CTA no primeiro quadro, sidebar sem módulos futuros, topbar sem corte, ausência de overflow horizontal, foco por teclado, menu não recortado, fichas de evidência escuras e leitura confortável.

- [ ] **Step 4: validar estados especiais**

Usar o ambiente de teste para confirmar missão ativa, conclusão pendente, sucesso, arco concluído, bloqueio e reset. Confirmar que diálogo preserva foco, `Escape` fecha e `prefers-reduced-motion` remove animação não essencial.

- [ ] **Step 5: registrar resultados e finalizar**

Adicionar em `Documentação/progresso.md` os comandos e contagens realmente observados, sem copiar expectativas do plano.

```powershell
git add -- DESIGN.md Documentação/telas.md Documentação/funcionalidades.md Documentação/progresso.md Documentação/proximos-passos.md
git commit -m "docs: document the workspace panel v2"
```

Run: `git status --short --branch`

Expected: somente alterações preexistentes do usuário permanecem fora dos commits.
