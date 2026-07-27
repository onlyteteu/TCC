# Ambiente de Testes Reiniciável — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Criar uma conta administrativa restrita com uma única startup de teste que possa voltar à primeira missão pelo próprio painel, preservando a conta, o ID e os dados-base da startup.

**Architecture:** O Django será a autoridade: identifica o workspace por um campo persistido, provisiona a conta por comando idempotente e executa o reset em uma transação com bloqueio da startup. A Home recebe uma capacidade calculada pelo backend e chama o endpoint por um proxy autenticado do Next.js. A interface limpa apenas os rascunhos locais pertencentes à startup reiniciada.

**Tech Stack:** Django 5.2, banco relacional via ORM do Django, Next.js 16, React 19, TypeScript, Vitest, Testing Library.

## Global Constraints

- Usar TDD: cada comportamento novo começa por um teste observado falhando pelo motivo esperado.
- Não gravar e-mail ou senha reais no repositório, logs, respostas HTTP ou fixtures de produção.
- Não expor a ação para startups normais nem deduzir permissão pelo e-mail no frontend.
- Preservar `Startup.id`, proprietário, nome, descrição, segmento, problema, público e objetivo inicial.
- Não alterar o onboarding normal nem permitir escolher arbitrariamente uma startup para reset.
- Não incluir `.impeccable/` nem `apps/frontend/next-env.d.ts` nos commits.

---

## Task 1: Persistir e expor a identidade do workspace de teste

**Files:**

- Modify: `apps/backend/startups/models.py`
- Create: `apps/backend/startups/migrations/0009_startup_is_test_workspace.py`
- Create: `apps/backend/startups/test_test_workspace.py`
- Modify: `apps/backend/startups/views.py`

- [x] **Step 1: Escrever os testes vermelhos do campo e da capacidade**

Criar `TestWorkspaceCapabilityTests` em `test_test_workspace.py` cobrindo:

```python
def test_regular_startup_is_not_a_test_workspace_by_default(self):
    startup = Startup.objects.create(owner=self.user, name="Comum")
    self.assertFalse(startup.is_test_workspace)

def test_today_exposes_reset_capability_only_to_staff_owner_of_test_workspace(self):
    self.user.is_staff = True
    self.user.save(update_fields=["is_staff"])
    startup = Startup.objects.create(
        owner=self.user,
        name="Startup de Teste",
        is_test_workspace=True,
    )
    response = self.client.get(
        f"/api/startups/{startup.pk}/today/",
        HTTP_AUTHORIZATION=f"Bearer {issue_auth_token(self.user)}",
    )
    self.assertEqual(response.json()["testWorkspace"], {"canReset": True})
```

Adicionar casos literais para `is_staff=False` e `is_test_workspace=False`, esperando `{"canReset": False}`.

- [x] **Step 2: Executar e observar RED**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.TestWorkspaceCapabilityTests --keepdb
```

Falha esperada: `Startup` não aceita `is_test_workspace` e o payload não contém `testWorkspace`.

- [x] **Step 3: Implementar campo, migração e capacidade calculada**

Adicionar em `Startup`:

```python
is_test_workspace = models.BooleanField(default=False)
```

Gerar a migração `0009`. Em `_today_payload`, acrescentar:

```python
"testWorkspace": {
    "canReset": bool(user.is_staff and startup.is_test_workspace),
},
```

O payload só é criado depois da busca por `owner=user`, portanto a propriedade já está garantida.

- [x] **Step 4: Executar GREEN**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.TestWorkspaceCapabilityTests --keepdb
```

- [x] **Step 5: Commit**

```powershell
git add apps/backend/startups/models.py apps/backend/startups/migrations/0009_startup_is_test_workspace.py apps/backend/startups/test_test_workspace.py apps/backend/startups/views.py
git commit -m "feat: identify resettable test workspaces"
```

---

## Task 2: Implementar reset transacional no domínio

**Files:**

- Create: `apps/backend/startups/test_workspace.py`
- Modify: `apps/backend/startups/test_test_workspace.py`

