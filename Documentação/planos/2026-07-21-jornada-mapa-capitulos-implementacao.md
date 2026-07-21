# Jornada — Mapa de Capítulos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a Jornada atual em um Mapa de Capítulos que explica a evolução estratégica da startup, conecta o marco atual à missão correta e remove a conclusão direta pela interface da Jornada.

**Architecture:** O Django continua como fonte de verdade e ganha um serviço de leitura da Jornada que deriva quatro capítulos das oito `JourneyStep`, associa apenas os marcos operacionais às missões versionadas e expõe um contrato aditivo. O Next.js apresenta esse contrato em componentes pequenos — mapa, painel do marco e resumo estratégico — e mantém o Mapa da startup como visão secundária via query string. Nenhuma tabela de capítulo será criada.

**Tech Stack:** Django 5.2, PostgreSQL/SQLite de testes, Python 3.12+, Next.js 16.2 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library e validação visual no navegador local.

## Global Constraints

- preservar exatamente as oito etapas existentes da Jornada;
- derivar quatro capítulos: Fundamento, Proposta, Validação e Construção;
- o backend é a única fonte de progresso, bloqueios, missão relacionada e XP;
- Home responde a próxima ação, Missões executa e Jornada explica evolução;
- remover `Concluir etapa` da Jornada e rejeitar `complete: true` na API de etapa;
- `Revisar registro` atualiza síntese, mas não conclui etapa nem concede XP;
- não criar tabela, model ou migration para capítulos;
- adicionar duração estimada ao snapshot versionado das missões, sem estimativa no cliente;
- incrementar o catálogo para a versão 3 e preencher a duração das missões já existentes;
- XP de etapas guiadas por missão vem somente da missão/atividade: a Jornada não soma 100 XP outra vez;
- omitir CTA e recompensa quando a etapa atual não possui missão operacional;
- manter o payload antigo da Jornada durante a migração, adicionando novos campos;
- preservar startups, etapas e missões já existentes;
- âmbar indica ação/marco atual, teal indica conclusão e cinza-azulado acompanhado de texto indica bloqueio;
- a rota é horizontal no desktop e vertical abaixo de `820px`, sem rolagem horizontal;
- foco visível, teclado, `aria-current="step"`, progresso semântico e `prefers-reduced-motion` são obrigatórios;
- validar `1280 x 720`, `1366 x 768`, `1536 x 720`, `1920 x 900` e um viewport móvel;
- não adicionar biblioteca visual, DRF, IA ou dependência npm;
- preservar a alteração não relacionada em `apps/frontend/next-env.d.ts` e mantê-la fora dos commits;
- cada tarefa termina com testes verdes e commit contendo somente seus arquivos.

---

## File structure

### Backend

- `apps/backend/startups/models.py`: snapshot persistido de `estimated_minutes` em `Mission`.
- `apps/backend/startups/migrations/0008_mission_estimated_minutes.py`: migration aditiva com default seguro e backfill por chave.
- `apps/backend/startups/mission_catalog.py`: duração curada das cinco missões.
- `apps/backend/startups/mission_serializers.py`: expõe `estimatedMinutes` nos contratos de missão.
- `apps/backend/startups/journey_service.py`: capítulos, textos dos marcos, associação etapa-missão, resumo estratégico e reconciliação idempotente.
- `apps/backend/startups/views.py`: payload aditivo e rejeição de conclusão direta.
- `apps/backend/startups/mission_submissions.py`: diferenciais passam a usar a missão de alternativas e reconciliam conclusão fora de ordem.
- `apps/backend/startups/test_journey_service.py`: testes unitários da derivação e reconciliação.
- `apps/backend/startups/test_mission_engine.py`: duração versionada e sincronização missão/Jornada.
- `apps/backend/startups/tests.py`: contrato HTTP da Jornada e regressões de autorização/edição.

### Frontend contracts and navigation

- `apps/frontend/src/lib/startup-types.ts`: capítulos, marco, resumo estratégico e missão relacionada.
- `apps/frontend/src/lib/startup-navigation.ts`: `startupJourneyMapHref()` e preservação das rotas existentes.
- `apps/frontend/src/lib/startup-navigation.test.ts`: query string e encoding do campo.

### Frontend components

- `apps/frontend/src/components/journey/journey-chapter-map.tsx`: rota semântica e seleção.
- `apps/frontend/src/components/journey/journey-chapter-map.test.tsx`: estados, bloqueios e teclado.
- `apps/frontend/src/components/journey/journey-milestone-panel.tsx`: objetivo, construído, desbloqueio e CTA.
- `apps/frontend/src/components/journey/journey-milestone-panel.test.tsx`: missão disponível, concluída e ausente.
- `apps/frontend/src/components/journey/journey-workspace.tsx`: composição do mapa, marco e resumo.
- `apps/frontend/src/components/journey/journey-workspace.test.tsx`: integração dos componentes.
- `apps/frontend/src/components/journey/startup-map-summary.tsx`: nome `Mapa da startup` e abertura focada por campo.
- `apps/frontend/src/components/journey/startup-map-summary.test.tsx`: foco inicial e revisão sem progresso.
- `apps/frontend/src/components/journey/startup-journey-screen.tsx`: carregamento, query string, troca de visão e edição de registro.
- `apps/frontend/src/components/journey/startup-journey-screen.test.tsx`: fluxo completo, loading, erro e retry.
- `apps/frontend/src/components/journey/startup-journey-screen.module.css`: composição aprovada e responsividade.
- `apps/frontend/src/components/journey/startup-journey-screen.theme.test.ts`: contrato visual e breakpoints.

