# Evidence Cards Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o contraste e alinhar as fichas de evidência ao tema escuro da Home.

**Architecture:** Preservar o componente React e seus dados, substituindo somente a paleta clara e
o bloco de citação lateral por estilos coerentes com `guided-interview-flow.module.css`. A grade
continua com duas colunas no desktop e uma coluna abaixo de `680px`.

**Tech Stack:** React 19, CSS Modules, Vitest e Testing Library.

## Global Constraints

- Não alterar dados, ordem, semântica ou interações das fichas.
- Usar a paleta já adotada pelo fluxo guiado de entrevistas.
- Manter duas colunas em desktop e uma coluna abaixo de `680px`.
- Não incluir `.impeccable/` no commit.

---

### Task 1: Alinhar a coleção ao tema escuro

**Files:**
- Modify: `apps/frontend/src/components/home/interview-evidence-collection.module.css`
- Test: `apps/frontend/src/components/home/interview-evidence-collection.test.tsx`

**Interfaces:**
- Consumes: marcação existente de `InterviewEvidenceCollection`.
- Produces: coleção escura responsiva sem alterar a API do componente.

- [ ] **Step 1: Executar o teste atual como linha de base**

Run:

```powershell
cd apps/frontend
npm.cmd test -- src/components/home/interview-evidence-collection.test.tsx
```

Expected: 3 testes passam e confirmam que progresso, sinais, conteúdo legado e data estão
preservados antes da alteração visual.

- [ ] **Step 2: Substituir a paleta clara**

Em `interview-evidence-collection.module.css`:

- trocar a divisória por `#2b3d52`;
- trocar o título por `#f7efe3` e progresso por `#9aa8b8`;
- usar card `#111927` com borda `#2b3d52`;
- usar número `#f2a51a` com texto `#070b13`;
- usar nome `#f7efe3`, texto secundário `#9aa8b8` e contexto `#cbd4df`;
- usar chips `#172b3c` com texto `#a9d8ef`;
- usar observação `#0e1724`, borda `#3c536c`, raio `10px` e texto `#cbd4df`;
- remover o gradiente claro e a borda lateral da observação.

- [ ] **Step 3: Reexecutar o teste focado**

Run:

```powershell
npm.cmd test -- src/components/home/interview-evidence-collection.test.tsx
```

Expected: 3 testes passam sem mudanças na marcação ou no conteúdo.

- [ ] **Step 4: Verificar responsividade e conteúdo real**

Abrir a Home da startup de teste com pelo menos uma entrevista e confirmar:

- card escuro integrado à missão;
- título e progresso legíveis;
- duas colunas em desktop;
- uma coluna abaixo de `680px`;
- nomes, contexto, chips e observações longas quebram sem transbordar.

---

### Task 2: Verificar e entregar

**Files:**
- Verify: `apps/frontend/src/components/home/interview-evidence-collection.module.css`

**Interfaces:**
- Consumes: coleção visualmente alinhada.
- Produces: commit isolado e validado.

- [ ] **Step 1: Executar verificação frontend completa**

Run:

```powershell
cd apps/frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: testes, lint e build passam.

- [ ] **Step 2: Conferir o escopo**

Run:

```powershell
cd ..\..
git diff --check
git status --short
```

Expected: somente o CSS aprovado aparece como alteração do recurso; `.impeccable/` permanece fora
do commit.

- [ ] **Step 3: Commitar o ajuste**

Run:

```powershell
git add -- apps/frontend/src/components/home/interview-evidence-collection.module.css
git diff --cached --check
git commit -m "fix: align evidence cards with dark theme"
```

Expected: commit criado apenas com o CSS da coleção.