- [x] **Step 1: Escrever o teste vermelho do reset completo**

Criar `TestWorkspaceResetServiceTests`. A fixture deve:

- criar uma startup de teste com todos os campos-base preenchidos;
- chamar `ensure_journey()` e `sync_mission_catalog()`;
- avançar etapas, iniciar/concluir missão, criar `MissionEvidence`, `Learning` e `ActivityEvent`;
- guardar o ID e os campos-base antes do reset.

O teste chama `reset_test_workspace(startup_id=startup.pk)` e verifica com valores literais:

```python
self.assertEqual(reset_startup.pk, original_id)
self.assertEqual(
    preserved,
    {
        "name": "Startup de Teste",
        "description": "Ambiente reiniciável.",
        "segment": "SaaS",
        "problem": "Pequenos negócios perdem decisões.",
        "audience": "Donos de pequenos negócios.",
        "initial_goal": "Validar o problema.",
    },
)
self.assertEqual(reset_startup.journey_steps.filter(status="done").count(), 2)
self.assertEqual(reset_startup.current_stage, Startup.Stage.VALUE)
self.assertFalse(MissionEvidence.objects.filter(mission__startup=reset_startup).exists())
self.assertFalse(Learning.objects.filter(startup=reset_startup).exists())
self.assertFalse(ActivityEvent.objects.filter(startup=reset_startup).exists())
self.assertEqual(
    reset_startup.missions.get(key="customer_interviews_5").status,
    Mission.Status.AVAILABLE,
)
```

Usar consultas reais para confirmar ausência de evidências, aprendizados e eventos e confirmar que as cinco missões do catálogo foram reconstruídas.

- [x] **Step 2: Escrever o teste vermelho de rollback**

Usar `mock.patch("startups.test_workspace.sync_mission_catalog", side_effect=RuntimeError)` apenas para simular uma falha externa durante a reconstrução. Capturar a exceção fora da chamada e verificar que jornada, missões, evidências, aprendizados e eventos continuam existentes.

- [x] **Step 3: Executar e observar RED**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.TestWorkspaceResetServiceTests --keepdb
```

Falha esperada: o módulo e a função ainda não existem.

- [x] **Step 4: Implementar o serviço mínimo**

Em `test_workspace.py`:

```python
from django.db import transaction

from .mission_engine import sync_mission_catalog
from .models import ActivityEvent, JourneyStep, Learning, Mission, Startup, ensure_journey


@transaction.atomic
def reset_test_workspace(*, startup_id):
    startup = Startup.objects.select_for_update().get(pk=startup_id)
    Learning.objects.filter(startup=startup).delete()
    Mission.objects.filter(startup=startup).delete()
    JourneyStep.objects.filter(startup=startup).delete()
    ActivityEvent.objects.filter(startup=startup).delete()
    ensure_journey(startup)
    sync_mission_catalog(startup)
    startup.refresh_from_db()
    return startup
```

Não modificar campos-base nem `last_opened_at`.

- [x] **Step 5: Executar GREEN**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.TestWorkspaceResetServiceTests --keepdb
```

- [x] **Step 6: Commit**

```powershell
git add apps/backend/startups/test_workspace.py apps/backend/startups/test_test_workspace.py
git commit -m "feat: reset test workspace transactionally"
```

---

## Task 3: Proteger e publicar o endpoint de reset

**Files:**

- Modify: `apps/backend/startups/test_test_workspace.py`
- Modify: `apps/backend/startups/views.py`
- Modify: `apps/backend/startups/urls.py`

- [x] **Step 1: Escrever os testes vermelhos da API**

Criar `TestWorkspaceResetApiTests` cobrindo:

- `401` sem token;
- `404` quando a startup pertence a outro usuário;
- `403` para proprietário não staff;
- `403` para startup normal de proprietário staff;
- `400` para JSON inválido ou confirmação diferente;
- `200` para proprietário staff + startup de teste + confirmação exata;
- resposta de sucesso contém `message`, primeira missão disponível e `testWorkspace.canReset=true`;
- duas chamadas sequenciais continuam retornando o mesmo baseline e não criam duplicatas.