### Documentation

- `README.md`, `Documentação/funcionalidades.md`, `fluxos.md`, `telas.md`, `arquitetura-missoes.md`, `progresso.md`, `proximos-passos.md` e `handoff.md`: marcar como implementado somente após a verificação final.

---

### Task 1: Persistir duração estimada no catálogo versionado

**Files:**

- Modify: `apps/backend/startups/models.py:124-166`
- Create: `apps/backend/startups/migrations/0008_mission_estimated_minutes.py`
- Modify: `apps/backend/startups/mission_catalog.py:7-205`
- Modify: `apps/backend/startups/mission_serializers.py:55-84`
- Modify: `apps/backend/startups/test_mission_engine.py:31-140`

**Interfaces:**

- Produces: `Mission.estimated_minutes: PositiveSmallIntegerField`.
- Produces: `MissionDefinition.estimated_minutes: int` incluído em `snapshot()`.
- Produces: `MissionCardSummary.estimatedMinutes` no backend.
- Changes: catálogo de missões passa da versão 2 para a versão 3.

- [ ] **Step 1: Write the failing snapshot tests**

Adicionar a `MissionSchemaTests`:

```python
def test_catalog_snapshot_persists_estimated_minutes(self):
    definition = MissionDefinition.minimal("duration_contract")

    self.assertEqual(definition.estimated_minutes, 15)
    self.assertEqual(definition.snapshot()["estimated_minutes"], 15)

def test_serializer_exposes_estimated_minutes(self):
    mission = Mission.objects.create(
        startup=self.startup,
        key="duration_contract",
        phase="Teste",
        title="Contrato de duracao",
        objective="Expor duracao curada.",
        why_it_matters="Evita estimativa no cliente.",
        completion_criteria="Contrato serializado.",
        estimated_minutes=25,
    )
    card = serialize_mission_card(mission, by_key={mission.key: mission})

    self.assertEqual(card["estimatedMinutes"], 25)
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionSchemaTests
```

Expected: FAIL porque `MissionDefinition` e `Mission` ainda não aceitam `estimated_minutes`.

- [ ] **Step 3: Add the model, migration and catalog snapshot**

Adicionar ao model:

```python
estimated_minutes = models.PositiveSmallIntegerField(default=15)
```

Adicionar ao dataclass e snapshot:

```python
estimated_minutes: int

def snapshot(self):
    return {
        # campos existentes
        "estimated_minutes": self.estimated_minutes,
    }
```

`MissionDefinition.minimal()` usa `estimated_minutes=15`. As cinco definições usam, na ordem do
catálogo, `150`, `20`, `20`, `15` e `25` minutos. Incrementar `CATALOG_VERSION` e a versão das
definições para `3`, de modo que missões ainda não iniciadas recebam o novo snapshot durante
`sync_mission_catalog()`.

Criar migration:

```python
from django.db import migrations, models


ESTIMATED_MINUTES_BY_KEY = {
    "customer_interviews_5": 150,
    "refine_problem_with_evidence": 20,
    "validate_priority_audience": 20,
    "reframe_value_proposition": 15,
    "map_current_alternatives": 25,
}


def backfill_estimated_minutes(apps, schema_editor):
    mission_model = apps.get_model("startups", "Mission")
    for key, minutes in ESTIMATED_MINUTES_BY_KEY.items():
        mission_model.objects.filter(key=key).update(estimated_minutes=minutes)


class Migration(migrations.Migration):
    dependencies = [("startups", "0007_mission_catalog_v2")]
    operations = [
        migrations.AddField(
            model_name="mission",
            name="estimated_minutes",
            field=models.PositiveSmallIntegerField(default=15),
        ),
        migrations.RunPython(backfill_estimated_minutes, migrations.RunPython.noop),
    ]
```

Adicionar ao card:

```python
"estimatedMinutes": mission.estimated_minutes,
```

