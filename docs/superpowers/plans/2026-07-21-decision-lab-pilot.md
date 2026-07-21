# Laboratório de Decisões — Piloto da Missão de Problema

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir as duas textareas da missão `refine_problem_with_evidence` por um desafio curto de quatro rodadas, preservando o contrato de submissão e adicionando ritual visual, feedback imediato, evidências das entrevistas, autosave e uma Carta da Descoberta.

**Architecture:** O backend enriquecerá o detalhe da missão com `sourceEvidences`, obtidas das missões pré-requisito. No frontend, um componente isolado controla as quatro rodadas e produz o mesmo payload `{ problemStatement, evidenceSummary }` que o endpoint já aceita. A shell recebe atmosfera ritual sutil via CSS, enquanto as outras missões continuam no fluxo estruturado atual.

**Tech Stack:** Django 5.2, PostgreSQL, Next.js 16, React 19, TypeScript, CSS Modules, Vitest e Testing Library.

## Global Constraints

- O frontend local continua na porta `3001` e o backend em `8000`.
- Não adicionar dependências de produção.
- Não alterar regras de XP, conclusão, pré-requisitos ou idempotência do backend.
- O piloto se aplica apenas a `problem_refinement`; demais missões preservam a UI atual.
- Usar escrita curta e guiada; nenhuma textarea vazia no piloto.
- Preservar acessibilidade por teclado, `aria-pressed`, live regions e `prefers-reduced-motion`.
- Tratar o produto como ambiente de teste e criação: feedback determinístico, sem IA ou infraestrutura de conquistas nesta fase.

---

### Task 1: Disponibilizar entrevistas anteriores no detalhe da missão

**Files:**
- Modify: `apps/backend/startups/mission_serializers.py`
- Test: `apps/backend/startups/test_mission_api_v2.py`

**Interfaces:**
- Consumes: `mission.prerequisite_keys`, `by_key: dict[str, Mission]`, `serialize_evidence(MissionEvidence)`.
- Produces: `mission.sourceEvidences: list[dict]` em toda resposta de detalhe e submissão.

- [ ] **Step 1: Write the failing API test**

Criar cinco `MissionEvidence` de entrevista na missão `customer_interviews_5`, concluir o pré-requisito e afirmar que o detalhe de `refine_problem_with_evidence` retorna os cinco itens em `sourceEvidences`:

```python
def test_problem_refinement_detail_returns_interviews_as_source_evidence(self):
    interviews = self.startup.missions.get(key="customer_interviews_5")
    for index in range(5):
        MissionEvidence.objects.create(
            mission=interviews,
            evidence_type="interview",
            title=f"Entrevista {index + 1}",
            summary=f"Restaurante {index + 1} relatou compra duplicada.",
            interviewee_name=f"Pessoa {index + 1}",
            interviewee_profile="Dono de restaurante",
            context="Controle semanal de estoque",
            notes="Comprou ingredientes que ainda estavam guardados.",
            occurred_on=timezone.localdate(),
        )
    self.complete_directly("customer_interviews_5")

    response = self.client.get(
        f"/api/startups/{self.startup.pk}/missions/refine_problem_with_evidence/",
        **self.auth,
    )

    self.assertEqual(response.status_code, 200)
    source = response.json()["mission"]["sourceEvidences"]
    self.assertEqual(len(source), 5)
    self.assertEqual(source[0]["intervieweeName"], "Pessoa 1")
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_mission_api_v2.MissionV2ApiTests.test_problem_refinement_detail_returns_interviews_as_source_evidence --keepdb
```

Expected: `FAIL` com ausência de `sourceEvidences`.

- [ ] **Step 3: Implement source evidence serialization**

Adicionar helper puro e usar no detalhe:

```python
def serialize_source_evidences(mission, by_key):
    source = []
    for key in mission.prerequisite_keys:
        prerequisite = by_key.get(key)
        if prerequisite is None:
            continue
        source.extend(
            serialize_evidence(item)
            for item in prerequisite.evidences.order_by("created_at", "pk")
        )
    return source
```

No retorno de `serialize_mission_detail`:

```python
"sourceEvidences": serialize_source_evidences(mission, by_key),
```

- [ ] **Step 4: Run API tests to verify green**