Corpo literal:

```python
{"confirmation": "RESET_TEST_WORKSPACE"}
```

- [x] **Step 2: Executar e observar RED**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.TestWorkspaceResetApiTests --keepdb
```

Falha esperada: `POST /api/startups/<id>/test-reset/` retorna `404`.

- [x] **Step 3: Implementar view e URL**

Adicionar `test_reset` com `@csrf_exempt` e `@require_POST`:

1. autenticar com `_authenticate_request`;
2. buscar `Startup.objects.filter(owner=user, pk=startup_id).first()`;
3. retornar `404` se não existir;
4. retornar `403` se `not user.is_staff or not startup.is_test_workspace`;
5. interpretar `_json_body` e exigir a confirmação literal;
6. chamar `reset_test_workspace(startup_id=startup.pk)`;
7. retornar `JsonResponse(_today_payload(user, reset_startup, message="Ambiente de teste reiniciado na primeira missão."))`.

Registrar:

```python
path("startups/<int:startup_id>/test-reset/", test_reset),
```

- [x] **Step 4: Executar GREEN e regressão backend focal**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace startups.tests.StartupApiTests --keepdb
```

- [x] **Step 5: Commit**

```powershell
git add apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/test_test_workspace.py
git commit -m "feat: expose protected test workspace reset"
```

---

## Task 4: Provisionar a conta e a startup fixa

**Files:**

- Create: `apps/backend/startups/management/__init__.py`
- Create: `apps/backend/startups/management/commands/__init__.py`
- Create: `apps/backend/startups/management/commands/bootstrap_test_workspace.py`
- Modify: `apps/backend/startups/test_test_workspace.py`

- [x] **Step 1: Escrever testes vermelhos do comando**

Criar `BootstrapTestWorkspaceCommandTests` usando `call_command` e `override_env`/`mock.patch.dict`:

- sem `TEST_WORKSPACE_EMAIL` ou `TEST_WORKSPACE_PASSWORD`, lança `CommandError`;
- primeira execução cria usuário com `username=email`, `email=email`, `is_staff=True`, `is_superuser=False` e senha válida;
- cria uma única startup marcada `is_test_workspace=True`, com fundação e catálogo iniciais;
- segunda execução atualiza a senha mas preserva o mesmo usuário, a mesma startup e um evento de progresso inserido entre as chamadas;
- a saída contém o e-mail, mas não contém a senha.

- [x] **Step 2: Executar e observar RED**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.BootstrapTestWorkspaceCommandTests --keepdb
```

Falha esperada: comando `bootstrap_test_workspace` desconhecido.

- [x] **Step 3: Implementar comando idempotente**

Aceitar `--email` e `--password`, com fallback para:

```python
email = options["email"] or os.environ.get("TEST_WORKSPACE_EMAIL")
password = options["password"] or os.environ.get("TEST_WORKSPACE_PASSWORD")
```

Normalizar e-mail para minúsculas; recusar valores vazios. Criar/atualizar o usuário dedicado sem conceder `is_superuser`. Criar a startup apenas se ainda não existir uma `is_test_workspace=True` para esse usuário. Defaults fixos:

```python
{
    "name": "Startup de Teste",
    "description": "Ambiente reiniciável para validar a jornada do Startup Quest.",
    "segment": "Software",
    "problem": "Pequenos negócios perdem tempo organizando tarefas e decisões em ferramentas separadas.",
    "audience": "Donos de pequenos negócios em fase de validação.",
    "initial_goal": "Validar o problema com clientes reais.",
}
```

Somente ao criar a startup, executar `ensure_journey` e `sync_mission_catalog`. Em execuções posteriores, nunca resetar progresso.

- [x] **Step 4: Executar GREEN**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.test_test_workspace.BootstrapTestWorkspaceCommandTests --keepdb
```

- [x] **Step 5: Commit**

```powershell
git add apps/backend/startups/management apps/backend/startups/test_test_workspace.py
git commit -m "feat: provision dedicated test workspace"
```

---

## Task 5: Criar proxy e limpeza seletiva de rascunhos