- [ ] **Step 4: Run migration and catalog tests**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionSchemaTests startups.test_mission_engine.MissionCatalogTests
```

Expected: nenhuma migration adicional; testes PASS.

- [ ] **Step 5: Commit the mission metadata**

```powershell
git add apps/backend/startups/models.py apps/backend/startups/migrations/0008_mission_estimated_minutes.py apps/backend/startups/mission_catalog.py apps/backend/startups/mission_serializers.py apps/backend/startups/test_mission_engine.py
git commit -m "feat: adiciona duracao estimada as missoes"
```

---

### Task 2: Derivar o contrato do Mapa de Capítulos no backend

**Files:**

- Create: `apps/backend/startups/journey_service.py`
- Create: `apps/backend/startups/test_journey_service.py`
- Modify: `apps/backend/startups/views.py:536-661`
- Modify: `apps/backend/startups/tests.py:460-642`

**Interfaces:**

- Produces: `build_journey_context(startup, steps) -> dict`.
- Produces: `chapters`, `currentMilestone` e `strategicSummary` no `JourneyPayload`.
- Consumes: missões sincronizadas por `sync_mission_catalog(startup)`.

- [ ] **Step 1: Write failing chapter derivation tests**

Criar `test_journey_service.py` com startup contendo problema e público concluídos e valor atual:

```python
from django.contrib.auth import get_user_model
from django.test import TestCase

from .journey_service import build_journey_context
from .models import JourneyStep, Startup, ensure_journey

User = get_user_model()


class JourneyContextTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username="journey-context@example.com")
        self.startup = Startup.objects.create(
            owner=user,
            name="Estoca",
            problem="Compras duplicadas reduzem a margem.",
            audience="Restaurantes pequenos com estoque manual.",
        )
        ensure_journey(self.startup)

    def test_groups_eight_steps_into_four_derived_chapters(self):
        steps = list(self.startup.journey_steps.all())
        context = build_journey_context(self.startup, steps)

        self.assertEqual(
            [chapter["key"] for chapter in context["chapters"]],
            ["foundation", "proposal", "validation", "construction"],
        )
        self.assertEqual([chapter["status"] for chapter in context["chapters"]], ["done", "current", "locked", "locked"])
        self.assertEqual(sum(len(chapter["steps"]) for chapter in context["chapters"]), 8)

    def test_current_value_milestone_links_the_versioned_mission(self):
        context = build_journey_context(self.startup, list(self.startup.journey_steps.all()))
        milestone = context["currentMilestone"]

        self.assertEqual(milestone["key"], Startup.Stage.VALUE)
        self.assertEqual(milestone["chapterKey"], "proposal")
        self.assertEqual(milestone["mission"]["key"], "reframe_value_proposition")
        self.assertEqual(milestone["mission"]["href"], f"/painel/startup/{self.startup.pk}/missoes/reframe_value_proposition")
```

- [ ] **Step 2: Run the new test and confirm RED**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_journey_service
```

Expected: FAIL porque `journey_service.py` não existe.

- [ ] **Step 3: Implement focused chapter metadata and serialization**

Criar `journey_service.py` com constantes imutáveis:

```python
from .mission_engine import sync_mission_catalog
from .models import JourneyStep, Mission, Startup

CHAPTERS = (
    {"key": "foundation", "title": "Fundamento", "question": "Para quem e para qual dor esta startup existe?", "steps": (Startup.Stage.PROBLEM, Startup.Stage.AUDIENCE)},
    {"key": "proposal", "title": "Proposta", "question": "Por que essa startup merece existir?", "steps": (Startup.Stage.VALUE, Startup.Stage.DIFFERENTIATORS)},
    {"key": "validation", "title": "Validação", "question": "O que prova que a proposta é desejável e viável?", "steps": (Startup.Stage.VALIDATION, Startup.Stage.BUSINESS_MODEL)},
    {"key": "construction", "title": "Construção", "question": "Qual é a menor entrega e como medir o avanço?", "steps": (Startup.Stage.MVP, Startup.Stage.GOALS)},
)

MISSION_BY_STEP = {
    Startup.Stage.PROBLEM: "refine_problem_with_evidence",
    Startup.Stage.AUDIENCE: "validate_priority_audience",
    Startup.Stage.VALUE: "reframe_value_proposition",
    Startup.Stage.DIFFERENTIATORS: "map_current_alternatives",
}
```

Implementar `build_journey_context()` para:

```python
def build_journey_context(startup, steps):
    missions = sync_mission_catalog(startup)
    missions_by_key = {mission.key: mission for mission in missions}
    steps_by_key = {step.key: step for step in steps}
    current = next((step for step in steps if step.status == JourneyStep.Status.CURRENT), None)
    chapters = [_serialize_chapter(definition, steps_by_key) for definition in CHAPTERS]
    return {
        "chapters": chapters,
        "currentMilestone": _serialize_milestone(startup, current, chapters, missions_by_key),
        "strategicSummary": _strategic_summary(steps_by_key),
    }
```

Missão serializada contém exatamente `key`, `title`, `objective`, `href`, `estimatedMinutes`,
`xpReward`, `status` e `canContinue`. `canContinue` é verdadeiro apenas para `available` ou
`in_progress`. Marcos sem missão recebem `mission=None` e a mensagem aprovada.

- [ ] **Step 4: Extend `_journey_payload()` additively**