Run:

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_mission_api_v2 --keepdb
```

Expected: 10 tests, 0 failures.

- [ ] **Step 5: Commit backend contract**

```powershell
git add apps/backend/startups/mission_serializers.py apps/backend/startups/test_mission_api_v2.py
git commit -m "feat: expose interview evidence to mission challenges"
```

### Task 2: Definir o modelo determinístico do desafio

**Files:**
- Create: `apps/frontend/src/components/missions/problem-refinement-model.ts`
- Create: `apps/frontend/src/components/missions/problem-refinement-model.test.ts`
- Modify: `apps/frontend/src/lib/startup-types.ts`

**Interfaces:**
- Consumes: `MissionEvidenceSummary`.
- Produces: `ProblemRefinementDraft`, `createProblemRefinementDraft`, `buildProblemStatement`, `buildEvidenceSummary`, `canReviewProblem`, `problemRefinementStorageKey`.

- [ ] **Step 1: Write failing model tests**

Cobrir composição da frase, síntese de duas evidências, prontidão e chave de persistência:

```ts
it("builds the final problem without asking for a long paragraph", () => {
  const draft = {
    ...createProblemRefinementDraft(),
    audience: "Restaurantes pequenos",
    situation: "quando controlam o estoque no fim da semana",
    difficulty: "saber o que ainda está disponível",
    consequence: "compras duplicadas e perda de margem",
  };
  expect(buildProblemStatement(draft)).toBe(
    "Restaurantes pequenos, quando controlam o estoque no fim da semana, têm dificuldade em saber o que ainda está disponível, o que provoca compras duplicadas e perda de margem."
  );
});
```

```ts
it("turns selected interview cards into the backend evidence summary", () => {
  expect(buildEvidenceSummary([firstInterview, secondInterview])).toContain(
    "2 entrevistas sustentam este recorte"
  );
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```powershell
npm test -- src/components/missions/problem-refinement-model.test.ts
```

Expected: `FAIL` porque o módulo ainda não existe.

- [ ] **Step 3: Implement the model**

Criar o draft com `stage`, `warmupAnswer`, `selectedEvidenceIds`, `audience`, `situation`, `difficulty` e `consequence`. A síntese deve usar `notes`, depois `summary`, limitando cada trecho a 180 caracteres e preservando os nomes dos entrevistados. `canReviewProblem` retorna `true` somente com quatro segmentos preenchidos, frase final de pelo menos 40 caracteres e duas evidências selecionadas.

Adicionar ao `MissionDetailSummary`:

```ts
sourceEvidences: MissionEvidenceSummary[];
```

- [ ] **Step 4: Run model tests to verify green**

Run:

```powershell
npm test -- src/components/missions/problem-refinement-model.test.ts
```

Expected: todos os testes passam.

- [ ] **Step 5: Commit the model contract**

```powershell
git add apps/frontend/src/lib/startup-types.ts apps/frontend/src/components/missions/problem-refinement-model.ts apps/frontend/src/components/missions/problem-refinement-model.test.ts
git commit -m "feat: model guided problem refinement"
```

### Task 3: Construir as quatro rodadas com autosave

**Files:**
- Create: `apps/frontend/src/components/missions/problem-refinement-challenge.tsx`
- Create: `apps/frontend/src/components/missions/problem-refinement-challenge.module.css`
- Create: `apps/frontend/src/components/missions/problem-refinement-challenge.test.tsx`

**Interfaces:**
- Consumes: `startupId`, `startup`, `mission`, `isSubmitting`, `submissionError`, `celebration`, `onSubmit(payload)`.
- Produces: payload existente `{ problemStatement: string; evidenceSummary: string }`.

- [ ] **Step 1: Write the failing warm-up test**

Renderizar o desafio, selecionar primeiro uma resposta fraca e depois a resposta observável. Verificar feedback imediato, `role="status"` e avanço para `2 de 4`.

- [ ] **Step 2: Run the test to verify red**

Run:

```powershell
npm test -- src/components/missions/problem-refinement-challenge.test.tsx
```

Expected: `FAIL` porque o componente não existe.

- [ ] **Step 3: Implement the ritual shell and warm-up**

O topo deve apresentar `Desafio de descoberta`, recompensa `+{xpReward} XP`, quatro nós de progresso e a pergunta “Qual formulação descreve um problema observável?”. Usar três botões com `aria-pressed`; resposta errada explica “opinião” ou “solução disfarçada”, resposta certa libera o próximo passo. Oferecer “Ir direto para minhas evidências” para usuários experientes.

- [ ] **Step 4: Write failing evidence-selection test**

Verificar que cartões mostram nome, perfil e relato; o botão de continuar fica desabilitado com uma evidência e habilita com duas. Cada cartão deve usar `aria-pressed`.

- [ ] **Step 5: Implement evidence selection**

Exibir até cinco `sourceEvidences`, contador “N de 2 sinais conectados” e feedback visual “Evidências conectadas” quando o mínimo for alcançado. Se a lista estiver vazia, mostrar recuperação com link para a Home, sem permitir submissão vazia.

- [ ] **Step 6: Write failing composition and preview test**

Preencher quatro inputs curtos, avançar, verificar a Carta da Descoberta e afirmar que `onSubmit` recebe exatamente `problemStatement` e `evidenceSummary` construídos pelo modelo.

- [ ] **Step 7: Implement composition and preview**

Usar quatro inputs de uma linha, prévia atualizada em `aria-live="polite"`, checklist de qualidade e Carta da Descoberta no quarto passo. O CTA final deve ser “Registrar descoberta”.

- [ ] **Step 8: Write failing autosave test**

Pré-carregar `localStorage` com estágio e campos, montar o componente e verificar restauração. Alterar um campo, remontar e verificar persistência. Ao receber `celebration`, verificar remoção da chave.

- [ ] **Step 9: Implement autosave and reduced motion**

Persistir o draft em `startup-quest:problem-refinement:<startupId>`. Usar apenas `opacity` e `transform` nas transições; sob `prefers-reduced-motion`, desativá-las. Não bloquear o usuário em uma celebração temporizada.

- [ ] **Step 10: Run component tests to verify green**

Run:

```powershell
npm test -- src/components/missions/problem-refinement-challenge.test.tsx
```

Expected: todos os testes passam sem warnings.

- [ ] **Step 11: Commit the challenge**

```powershell
git add apps/frontend/src/components/missions/problem-refinement-challenge.tsx apps/frontend/src/components/missions/problem-refinement-challenge.module.css apps/frontend/src/components/missions/problem-refinement-challenge.test.tsx
git commit -m "feat: add decision lab problem challenge"
```

### Task 4: Integrar o piloto e levar o ritual ao painel

**Files:**
- Modify: `apps/frontend/src/components/missions/mission-detail-screen.tsx`
- Modify: `apps/frontend/src/components/missions/mission-detail-screen.test.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.module.css`

**Interfaces:**
- Consumes: `ProblemRefinementChallenge` e o endpoint atual de submissão.
- Produces: UI guiada apenas para `actionType === "problem_refinement"`; fluxo antigo intacto para os demais action types.

- [ ] **Step 1: Replace the old assertion with a failing pilot integration test**

No payload `problem_refinement`, afirmar presença de “Desafio de descoberta” e ausência de “Problema refinado” como textarea. Nos outros action types, manter os campos existentes.

- [ ] **Step 2: Run integration tests to verify red**

Run:

```powershell
npm test -- src/components/missions/mission-detail-screen.test.tsx
```

Expected: `FAIL` porque a tela ainda apresenta o formulário antigo.

- [ ] **Step 3: Extract a payload-based submit function**

Converter a chamada de rede para `submitMissionDraft(submissionDraft)` e manter `submitMission(event)` como adaptador dos formulários legados. Passar ao desafio:

```tsx
<ProblemRefinementChallenge
  celebration={payload.celebration}
  isSubmitting={isSubmitting}
  mission={mission}
  onSubmit={submitMissionDraft}
  startup={payload.startup}
  startupId={startupId}
  submissionError={submissionError}
/>
```

- [ ] **Step 4: Simplify the problem-refinement surface**

Para o piloto ativo, ocultar os blocos corporativos de orientação, requisitos, progresso percentual, etapas e textarea. Preservar back link, estados bloqueado/concluído, próxima missão e recuperação de erro.

- [ ] **Step 5: Add workspace atmosphere**

Em `workspace-shell.module.css`, adicionar ao conteúdo uma combinação sutil de gradientes radiais e pontos luminosos, sem grade decorativa e sem animação contínua. O desafio usa um halo âmbar/azul mais intenso, conectando o painel ao ritual inicial sem competir com o conteúdo.

- [ ] **Step 6: Run mission and workspace tests**

Run:

```powershell
npm test -- src/components/missions/mission-detail-screen.test.tsx src/components/missions/problem-refinement-challenge.test.tsx src/components/workspace/workspace-shell.test.tsx
```

Expected: todos os testes passam.

- [ ] **Step 7: Commit the integration**

```powershell
git add apps/frontend/src/components/missions/mission-detail-screen.tsx apps/frontend/src/components/missions/mission-detail-screen.test.tsx apps/frontend/src/components/workspace/workspace-shell.module.css
git commit -m "feat: integrate ritual decision challenge"
```

### Task 5: Verificação completa do piloto

**Files:**
- Verify only; fix files only through a new failing regression test.

**Interfaces:**
- Consumes: branch completa.
- Produces: evidência de qualidade para integração.

- [ ] **Step 1: Run backend mission tests**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_mission_api_v2 startups.test_mission_engine --keepdb
```

- [ ] **Step 2: Run all frontend tests**

```powershell
npm test
```

- [ ] **Step 3: Run lint**

```powershell
npm run lint
```

- [ ] **Step 4: Run production build**

```powershell
npm run build
```

- [ ] **Step 5: Inspect the real flow**

Executar frontend da worktree na porta livre `3002`, apontando para o backend `8000`, e percorrer em viewport desktop e mobile: aquecimento, seleção por teclado, composição, restauração do rascunho, Carta da Descoberta e conclusão. Preservar o frontend principal em `3001`.

- [ ] **Step 6: Review scope and status**

```powershell
git status --short
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Confirmar que `apps/frontend/next-env.d.ts` da checkout principal e `.impeccable/` não entraram na branch.