**Files:**

- Create: `apps/frontend/src/app/api/startups/[startupId]/test-reset/route.ts`
- Create: `apps/frontend/src/lib/test-workspace-storage.ts`
- Create: `apps/frontend/src/lib/test-workspace-storage.test.ts`
- Modify: `apps/frontend/src/lib/startup-types.ts`

- [x] **Step 1: Escrever teste vermelho da limpeza local**

Em `test-workspace-storage.test.ts`, sem mockar `localStorage`, criar:

- dois rascunhos de entrevistas da startup `7`;
- um rascunho de refinamento da startup `7`;
- rascunhos equivalentes da startup `8`;
- uma chave de outro recurso.

Após `clearTestWorkspaceDrafts(7)`, esperar que somente as três chaves da startup `7` tenham sido removidas.

- [x] **Step 2: Executar e observar RED**

```powershell
npm test -- --run src/lib/test-workspace-storage.test.ts
```

Falha esperada: módulo inexistente.

- [x] **Step 3: Implementar helper, tipo e proxy**

O helper percorre `window.localStorage` e remove:

```typescript
const interviewPrefix = `startup-quest:interview-draft:${startupId}:`;
const refinementKey = `startup-quest:problem-refinement:${startupId}`;
```

Coletar as chaves antes de removê-las para não alterar os índices durante a iteração.

Adicionar a `TodayPayload`:

```typescript
testWorkspace: {
  canReset: boolean;
};
```

O proxy deve encaminhar o corpo:

```typescript
return proxyAuthenticatedBackend(`/startups/${startupId}/test-reset/`, {
  body: await request.text(),
  fallbackMessage: "Não foi possível reiniciar o ambiente de teste.",
  method: "POST",
});
```

- [x] **Step 4: Executar GREEN**

```powershell
npm test -- --run src/lib/test-workspace-storage.test.ts
```

- [x] **Step 5: Commit**

```powershell
git add apps/frontend/src/app/api/startups/[startupId]/test-reset/route.ts apps/frontend/src/lib/test-workspace-storage.ts apps/frontend/src/lib/test-workspace-storage.test.ts apps/frontend/src/lib/startup-types.ts
git commit -m "feat: add test workspace reset client contract"
```

---

## Task 6: Construir a faixa e o modal acessível

**Files:**

- Create: `apps/frontend/src/components/home/test-workspace-banner.tsx`
- Create: `apps/frontend/src/components/home/test-workspace-banner.module.css`
- Create: `apps/frontend/src/components/home/test-workspace-banner.test.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.test.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.module.css`

- [x] **Step 1: Escrever testes vermelhos do componente**

Testar o componente real:

- faixa tem nome acessível `Modo de teste` e botão `Reiniciar ambiente`;
- clique abre diálogo `Reiniciar ambiente de teste`;
- diálogo lista progresso, missões, entrevistas/evidências, aprendizados e XP;
- `Escape`, cancelar e clique no backdrop fecham e devolvem foco ao gatilho;
- confirmação chama `onReset` uma única vez, mantém botão desabilitado enquanto a Promise está pendente e mostra `Reiniciando...`;
- rejeição mantém o modal aberto e mostra erro com possibilidade de tentar novamente.

- [x] **Step 2: Executar e observar RED**

```powershell
npm test -- --run src/components/home/test-workspace-banner.test.tsx
```

Falha esperada: componente inexistente.

- [x] **Step 3: Implementar componente mínimo e acessível**

Props:

```typescript
type TestWorkspaceBannerProps = {
  onModalChange?: (open: boolean) => void;
  onReset: () => Promise<void>;
};
```

Usar `role="dialog"`, `aria-modal`, título associado, foco inicial no botão de cancelar, armadilha de `Tab`, retorno de foco e `aria-live` para erros. Guardar uma ref booleana além do estado para impedir duas chamadas no mesmo frame.

- [x] **Step 4: Executar GREEN do componente**

```powershell
npm test -- --run src/components/home/test-workspace-banner.test.tsx
```

- [x] **Step 5: Escrever testes vermelhos de integração na Home**