Em `views.py`:

```python
from .journey_service import build_journey_context


def _journey_payload(startup, message=None):
    steps = list(startup.journey_steps.all())
    done_count = sum(step.status == JourneyStep.Status.DONE for step in steps)
    payload = {
        "journey": [_serialize_step(step) for step in steps],
        "progress": round((done_count / len(steps)) * 100) if steps else 0,
        "startup": _serialize_startup(startup),
        **build_journey_context(startup, steps),
    }
    if message:
        payload["message"] = message
    return payload
```

Atualizar `JourneyApiTests` para afirmar quatro capítulos, marco atual, resumo e compatibilidade dos
campos existentes.

- [ ] **Step 5: Run service and HTTP contract tests**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_journey_service startups.tests.JourneyApiTests
```

Expected: PASS.

- [ ] **Step 6: Commit the journey read contract**

```powershell
git add apps/backend/startups/journey_service.py apps/backend/startups/test_journey_service.py apps/backend/startups/views.py apps/backend/startups/tests.py
git commit -m "feat: deriva mapa de capitulos da jornada"
```

---

### Task 3: Tornar progresso da Jornada consequência das Missões

**Files:**

- Modify: `apps/backend/startups/journey_service.py`
- Modify: `apps/backend/startups/mission_submissions.py:20-190`
- Modify: `apps/backend/startups/views.py:1069-1157`
- Modify: `apps/backend/startups/test_journey_service.py`
- Modify: `apps/backend/startups/test_mission_engine.py:306-423`
- Modify: `apps/backend/startups/tests.py:519-614`

**Interfaces:**

- Produces: `reconcile_completed_journey_missions(startup) -> bool` idempotente.
- Changes: `journey_step` aceita revisão, mas rejeita `complete: true` com HTTP 409.
- Changes: missão `map_current_alternatives` alimenta `JourneyStep.DIFFERENTIATORS`.

- [ ] **Step 1: Write failing direct-completion and parallel-mission tests**

Substituir o teste de conclusão direta por:

```python
def test_journey_rejects_direct_completion_but_keeps_answer_editable(self):
    startup_id = self.create_startup_via_api()
    response = self.client.patch(
        f"/api/startups/{startup_id}/journey/value/",
        data={"answer": "Promessa revisada com contexto suficiente.", "complete": True},
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )
    self.assertEqual(response.status_code, 409)
    step = JourneyStep.objects.get(startup_id=startup_id, key=Startup.Stage.VALUE)
    self.assertEqual(step.status, JourneyStep.Status.CURRENT)
```

Adicionar regressão para alternativas concluídas antes de valor:

```python
def test_completed_alternatives_advance_when_differentiators_becomes_current(self):
    self.complete_prerequisites("customer_interviews_5", "refine_problem_with_evidence", "validate_priority_audience")
    alternatives = self.startup.missions.get(key="map_current_alternatives")
    apply_mission_submission(
        self.startup,
        alternatives,
        {
            "alternatives": ["Planilha", "Caderno"],
            "limitations": "Exigem conferência manual e perdem histórico.",
            "opportunity": "Centralizar o estoque e alertar compras duplicadas.",
        },
    )
    value = self.startup.missions.get(key="reframe_value_proposition")
    apply_mission_submission(
        self.startup,
        value,
        {
            "audience": "Restaurantes pequenos com estoque manual",
            "problem": "Compras duplicadas reduzem a margem",
            "outcome": "Comprar apenas o necessário com confiança",
            "value_proposition": "Ajuda restaurantes pequenos a evitar compras duplicadas com alertas simples.",
        },
    )

    differentiators = self.startup.journey_steps.get(key=Startup.Stage.DIFFERENTIATORS)
    validation = self.startup.journey_steps.get(key=Startup.Stage.VALIDATION)
    self.assertEqual(differentiators.status, JourneyStep.Status.DONE)
    self.assertEqual(validation.status, JourneyStep.Status.CURRENT)
```

Adicionar também uma regressão de XP: com Problema e Público concluídos, concluir a missão de Valor
deve preservar os `200` XP fundacionais e somar apenas os eventos reais da missão/evidência. Não pode
aparecer um terceiro crédito automático de `100` XP pela mudança do `JourneyStep`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.tests.JourneyApiTests startups.test_mission_engine.MissionCatalogTests
```

Expected: FAIL porque a API ainda conclui diretamente e alternativas não reconciliam a etapa.

- [ ] **Step 3: Reject direct completion and simplify the PATCH path**

Depois de ler o JSON em `journey_step`:

```python
if payload.get("complete"):
    return _error_response(
        "Conclua o trabalho pela missao relacionada a este marco.",
        status=409,
    )
```

Remover o bloco que altera `status`, `completed_at`, próxima etapa e `ActivityEvent`. Manter somente
validação de etapa bloqueada, resposta vazia, atualização da resposta e sincronização de problema e
público.

- [ ] **Step 4: Map alternatives to differentiators and reconcile completed missions**

