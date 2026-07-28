# Test Mission Completion Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar ao banner Modo de teste um botão que conclui a missão recomendada atual, atualiza a Home e não altera as regras dos ambientes normais.

**Architecture:** Um endpoint Django exclusivo valida proprietário, `is_staff` e `is_test_workspace`, conclui a missão atual em transação e devolve o `TodayPayload` reconciliado. Uma rota Next.js encaminha a sessão autenticada, e a Home entrega a mutação ao banner, que controla estado pendente, erros e cliques duplicados.

**Tech Stack:** Django 5.2, Django TestCase, Next.js 16.2, React 19, TypeScript, Vitest e Testing Library.

## Global Constraints

- O botão deve se chamar **Concluir missão atual** e ficar no banner **Modo de teste**.
- A exceção às evidências existe somente no endpoint de teste.
- Somente o proprietário `is_staff` de uma startup com `is_test_workspace=true` pode usar a ação.
- A conclusão deve registrar atividade e XP uma única vez e reconciliar a próxima missão.
- O frontend deve impedir requisições duplicadas e manter o estado atual quando houver erro.
- Não incluir `apps/frontend/next-env.d.ts` nem `.impeccable/` nos commits.
- Preservar as alterações locais existentes e não refatorar fluxos de missão que não participam desse recurso.

---

### Task 1: Validar o serviço e o endpoint de conclusão de teste

**Files:**
- Modify: `apps/backend/startups/mission_engine.py`
- Modify: `apps/backend/startups/views.py`
- Modify: `apps/backend/startups/urls.py`
- Test: `apps/backend/startups/test_test_workspace.py`

**Interfaces:**
- Consumes: `select_recommended_mission(startup) -> Mission | None` e `_today_payload(user, startup, *, message=None) -> dict`.
- Produces: `complete_test_mission_record(mission) -> tuple[Mission, bool]` e `POST /api/startups/<startup_id>/test-complete-mission/`.

- [ ] **Step 1: Completar os testes do endpoint antes de ajustar a implementação**

Adicionar ao `TestWorkspaceCompleteMissionApiTests` a ausência de missão disponível e a
idempotência do serviço:

```python
def test_complete_reports_when_no_mission_is_available(self):
    self.startup.missions.update(
        status=Mission.Status.COMPLETED,
        completed_at=timezone.now(),
    )

    response = self.post_complete()

    self.assertEqual(response.status_code, 409)
    self.assertEqual(
        response.json()["message"],
        "Nao ha uma missao disponivel para concluir.",
    )

def test_complete_service_does_not_duplicate_activity_or_xp(self):
    mission = self.startup.missions.get(key="customer_interviews_5")

    _, completed_first = complete_test_mission_record(mission)
    _, completed_second = complete_test_mission_record(mission)

    self.assertTrue(completed_first)
    self.assertFalse(completed_second)
    self.assertEqual(
        ActivityEvent.objects.filter(
            startup=self.startup,
            dedupe_key=f"mission_completed:{mission.pk}",
        ).count(),
        1,
    )
```

Importar `timezone` e `complete_test_mission_record` no arquivo de teste.

- [ ] **Step 2: Executar os testes focados**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_test_workspace.TestWorkspaceCompleteMissionApiTests --keepdb
```

Expected: os testes de autorização, avanço, ausência de missão e idempotência passam. Se algum
teste novo falhar, a falha deve apontar a lacuna real do endpoint ou do serviço, não um erro de
importação.

- [ ] **Step 3: Manter a implementação mínima do serviço**

O serviço deve bloquear a missão, validar o tipo de workspace e reutilizar a mutação comum:

```python
@transaction.atomic
def complete_test_mission_record(mission):
    mission = Mission.objects.select_for_update().select_related("startup").get(
        pk=mission.pk
    )
    if not mission.startup.is_test_workspace:
        raise MissionRuleError(
            "Essa missão não pertence a um ambiente de teste."
        )
    if mission.status == Mission.Status.LOCKED:
        raise MissionRuleError("Essa missão ainda está bloqueada.")
    return _mark_mission_completed(mission)