Adicionar `testWorkspace: { canReset: false }` à fixture base. Testar:

- capacidade falsa não renderiza a faixa;
- capacidade verdadeira renderiza a faixa;
- confirmação envia `POST /api/startups/7/test-reset` com `{"confirmation":"RESET_TEST_WORKSPACE"}`;
- `401` redireciona para `/`;
- erro HTTP mantém o modal e apresenta a mensagem do backend;
- sucesso aplica o novo `TodayPayload`, limpa só os rascunhos da startup `7`, chama `onWorkspaceChanged` e anuncia a mensagem retornada.

- [x] **Step 6: Executar e observar RED da integração**

```powershell
npm test -- --run src/components/home/startup-home-screen.test.tsx
```

Falha esperada: a Home ainda não renderiza a faixa nem envia o reset.

- [x] **Step 7: Integrar na Home**

Criar `resetTestWorkspace()` na Home:

1. enviar a confirmação exata;
2. tratar `401` com `router.replace("/")`;
3. lançar `Error(firstFieldError(errorPayload))` para erro HTTP;
4. em sucesso, chamar `clearTestWorkspaceDrafts(startupId)`;
5. substituir o payload;
6. chamar `onWorkspaceChanged`;
7. deixar o componente fechar o modal somente após a Promise resolver.

Renderizar `TestWorkspaceBanner` logo após o cabeçalho apenas quando `payload.testWorkspace.canReset`.

- [x] **Step 8: Executar GREEN e regressão da Home**

```powershell
npm test -- --run src/components/home/test-workspace-banner.test.tsx src/components/home/startup-home-screen.test.tsx src/lib/test-workspace-storage.test.ts
```

- [x] **Step 9: Commit**

```powershell
git add apps/frontend/src/components/home/test-workspace-banner.tsx apps/frontend/src/components/home/test-workspace-banner.module.css apps/frontend/src/components/home/test-workspace-banner.test.tsx apps/frontend/src/components/home/startup-home-screen.tsx apps/frontend/src/components/home/startup-home-screen.test.tsx apps/frontend/src/components/home/startup-home-screen.module.css
git commit -m "feat: add reset controls to test workspace"
```

---

## Task 7: Documentar provisionamento e verificar o produto

**Files:**

- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-27-test-workspace-reset.md`

- [x] **Step 1: Acrescentar instrução operacional curta**

No README, documentar somente:

```powershell
$env:TEST_WORKSPACE_EMAIL="seu-email-de-teste"
$env:TEST_WORKSPACE_PASSWORD="uma-senha-forte"
.\.venv\Scripts\python.exe manage.py bootstrap_test_workspace
```

Explicar em duas frases que o comando é idempotente, não reseta progresso e deve ser executado no ambiente publicado após configurar os segredos da hospedagem.

- [x] **Step 2: Rodar toda a suíte backend**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test accounts startups --keepdb
```

- [x] **Step 3: Rodar toda a suíte frontend**

```powershell
npm test -- --run
npm run lint
npm run build
```

- [x] **Step 4: Verificar migrações e diff**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py makemigrations --check --dry-run
git diff --check
git status --short
```

- [x] **Step 5: Validar fluxo local real**

Com backend em `8000` e frontend em `3001`:

1. provisionar uma conta local com credenciais temporárias fora do Git;
2. entrar pela tela real;
3. registrar ao menos uma entrevista;
4. abrir `Reiniciar ambiente`;
5. confirmar e observar a primeira missão com `0 de 5`;
6. atualizar a página e confirmar que o baseline persistiu;
7. entrar em uma startup comum e confirmar que a faixa não aparece.

- [x] **Step 6: Revisar o checklist da especificação**

Conferir cada item de `docs/superpowers/specs/2026-07-21-test-workspace-reset-design.md`, registrar qualquer divergência no plano e corrigi-la antes de concluir.

- [x] **Step 7: Commit final**

```powershell
git add README.md docs/superpowers/plans/2026-07-27-test-workspace-reset.md
git commit -m "docs: explain test workspace provisioning"
```