Alterar `_alternatives_map()`:

```python
return SubmissionResult(
    title="Alternativas atuais mapeadas",
    summary=opportunity,
    details={"alternatives": alternatives, "limitations": limitations, "opportunity": opportunity},
    journey_key=Startup.Stage.DIFFERENTIATORS,
    journey_answer=opportunity,
    complete_journey_step=True,
)
```

Em `journey_service.py`, implementar loop limitado às associações aprovadas:

```python
COMPLETION_MISSION_BY_STEP = {
    Startup.Stage.VALUE: "reframe_value_proposition",
    Startup.Stage.DIFFERENTIATORS: "map_current_alternatives",
}

@transaction.atomic
def reconcile_completed_journey_missions(startup):
    changed = False
    while True:
        current = startup.journey_steps.select_for_update().filter(status=JourneyStep.Status.CURRENT).order_by("order").first()
        mission_key = COMPLETION_MISSION_BY_STEP.get(current.key) if current else None
        mission = startup.missions.filter(key=mission_key, status=Mission.Status.COMPLETED).first() if mission_key else None
        if not current or not mission:
            return changed
        _complete_current_step(startup, current)
        changed = True
```

Implementar `_complete_current_step()` de forma explícita: salvar o marco atual como `done` com
`completed_at=timezone.now()`, selecionar por ordem somente o primeiro `pending` posterior, torná-lo
`current` e atualizar `Startup.current_stage`. Se não houver próximo marco, manter `current_stage` no
último concluído. O helper não cria `ActivityEvent` e não concede XP.

Chamar a reconciliação após
`complete_mission_record()` e antes de montar o payload da Jornada para corrigir estados legados.

Em `_build_account_progress()`, descontar de `total_done * XP_PER_STEP` apenas os marcos concluídos que
possuem missão de conclusão também concluída (`reframe_value_proposition`/Valor e
`map_current_alternatives`/Diferenciais). Assim os `200` XP fundacionais existentes são preservados,
enquanto os marcos guiados por missão não duplicam a recompensa já registrada em `ActivityEvent`.

- [ ] **Step 5: Run mission/Journey regressions**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_journey_service startups.test_mission_engine startups.tests.JourneyApiTests
```

Expected: PASS; nenhuma recompensa ou atividade duplicada.

- [ ] **Step 6: Commit mission-driven progress**

```powershell
git add apps/backend/startups/journey_service.py apps/backend/startups/mission_submissions.py apps/backend/startups/views.py apps/backend/startups/test_journey_service.py apps/backend/startups/test_mission_engine.py apps/backend/startups/tests.py
git commit -m "feat: vincula progresso da jornada as missoes"
```

---

### Task 4: Definir os contratos e rotas do frontend

**Files:**

- Modify: `apps/frontend/src/lib/startup-types.ts:72-121`
- Modify: `apps/frontend/src/lib/startup-navigation.ts:1-28`
- Modify: `apps/frontend/src/lib/startup-navigation.test.ts`

**Interfaces:**

- Produces: `JourneyChapterSummary`, `JourneyMilestoneSummary`, `JourneyStrategicItem` e `JourneyMissionSummary`.
- Produces: `startupJourneyMapHref(startupId, field?)`.
- Changes: `MissionCardSummary.estimatedMinutes` passa a ser obrigatório no cliente.

- [ ] **Step 1: Write failing navigation tests**

```typescript
expect(startupJourneyMapHref(9)).toBe("/painel/startup/9/jornada?view=map");
expect(startupJourneyMapHref(9, "initialGoal")).toBe(
  "/painel/startup/9/jornada?view=map&field=initialGoal"
);
```

- [ ] **Step 2: Run navigation tests and confirm RED**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/lib/startup-navigation.test.ts
```

Expected: FAIL porque `startupJourneyMapHref` não existe.

- [ ] **Step 3: Add exact TypeScript contracts**

```typescript
export type JourneyChapterStatus = "done" | "current" | "locked";

export interface JourneyChapterSummary {
  key: "foundation" | "proposal" | "validation" | "construction";
  title: string;
  question: string;
  status: JourneyChapterStatus;
  completedSteps: number;
  totalSteps: 2;
  steps: JourneyStepSummary[];
}

export interface JourneyMissionSummary {
  key: string;
  title: string;
  objective: string;
  href: string;
  estimatedMinutes: number;
  xpReward: number;
  status: MissionStatus;
  canContinue: boolean;
}

export interface JourneyMilestoneSummary {
  key: string;
  chapterKey: JourneyChapterSummary["key"];
  title: string;
  description: string;
  alreadyBuilt: JourneyStrategicItem[];
  nextUnlock: { title: string; description: string } | null;
  mission: JourneyMissionSummary | null;
  message: string | null;
}

export interface JourneyStrategicItem {
  key: string;
  label: string;
  value: string;
  field: "problem" | "audience" | null;
}
```