```

O endpoint deve autenticar, buscar apenas startup do proprietário, exigir `is_staff` e
`is_test_workspace`, selecionar a missão recomendada e responder com `_today_payload`.

- [ ] **Step 4: Reexecutar a suíte focada do backend**

Run:

```powershell
.\.venv\Scripts\python.exe manage.py test startups.test_test_workspace.TestWorkspaceCompleteMissionApiTests --keepdb
```

Expected: `OK`.

- [ ] **Step 5: Verificar o diff do backend**

Run:

```powershell
git diff --check -- apps/backend/startups/mission_engine.py apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/test_test_workspace.py
```

Expected: nenhuma saída.

---

### Task 2: Validar o botão e seus estados no banner

**Files:**
- Modify: `apps/frontend/src/components/home/test-workspace-banner.tsx`
- Modify: `apps/frontend/src/components/home/test-workspace-banner.module.css`
- Test: `apps/frontend/src/components/home/test-workspace-banner.test.tsx`

**Interfaces:**
- Consumes: propriedade opcional `onCompleteMission?: () => Promise<void>`.
- Produces: botão **Concluir missão atual**, estado **Concluindo missão...** e alerta de falha.

- [ ] **Step 1: Escrever o teste de recuperação após erro**

Adicionar:

```tsx
it("shows a completion error and allows retry", async () => {
  const onCompleteMission = vi
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error("Não foi possível avançar."))
    .mockResolvedValueOnce();
  render(
    <TestWorkspaceBanner
      onCompleteMission={onCompleteMission}
      onReset={vi.fn()}
    />
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Concluir missão atual" })
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível avançar."
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Concluir missão atual" })
  );
  await waitFor(() => expect(onCompleteMission).toHaveBeenCalledTimes(2));
});
```

- [ ] **Step 2: Executar o teste do banner**

Run:

```powershell
cd apps/frontend
npm.cmd test -- src/components/home/test-workspace-banner.test.tsx
```

Expected: o novo teste falha se o erro não for exibido ou se o estado pendente não for liberado.

- [ ] **Step 3: Implementar somente os estados necessários**

Manter `completionPendingRef`, `isCompleting` e `completionError`. A ação deve:

```tsx
async function completeMission() {
  if (!onCompleteMission || completionPendingRef.current) return;

  completionPendingRef.current = true;
  setIsCompleting(true);
  setCompletionError(null);
  try {
    await onCompleteMission();
  } catch (caughtError) {
    setCompletionError(
      caughtError instanceof Error
        ? caughtError.message
        : "Não foi possível concluir a missão de teste."
    );
  } finally {
    completionPendingRef.current = false;
    setIsCompleting(false);
  }
}
```

Renderizar o botão apenas quando `onCompleteMission` existir e desabilitar **Reiniciar ambiente**
durante a conclusão.

- [ ] **Step 4: Reexecutar o teste do banner**

Run:

```powershell
npm.cmd test -- src/components/home/test-workspace-banner.test.tsx
```

Expected: todos os testes do componente passam.

---

### Task 3: Integrar a conclusão na Home e criar o proxy Next.js

**Files:**
- Create: `apps/frontend/src/app/api/startups/[startupId]/test-complete-mission/route.ts`
- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Test: `apps/frontend/src/components/home/startup-home-screen.test.tsx`

**Interfaces:**
- Consumes: `TestWorkspaceBanner.onCompleteMission` e `TodayPayload`.
- Produces: `completeTestMission() -> Promise<void>` e
  `POST /api/startups/<startupId>/test-complete-mission`.

- [ ] **Step 1: Escrever o teste de integração da Home**

Adicionar um teste que carregue `testWorkspace.canReset=true`, clique no botão e valide a
requisição, a atualização da missão e a reconciliação:

```tsx
it("completes the current test mission and refreshes the Home payload", async () => {
  const onWorkspaceChanged = vi.fn().mockResolvedValue(true);
  const testPayload = {
    ...payload,
    testWorkspace: { canReset: true },
  };
  const advancedPayload = {
    ...testPayload,
    message: "Missão concluída pelo modo de teste.",
    mission: {
      ...payload.mission!,
      key: "refine_problem_with_evidence",
      title: "Refine o problema com evidências",
    },
  };
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => jsonResponse(testPayload))
    .mockImplementationOnce(() => jsonResponse(advancedPayload));
  vi.stubGlobal("fetch", fetchMock);

  render(
    <StartupHomeScreen
      onWorkspaceChanged={onWorkspaceChanged}
      startupId={7}
    />
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Concluir missão atual" })
  );

  await waitFor(() =>
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/startups/7/test-complete-mission",
      { method: "POST" }
    )
  );
  expect(
    await screen.findByText("Missão concluída pelo modo de teste.")
  ).toBeInTheDocument();
  expect(
    screen.getByText("Refine o problema com evidências")
  ).toBeInTheDocument();
  expect(onWorkspaceChanged).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run:

```powershell
npm.cmd test -- src/components/home/startup-home-screen.test.tsx
```

Expected: FAIL porque a Home ainda não entrega `onCompleteMission` ao banner.

- [ ] **Step 3: Implementar a mutação na Home**

Adicionar:

```tsx
async function completeTestMission() {
  let response: Response;
  try {
    response = await fetch(
      `/api/startups/${startupId}/test-complete-mission`,
      { method: "POST" }
    );
  } catch {
    throw new Error(
      "Não foi possível concluir a missão de teste. Verifique sua conexão e tente novamente."
    );
  }

  const nextPayload = (await response.json()) as TodayPayload | AuthErrorPayload;
  if (response.status === 401) {
    router.replace("/");
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }
  if (!response.ok) {
    throw new Error(firstFieldError(nextPayload as AuthErrorPayload));
  }

  setPayload(nextPayload as TodayPayload);
  void onWorkspaceChanged?.();
}
```

Passar `onCompleteMission={completeTestMission}` ao `TestWorkspaceBanner`.

- [ ] **Step 4: Criar a rota de proxy**

Criar:

```ts
import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  return proxyAuthenticatedBackend(
    `/startups/${startupId}/test-complete-mission/`,
    {
      fallbackMessage: "Não foi possível concluir a missão de teste.",
      method: "POST",
    }
  );
}
```

- [ ] **Step 5: Reexecutar os testes da Home e do banner**

Run:

```powershell
npm.cmd test -- src/components/home/startup-home-screen.test.tsx src/components/home/test-workspace-banner.test.tsx
```

Expected: todos passam.

---

### Task 4: Verificação integrada e commit

**Files:**
- Verify: todos os arquivos das Tasks 1 a 3
- Exclude: `apps/frontend/next-env.d.ts`
- Exclude: `.impeccable/`

**Interfaces:**
- Consumes: endpoint Django, proxy Next.js e integração React concluídos.
- Produces: recurso testado e commit isolado.

- [ ] **Step 1: Rodar toda a suíte relevante do backend**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts startups --keepdb
```

Expected: `System check identified no issues` e `OK`.

- [ ] **Step 2: Rodar toda a verificação do frontend**

Run:

```powershell
cd ..\frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: testes, lint e build passam sem erros.

- [ ] **Step 3: Conferir o escopo final**

Run:

```powershell
cd ..\..
git diff --check
git status --short
git diff -- apps/backend/startups/mission_engine.py apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/test_test_workspace.py apps/frontend/src/components/home/test-workspace-banner.tsx apps/frontend/src/components/home/test-workspace-banner.module.css apps/frontend/src/components/home/test-workspace-banner.test.tsx apps/frontend/src/components/home/startup-home-screen.tsx apps/frontend/src/components/home/startup-home-screen.test.tsx apps/frontend/src/app/api/startups/[startupId]/test-complete-mission/route.ts
```

Expected: somente o recurso aprovado aparece no diff; `next-env.d.ts` e `.impeccable/` permanecem
fora do escopo.

- [ ] **Step 4: Commitar somente o recurso**

Run:

```powershell
git add -- apps/backend/startups/mission_engine.py apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/test_test_workspace.py apps/frontend/src/components/home/test-workspace-banner.tsx apps/frontend/src/components/home/test-workspace-banner.module.css apps/frontend/src/components/home/test-workspace-banner.test.tsx apps/frontend/src/components/home/startup-home-screen.tsx apps/frontend/src/components/home/startup-home-screen.test.tsx apps/frontend/src/app/api/startups/[startupId]/test-complete-mission/route.ts
git diff --cached --check
git commit -m "feat: add test mission completion button"
```

Expected: commit criado sem incluir arquivos gerados ou não relacionados.