Ampliar `JourneyPayload` com `chapters`, `currentMilestone` e `strategicSummary`.
Adicionar `estimatedMinutes: number` a `MissionCardSummary` e atualizar as factories/fixtures tipadas
afetadas nos testes de Home, central de missões, detalhe e painel de foco com valores coerentes.

- [ ] **Step 4: Implement the map URL helper**

```typescript
export function startupJourneyMapHref(startupId: number, field?: string) {
  const params = new URLSearchParams({ view: "map" });
  if (field) params.set("field", field);
  return `${startupJourneyHref(startupId)}?${params.toString()}`;
}
```

- [ ] **Step 5: Run type/navigation tests**

```powershell
cd apps/frontend
npm.cmd test -- --run src/lib/startup-navigation.test.ts
npx.cmd tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 6: Commit the frontend contracts**

```powershell
git add apps/frontend/src/lib/startup-types.ts apps/frontend/src/lib/startup-navigation.ts apps/frontend/src/lib/startup-navigation.test.ts
git commit -m "feat: define contrato frontend da jornada"
```

---

### Task 5: Construir mapa, marco e resumo estratégico

**Files:**

- Create: `apps/frontend/src/components/journey/journey-chapter-map.tsx`
- Create: `apps/frontend/src/components/journey/journey-chapter-map.test.tsx`
- Create: `apps/frontend/src/components/journey/journey-milestone-panel.tsx`
- Create: `apps/frontend/src/components/journey/journey-milestone-panel.test.tsx`
- Modify: `apps/frontend/src/components/journey/journey-workspace.tsx`
- Modify: `apps/frontend/src/components/journey/journey-workspace.test.tsx`

**Interfaces:**

- Produces: `JourneyChapterMap({ chapters, selectedStepKey, onSelectStep })`.
- Produces: `JourneyMilestonePanel({ milestone, onReviewField })`.
- Produces: `JourneyWorkspace({ chapters, currentMilestone, strategicSummary, selectedStepKey, onSelectStep, onReviewField })`.

- [ ] **Step 1: Write failing semantic component tests**

O mapa deve afirmar:

```typescript
expect(screen.getByRole("list", { name: "Mapa da evolução" })).toBeInTheDocument();
expect(screen.getByText("Proposta").closest("li")).toHaveAttribute("aria-current", "step");
expect(screen.getByText("Validação").closest("li")).toHaveAttribute("aria-disabled", "true");
```

O painel deve afirmar:

```typescript
expect(screen.getByRole("link", { name: "Continuar missão" })).toHaveAttribute(
  "href",
  "/painel/startup/7/missoes/reframe_value_proposition"
);
expect(screen.getByText("+100 XP")).toBeInTheDocument();
```

Para `mission=null`, deve mostrar a mensagem aprovada e não renderizar link de missão.

- [ ] **Step 2: Run component tests and confirm RED**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey/journey-chapter-map.test.tsx src/components/journey/journey-milestone-panel.test.tsx
```

Expected: FAIL porque os componentes não existem.

- [ ] **Step 3: Implement the semantic chapter map**

Estrutura mínima:

```tsx
<ol aria-label="Mapa da evolução" className={styles.chapterTrack}>
  {chapters.map((chapter) => (
    <li
      aria-current={chapter.status === "current" ? "step" : undefined}
      aria-disabled={chapter.status === "locked" ? "true" : undefined}
      className={styles.chapter}
      data-status={chapter.status}
      key={chapter.key}
    >
      <span className={styles.chapterNode} aria-hidden="true" />
      <strong>{chapter.title}</strong>
      <span>{chapter.steps.map((step) => step.title).join(" · ")}</span>
    </li>
  ))}
</ol>
```

Etapas concluídas e atual são botões; futuras são texto indisponível. Não usar `div` clicável.

- [ ] **Step 4: Implement milestone and workspace composition**

CTA:

```tsx
{milestone.mission?.canContinue ? (
  <Link className={styles.primaryButton} href={milestone.mission.href}>
    Continuar missão
  </Link>
) : milestone.mission ? (
  <Link className={styles.secondaryButton} href={milestone.mission.href}>
    Consultar missão
  </Link>
) : (
  <p className={styles.unavailableMessage}>{milestone.message}</p>
)}
```

O resumo estratégico usa `<dl>` e mostra `Revisar registro` apenas quando `field` não é `null`.

- [ ] **Step 5: Run component and integration tests**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey/journey-chapter-map.test.tsx src/components/journey/journey-milestone-panel.test.tsx src/components/journey/journey-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the journey components**

```powershell
git add apps/frontend/src/components/journey/journey-chapter-map.tsx apps/frontend/src/components/journey/journey-chapter-map.test.tsx apps/frontend/src/components/journey/journey-milestone-panel.tsx apps/frontend/src/components/journey/journey-milestone-panel.test.tsx apps/frontend/src/components/journey/journey-workspace.tsx apps/frontend/src/components/journey/journey-workspace.test.tsx
git commit -m "feat: cria mapa e marco da jornada"
```

---

### Task 6: Integrar a nova Jornada e o Mapa da startup

**Files:**

- Modify: `apps/frontend/src/components/journey/startup-journey-screen.tsx`
- Modify: `apps/frontend/src/components/journey/startup-journey-screen.test.tsx`
- Modify: `apps/frontend/src/components/journey/startup-map-summary.tsx`
- Modify: `apps/frontend/src/components/journey/startup-map-summary.test.tsx`

**Interfaces:**

- Consumes: `JourneyWorkspace` da Task 5.
- Produces: visão `journey` padrão e visão `map` via `useSearchParams()`.
- Produces: `StartupMapSummary.initialField?: StartupMapField | null`.

- [ ] **Step 1: Replace old tab/form tests with failing approved-flow tests**

Cobrir:

```typescript
expect(await screen.findByRole("heading", { name: "Visão estratégica" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: /Por que essa startup merece existir/ })).toBeInTheDocument();
expect(screen.queryByRole("button", { name: "Concluir etapa" })).not.toBeInTheDocument();
expect(screen.getByRole("link", { name: "Continuar missão" })).toBeInTheDocument();
```

Mockar `useSearchParams()` para `view=map&field=problem` e afirmar `Mapa da startup` mais foco no
textbox `Problema`.

- [ ] **Step 2: Run screen/map tests and confirm RED**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey/startup-journey-screen.test.tsx src/components/journey/startup-map-summary.test.tsx
```

Expected: FAIL porque a tela ainda usa abas e editor de etapa.

- [ ] **Step 3: Remove direct journey mutation and drive the approved composition**

Remover `patchJourneyStep`, `isSavingStep`, celebração local e navegação por abas. Manter:

```tsx
const searchParams = useSearchParams();
const view = searchParams.get("view") === "map" ? "map" : "journey";
const requestedField = parseStartupMapField(searchParams.get("field"));

if (view === "map") {
  return (
    <StartupMapSummary
      initialField={requestedField}
      isSaving={isSavingField}
      onSaveField={patchStartup}
      startup={payload.startup}
    />
  );
}
```

O cabeçalho usa `Visão estratégica`; o botão `Abrir Mapa da startup` chama
`router.replace(startupJourneyMapHref(startupId))`. `Revisar registro` usa o mesmo helper com campo.

- [ ] **Step 4: Add focused map editing**

Em `StartupMapSummary`:

```tsx
useLayoutEffect(() => {
  if (initialField && !initialFieldApplied.current) {
    initialFieldApplied.current = true;
    openEditor(initialField);
  }
}, [initialField]);
```

Renomear título para `Mapa da startup`; preservar Escape, retorno de foco, erro local e PATCH atual.

- [ ] **Step 5: Add stable skeleton and retry behavior**

Loading mantém quatro blocos com `aria-busy="true"`; erro preserva cabeçalho da Jornada e botão
`Tentar novamente`. Não criar `<main>` aninhado no shell.

- [ ] **Step 6: Run the Journey frontend suite**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey
npx.cmd tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 7: Commit the integrated screen**

```powershell
git add apps/frontend/src/components/journey/startup-journey-screen.tsx apps/frontend/src/components/journey/startup-journey-screen.test.tsx apps/frontend/src/components/journey/startup-map-summary.tsx apps/frontend/src/components/journey/startup-map-summary.test.tsx
git commit -m "feat: integra mapa de capitulos na jornada"
```

---

### Task 7: Aplicar linguagem visual, responsividade e acessibilidade

**Files:**

- Modify: `apps/frontend/src/components/journey/startup-journey-screen.module.css`
- Create: `apps/frontend/src/components/journey/startup-journey-screen.theme.test.ts`
- Modify: testes dos componentes da Jornada quando necessário para nomes acessíveis.

**Interfaces:**

- Consumes: classes CSS usadas nas Tasks 5 e 6.
- Produces: rota horizontal desktop e vertical móvel.

- [ ] **Step 1: Write the failing CSS contract test**

```typescript
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.join(__dirname, "startup-journey-screen.module.css"), "utf8");

describe("journey visual contract", () => {
  it("reserves amber for current/action and teal for completion", () => {
    expect(css).toContain("#f2a51a");
    expect(css).toContain("#35c68a");
    expect(css).toMatch(/\[data-status=["']current["']\]/);
    expect(css).toMatch(/\[data-status=["']done["']\]/);
  });

  it("turns the chapter route vertical without horizontal overflow", () => {
    expect(css).toContain("@media (max-width: 820px)");
    expect(css).toMatch(/\.chapterTrack[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  it("honors reduced motion", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
```

- [ ] **Step 2: Run the theme test and confirm RED**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey/startup-journey-screen.theme.test.ts
```

Expected: FAIL porque as novas classes/estados não estão estilizados.

- [ ] **Step 3: Implement the approved desktop composition**

Usar as superfícies do shell e a hierarquia aprovada:

```css
.chapterTrack {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.chapter[data-status="current"] .chapterNode {
  border-color: #f2a51a;
  background: #f2a51a;
}

.chapter[data-status="done"] .chapterNode {
  border-color: #35c68a;
  background: #35c68a;
}

.journeyWorkspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.75fr);
  gap: 18px;
}
```

- [ ] **Step 4: Implement mobile and motion rules**

```css
@media (max-width: 820px) {
  .chapterTrack,
  .journeyWorkspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .chapterTrack::before {
    top: 18px;
    bottom: 18px;
    left: 19px;
    width: 2px;
    height: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .celebration,
  .loadingMark {
    animation: none;
  }
}
```

Garantir `min-width: 0`, wrapping, foco visível e controles com `min-height: 44px`.

- [ ] **Step 5: Run Journey tests, lint and TypeScript**

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/journey
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 6: Commit the visual system**

```powershell
git add apps/frontend/src/components/journey/startup-journey-screen.module.css apps/frontend/src/components/journey/startup-journey-screen.theme.test.ts apps/frontend/src/components/journey/*.test.tsx
git commit -m "style: aplica mapa de capitulos da jornada"
```

---

### Task 8: Validar o fluxo completo e sincronizar a documentação

**Files:**

- Modify: `README.md`
- Modify: `Documentação/arquitetura-missoes.md`
- Modify: `Documentação/funcionalidades.md`
- Modify: `Documentação/fluxos.md`
- Modify: `Documentação/telas.md`
- Modify: `Documentação/progresso.md`
- Modify: `Documentação/proximos-passos.md`
- Modify: `Documentação/handoff.md`

**Interfaces:**

- Consumes: implementação e evidências das Tasks 1 a 7.
- Produces: estado documental marcado como implementado apenas se toda a verificação passar.

- [ ] **Step 1: Run the full backend verification**

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts startups
```

Expected: nenhuma migration pendente, check sem problemas e todos os testes PASS.

- [ ] **Step 2: Run the full frontend verification**

```powershell
cd apps/frontend
npm.cmd test -- --maxWorkers=1
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
npm.cmd run build
```

Expected: todos os testes, lint, TypeScript e build PASS.

- [ ] **Step 3: Validate the browser flow**

Com backend e frontend locais:

1. abrir uma startup com valor atual;
2. confirmar quatro capítulos, Proposta atual e CTA para `reframe_value_proposition`;
3. abrir e concluir a missão, retornar e confirmar avanço;
4. abrir `Mapa da startup`, revisar Problema e confirmar que XP/progresso não mudam;
5. confirmar mensagem honesta em etapa sem missão;
6. validar `1280 x 720`, `1366 x 768`, `1536 x 720`, `1920 x 900` e `390 x 844`;
7. confirmar ausência de overflow horizontal, foco visível e trilha vertical móvel.

Expected: comportamento igual ao design aprovado.

- [ ] **Step 4: Update documentation with measured evidence**

Em cada documento, registrar:

- Mapa de Capítulos implementado;
- quatro capítulos derivados das oito etapas;
- progresso vindo das Missões;
- Mapa da startup como visão secundária;
- comandos e contagens reais da verificação;
- data e viewports efetivamente inspecionados.

Não copiar contagens previstas; usar somente a saída dos Steps 1 a 3.

- [ ] **Step 5: Verify documentation and commit**

```powershell
git diff --check
git status --short
git add README.md Documentação/arquitetura-missoes.md Documentação/funcionalidades.md Documentação/fluxos.md Documentação/telas.md Documentação/progresso.md Documentação/proximos-passos.md Documentação/handoff.md
git diff --cached --check
git commit -m "docs: registra mapa de capitulos implementado"
```

Expected: `apps/frontend/next-env.d.ts` continua fora do commit.

---

## Final acceptance checklist

- [ ] Quatro capítulos derivam exatamente oito etapas.
- [ ] Apenas um capítulo aparece como atual.
- [ ] Não existe `Concluir etapa` na Jornada.
- [ ] `complete: true` recebe HTTP 409 sem alterar progresso.
- [ ] Valor e Diferenciais avançam por missões concluídas.
- [ ] Missão paralela concluída antes do marco é reconciliada sem XP duplicado.
- [ ] Etapa sem missão mostra mensagem e nenhum CTA falso.
- [ ] `Revisar registro` não altera XP ou status.
- [ ] Mapa da startup abre por `?view=map&field=<campo>` com foco correto.
- [ ] Loading, vazio, erro e retry preservam o shell.
- [ ] Desktop horizontal e móvel vertical não têm overflow.
- [ ] Teclado, leitor de tela e movimento reduzido estão cobertos.
- [ ] Suite backend, suite frontend, lint, TypeScript e build passam.
- [ ] Documentação distingue aprovado, implementado e futuro.
- [ ] Mudança pré-existente em `apps/frontend/next-env.d.ts` permanece preservada.
