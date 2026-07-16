# Motor de Missões 2.0 — Incremento 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o primeiro incremento funcional do Motor de Missões 2.0, com catálogo versionado, dependências e recomendação determinística, missões 1 a 5 operacionais e a Central de missão ativa no workspace.

**Architecture:** O Django continua como fonte de verdade e passa a separar definição versionada, instância persistida, avaliação e submissão. O catálogo curado vive em módulo próprio; o motor sincroniza instâncias sem sobrescrever missões iniciadas/concluídas, reconcilia pré-requisitos e escolhe uma recomendação explicável. O Next.js recebe contratos próprios para Central e detalhe, preserva a Home atual como execução da missão de entrevistas e usa uma tela dedicada para os entregáveis estruturados das missões 2 a 5.

**Tech Stack:** Django 5.2, PostgreSQL/SQLite de testes, Python 3.12+, Next.js 16.2 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library e validação visual no navegador local.

## Global Constraints

- este plano implementa somente o Incremento 1; missões 6 a 10, Experimentos, Decisões e Gestão semanal ficam fora;
- o catálogo ativo neste incremento contém exatamente as missões 1 a 5; não exibir cartões falsos para as missões posteriores;
- o backend escolhe a missão recomendada; o frontend nunca recalcula prioridade;
- uma missão iniciada ou concluída preserva a versão com a qual começou;
- sincronização, conclusão, XP e desbloqueio precisam ser idempotentes;
- uma startup nunca pode ler ou alterar missão/evidência de outra conta;
- Home e Central devem apresentar a mesma recomendação e o mesmo progresso;
- a Home aprovada não será redesenhada neste ciclo;
- a missão 1 continua sendo executada pela Home; missões 2 a 5 usam detalhe próprio;
- se `Também disponível` estiver vazio, a seção não é renderizada;
- âmbar indica prioridade/ação, teal indica conclusão e cinza acompanhado de texto indica bloqueio;
- não adicionar biblioteca visual, DRF, gerador de formulários ou inteligência artificial;
- rolagem permanece somente na área de conteúdo do workspace;
- validar `1280 x 720`, `1366 x 768`, `1536 x 720` e `1920 x 900` sem overflow horizontal;
- foco visível, navegação por teclado, semântica de progresso e `prefers-reduced-motion` são obrigatórios;
- preservar a alteração não relacionada já existente em `apps/frontend/next-env.d.ts` e não incluí-la nos commits deste plano;
- cada tarefa termina com testes verdes e commit contendo somente os arquivos listados na tarefa.

---

## File structure

### Backend domain

- `apps/backend/startups/models.py`: campos de snapshot da definição e evidência genérica.
- `apps/backend/startups/migrations/0007_mission_catalog_v2.py`: migração compatível com os dados atuais.
- `apps/backend/startups/mission_catalog.py`: definições imutáveis das missões 1 a 5 e validação do grafo.
- `apps/backend/startups/mission_engine.py`: sincronização, reconciliação, avaliação, recomendação e conclusão.
- `apps/backend/startups/mission_submissions.py`: validação e aplicação dos entregáveis das missões 2 a 5.
- `apps/backend/startups/mission_serializers.py`: contratos de card, detalhe, evidência e Central.
- `apps/backend/startups/views.py`: autenticação, parsing HTTP e chamadas aos serviços.
- `apps/backend/startups/urls.py`: Central, detalhe e submissão.
- `apps/backend/startups/test_mission_engine.py`: catálogo, versionamento, grafo, avaliação e recomendação.
- `apps/backend/startups/test_mission_api_v2.py`: Central, detalhe, submissões, autorização e idempotência.
- `apps/backend/startups/tests.py`: regressões da missão de entrevistas e do payload `today`.

### Frontend contracts and routes

- `apps/frontend/src/lib/startup-types.ts`: tipos de card, detalhe e Central.
- `apps/frontend/src/lib/startup-navigation.ts`: rotas da Central e do detalhe.
- `apps/frontend/src/app/api/startups/[startupId]/missions/route.ts`: proxy GET da Central.
- `apps/frontend/src/app/api/startups/[startupId]/missions/[missionKey]/route.ts`: proxy GET do detalhe.
- `apps/frontend/src/app/api/startups/[startupId]/missions/[missionKey]/submission/route.ts`: proxy POST do entregável.
- `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/missoes/page.tsx`: rota da Central.
- `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/missoes/[missionKey]/page.tsx`: rota de execução das missões 2 a 5.

### Frontend components

- `apps/frontend/src/components/missions/startup-missions-route-screen.tsx`: integração da Central com o workspace.
- `apps/frontend/src/components/missions/mission-center-screen.tsx`: carregamento, erro, foco, alternativas e trilha.
- `apps/frontend/src/components/missions/mission-center-screen.module.css`: layout da opção A aprovada.
- `apps/frontend/src/components/missions/startup-mission-route-screen.tsx`: integração do detalhe com o workspace.
- `apps/frontend/src/components/missions/mission-detail-screen.tsx`: leitura e submissão do entregável.
- `apps/frontend/src/components/missions/mission-detail-screen.module.css`: layout do detalhe.
- testes `.test.tsx` ao lado de cada componente.
- `apps/frontend/src/components/workspace/workspace-sidebar.tsx`: habilita Missões.
- `apps/frontend/src/components/workspace/workspace-shell.tsx`: identifica a seção `missions` em ambas as rotas.

### Documentation

- `Documentação/arquitetura-missoes.md`, `funcionalidades.md`, `fluxos.md`, `telas.md`, `progresso.md`, `proximos-passos.md` e `handoff.md`: estado realmente entregue e validações.

---

### Task 1: Persistir snapshots do catálogo e evidências genéricas

**Files:**

- Modify: `apps/backend/startups/models.py:94-183`
- Create: `apps/backend/startups/migrations/0007_mission_catalog_v2.py`
- Create: `apps/backend/startups/test_mission_engine.py`

**Interfaces:**

- Produces: `Mission.Origin`, `Mission.ActionType` e `Mission.CompletionRule`.
- Produces: campos `definition_version`, `origin`, `is_required`, `priority`, `prerequisite_keys`, `action_type`, `completion_rule`, `requirement_config` e `step_blueprint`.
- Produces: `MissionEvidence.title`, `summary`, `details` e `submission_key`.
- Produces: constraint `unique_submission_key_per_mission` somente quando `submission_key != ""`.
- Produces: `ActivityEvent.Kind.EVIDENCE_RECORDED`.

- [ ] **Step 1: Write the failing model contract tests**

Criar `apps/backend/startups/test_mission_engine.py`:

```python
from django.test import TestCase

from .models import ActivityEvent, Mission, MissionEvidence


class MissionSchemaTests(TestCase):
    def test_mission_has_catalog_snapshot_fields(self):
        field_names = {field.name for field in Mission._meta.get_fields()}

        self.assertTrue(
            {
                "definition_version",
                "origin",
                "is_required",
                "priority",
                "prerequisite_keys",
                "action_type",
                "completion_rule",
                "requirement_config",
                "step_blueprint",
            }.issubset(field_names)
        )

    def test_evidence_has_generic_submission_fields(self):
        field_names = {field.name for field in MissionEvidence._meta.get_fields()}

        self.assertTrue({"title", "summary", "details", "submission_key"}.issubset(field_names))

    def test_activity_supports_generic_evidence_event(self):
        self.assertIn("evidence_recorded", ActivityEvent.Kind.values)
```

- [ ] **Step 2: Run the tests and verify the schema is missing**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionSchemaTests
```

Expected: FAIL because the new fields and `EVIDENCE_RECORDED` do not exist.

- [ ] **Step 3: Add the model fields and conditional constraint**

Em `Mission`, adicionar as choices e campos abaixo antes de `status`:

```python
class Origin(models.TextChoices):
    CATALOG = "catalog", "Catalogo"
    DYNAMIC = "dynamic", "Dinamica"


class ActionType(models.TextChoices):
    INTERVIEWS = "interviews", "Entrevistas"
    PROBLEM_REFINEMENT = "problem_refinement", "Refinamento do problema"
    AUDIENCE_VALIDATION = "audience_validation", "Validacao do publico"
    VALUE_PROPOSITION = "value_proposition", "Proposta de valor"
    ALTERNATIVES_MAP = "alternatives_map", "Mapa de alternativas"


class CompletionRule(models.TextChoices):
    INTERVIEWS_AND_LEARNING = "interviews_learning", "Entrevistas e aprendizado"
    PRIMARY_SUBMISSION = "primary_submission", "Entregavel principal"


definition_version = models.PositiveSmallIntegerField(default=1)
origin = models.CharField(max_length=20, choices=Origin.choices, default=Origin.CATALOG)
is_required = models.BooleanField(default=True)
priority = models.PositiveSmallIntegerField(default=100)
prerequisite_keys = models.JSONField(default=list, blank=True)
action_type = models.CharField(
    max_length=30,
    choices=ActionType.choices,
    default=ActionType.INTERVIEWS,
)
completion_rule = models.CharField(
    max_length=30,
    choices=CompletionRule.choices,
    default=CompletionRule.INTERVIEWS_AND_LEARNING,
)
requirement_config = models.JSONField(default=dict, blank=True)
step_blueprint = models.JSONField(default=list, blank=True)
```

Em `MissionEvidence`, tornar `interviewee_name` e `notes` compatíveis com evidência não entrevista e
adicionar os campos genéricos:

```python
title = models.CharField(max_length=180, blank=True, default="")
summary = models.TextField(blank=True, default="")
details = models.JSONField(default=dict, blank=True)
submission_key = models.CharField(max_length=80, blank=True, default="")
interviewee_name = models.CharField(max_length=120, blank=True, default="")
notes = models.TextField(blank=True, default="")
```

Adicionar à `Meta.constraints` de `MissionEvidence`:

```python
models.UniqueConstraint(
    fields=["mission", "submission_key"],
    condition=models.Q(submission_key__gt=""),
    name="unique_submission_key_per_mission",
)
```

Adicionar a `ActivityEvent.Kind`:

```python
EVIDENCE_RECORDED = "evidence_recorded", "Evidencia registrada"
```

- [ ] **Step 4: Generate and inspect the migration**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations startups --name mission_catalog_v2
.\.venv\Scripts\python.exe manage.py sqlmigrate startups 0007
```

Expected: criar `0007_mission_catalog_v2.py`, adicionar somente os campos/constraint acima e não
remover dados das migrations anteriores.

- [ ] **Step 5: Run model and migration checks**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionSchemaTests
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py migrate
```

Expected: 3 tests PASS, `No changes detected` e migration aplicada.

- [ ] **Step 6: Commit the schema**

```powershell
git add apps/backend/startups/models.py apps/backend/startups/migrations/0007_mission_catalog_v2.py apps/backend/startups/test_mission_engine.py
git commit -m "feat: prepara dominio para catalogo de missoes"
```

---

### Task 2: Criar o catálogo versionado e sincronização segura

**Files:**

- Create: `apps/backend/startups/mission_catalog.py`
- Create: `apps/backend/startups/mission_engine.py`
- Modify: `apps/backend/startups/models.py:266-329`
- Modify: `apps/backend/startups/test_mission_engine.py`

**Interfaces:**

- Produces: `CATALOG_VERSION = 2`.
- Produces: `MISSION_DEFINITIONS: tuple[MissionDefinition, ...]` com chaves 1 a 5.
- Produces: `validate_catalog(definitions) -> None` que rejeita chave duplicada, dependência ausente e ciclo.
- Produces: `sync_mission_catalog(startup: Startup) -> list[Mission]`.
- Produces: `reconcile_mission_states(startup: Startup) -> list[Mission]`.
- Replaces: `models.ensure_missions` e `models.MISSION_BLUEPRINTS`.

- [ ] **Step 1: Add failing catalog and compatibility tests**

Acrescentar a `apps/backend/startups/test_mission_engine.py`:

```python
from django.contrib.auth import get_user_model

from .mission_catalog import MISSION_DEFINITIONS, MissionDefinition, validate_catalog
from .mission_engine import sync_mission_catalog
from .models import Mission, Startup

User = get_user_model()


class MissionCatalogTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="catalog@example.com", password="123")
        self.startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

    def test_catalog_contains_the_five_approved_discovery_missions(self):
        self.assertEqual(
            [definition.key for definition in MISSION_DEFINITIONS],
            [
                "customer_interviews_5",
                "refine_problem_with_evidence",
                "validate_priority_audience",
                "reframe_value_proposition",
                "map_current_alternatives",
            ],
        )

    def test_sync_creates_five_missions_with_real_dependencies(self):
        missions = sync_mission_catalog(self.startup)

        self.assertEqual(len(missions), 5)
        by_key = {mission.key: mission for mission in missions}
        self.assertEqual(by_key["customer_interviews_5"].status, Mission.Status.AVAILABLE)
        self.assertEqual(by_key["refine_problem_with_evidence"].status, Mission.Status.LOCKED)
        self.assertEqual(by_key["validate_priority_audience"].status, Mission.Status.LOCKED)
        self.assertEqual(
            by_key["reframe_value_proposition"].prerequisite_keys,
            ["validate_priority_audience"],
        )
        self.assertEqual(
            by_key["map_current_alternatives"].prerequisite_keys,
            ["validate_priority_audience"],
        )

    def test_sync_preserves_started_mission_snapshot(self):
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        mission.status = Mission.Status.IN_PROGRESS
        mission.title = "Titulo preservado"
        mission.definition_version = 1
        mission.save()

        sync_mission_catalog(self.startup)
        mission.refresh_from_db()

        self.assertEqual(mission.title, "Titulo preservado")
        self.assertEqual(mission.definition_version, 1)

    def test_catalog_rejects_a_dependency_cycle(self):
        first = MissionDefinition.minimal("first", prerequisites=("second",))
        second = MissionDefinition.minimal("second", prerequisites=("first",))

        with self.assertRaisesMessage(ValueError, "ciclo"):
            validate_catalog((first, second))
```

- [ ] **Step 2: Run tests and verify imports fail**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionCatalogTests
```

Expected: FAIL because `mission_catalog` and `mission_engine` do not exist.

- [ ] **Step 3: Create the complete catalog module**

Criar `apps/backend/startups/mission_catalog.py` com uma dataclass congelada, `snapshot()` que retorna
valores serializáveis e cinco definições. Usar exatamente estes metadados de progressão:

```python
from dataclasses import dataclass

from .models import Mission

CATALOG_VERSION = 2


@dataclass(frozen=True)
class MissionDefinition:
    key: str
    version: int
    mission_type: str
    phase: str
    title: str
    objective: str
    why_it_matters: str
    instructions: tuple[str, ...]
    completion_criteria: str
    contextual_tip: str
    required_evidence_count: int
    xp_reward: int
    order: int
    priority: int
    prerequisites: tuple[str, ...]
    action_type: str
    completion_rule: str
    requirement_config: dict
    steps: tuple[dict, ...]
    is_required: bool = True

    @classmethod
    def minimal(cls, key: str, prerequisites: tuple[str, ...] = ()):
        return cls(
            key=key,
            version=CATALOG_VERSION,
            mission_type=Mission.Type.MAIN,
            phase="Teste",
            title=key,
            objective=key,
            why_it_matters=key,
            instructions=(key,),
            completion_criteria=key,
            contextual_tip="",
            required_evidence_count=1,
            xp_reward=0,
            order=0,
            priority=100,
            prerequisites=prerequisites,
            action_type=Mission.ActionType.PROBLEM_REFINEMENT,
            completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
            requirement_config={"submissionKey": "primary"},
            steps=({"key": "submit", "title": key, "description": key},),
        )

    def snapshot(self):
        return {
            "definition_version": self.version,
            "origin": Mission.Origin.CATALOG,
            "mission_type": self.mission_type,
            "phase": self.phase,
            "title": self.title,
            "objective": self.objective,
            "why_it_matters": self.why_it_matters,
            "instructions": list(self.instructions),
            "completion_criteria": self.completion_criteria,
            "contextual_tip": self.contextual_tip,
            "required_evidence_count": self.required_evidence_count,
            "xp_reward": self.xp_reward,
            "order": self.order,
            "priority": self.priority,
            "prerequisite_keys": list(self.prerequisites),
            "action_type": self.action_type,
            "completion_rule": self.completion_rule,
            "requirement_config": self.requirement_config,
            "step_blueprint": list(self.steps),
            "is_required": self.is_required,
        }
```

As cinco entradas devem usar ordens `10, 20, 30, 40, 50`, prioridades iguais a `100`, os XP
`150, 100, 120, 100, 100` e estes contratos:

```python
MISSION_DEFINITIONS = (
    MissionDefinition(
        key="customer_interviews_5",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Converse com 5 potenciais clientes",
        objective="Entender como o problema acontece na vida real antes de definir a solução.",
        why_it_matters="Conversas reais substituem suposições por evidências.",
        instructions=(
            "Prepare um roteiro curto com perguntas sobre situações reais do passado.",
            "Converse com cinco pessoas do público inicial sem apresentar sua solução.",
            "Registre cada entrevista e resuma os padrões encontrados.",
        ),
        completion_criteria="Registrar cinco entrevistas e uma síntese de aprendizado.",
        contextual_tip="Pergunte sobre situações reais do passado, sem vender a solução.",
        required_evidence_count=5,
        xp_reward=150,
        order=10,
        priority=100,
        prerequisites=(),
        action_type=Mission.ActionType.INTERVIEWS,
        completion_rule=Mission.CompletionRule.INTERVIEWS_AND_LEARNING,
        requirement_config={"evidenceType": "interview", "minimum": 5, "learning": True},
        steps=(
            {"key": "prepare", "title": "Prepare o roteiro", "description": "Defina perguntas sobre fatos do passado."},
            {"key": "interviews", "title": "Registre 5 entrevistas", "description": "Documente cada conversa."},
            {"key": "learning", "title": "Resuma os padrões", "description": "Transforme relatos em aprendizado."},
        ),
    ),
    MissionDefinition(
        key="refine_problem_with_evidence",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Refine o problema com evidências",
        objective="Reescrever o problema usando os padrões encontrados nas entrevistas.",
        why_it_matters="Um problema específico e observado reduz o risco de construir para uma suposição.",
        instructions=("Revise os padrões.", "Escreva o problema sem citar a solução.", "Explique quais evidências sustentam o recorte."),
        completion_criteria="Registrar o problema refinado e a síntese das evidências.",
        contextual_tip="Descreva quem sofre, em qual situação e qual consequência aparece.",
        required_evidence_count=1,
        xp_reward=100,
        order=20,
        priority=100,
        prerequisites=("customer_interviews_5",),
        action_type=Mission.ActionType.PROBLEM_REFINEMENT,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Refine o problema", "description": "Conecte a formulação às entrevistas."},),
    ),
    MissionDefinition(
        key="validate_priority_audience",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Valide o público prioritário",
        objective="Escolher o primeiro público com base nos sinais observados.",
        why_it_matters="Um recorte inicial claro melhora entrevistas, proposta e experimentos.",
        instructions=("Compare os perfis entrevistados.", "Identifique onde a dor foi mais frequente.", "Decida manter ou ajustar o público."),
        completion_criteria="Registrar público, sinais observados e decisão.",
        contextual_tip="Prefira um grupo pequeno e alcançável a uma categoria ampla.",
        required_evidence_count=1,
        xp_reward=120,
        order=30,
        priority=100,
        prerequisites=("refine_problem_with_evidence",),
        action_type=Mission.ActionType.AUDIENCE_VALIDATION,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Defina o público prioritário", "description": "Registre sinais e a decisão."},),
    ),
    MissionDefinition(
        key="reframe_value_proposition",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Proposta",
        title="Reformule a proposta de valor",
        objective="Conectar público, problema e resultado esperado em uma promessa clara.",
        why_it_matters="A proposta orienta o que será testado sem antecipar um produto grande.",
        instructions=("Use o público validado.", "Nomeie o problema prioritário.", "Descreva o resultado esperado."),
        completion_criteria="Registrar proposta de valor e justificativa baseada nas evidências.",
        contextual_tip="Explique o valor antes de listar funcionalidades.",
        required_evidence_count=1,
        xp_reward=100,
        order=40,
        priority=100,
        prerequisites=("validate_priority_audience",),
        action_type=Mission.ActionType.VALUE_PROPOSITION,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Formule a promessa central", "description": "Conecte público, dor e resultado."},),
    ),
    MissionDefinition(
        key="map_current_alternatives",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Proposta",
        title="Mapeie as alternativas atuais",
        objective="Entender como o público resolve o problema hoje e onde as opções falham.",
        why_it_matters="A startup compete também com planilhas, improvisos e a decisão de não agir.",
        instructions=("Liste alternativas citadas.", "Registre limitações observadas.", "Descreva a oportunidade de diferenciação."),
        completion_criteria="Registrar alternativas, limitações e oportunidade.",
        contextual_tip="Inclua soluções manuais e o comportamento de não fazer nada.",
        required_evidence_count=1,
        xp_reward=100,
        order=50,
        priority=100,
        prerequisites=("validate_priority_audience",),
        action_type=Mission.ActionType.ALTERNATIVES_MAP,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Compare as alternativas", "description": "Registre opções, falhas e oportunidade."},),
    ),
)
```

Implementar `validate_catalog()` e chamá-la no final do módulo:

```python
def validate_catalog(definitions):
    by_key = {}
    for definition in definitions:
        if definition.key in by_key:
            raise ValueError(f"Chave de missao duplicada: {definition.key}")
        by_key[definition.key] = definition

    for definition in definitions:
        missing = [key for key in definition.prerequisites if key not in by_key]
        if missing:
            raise ValueError(f"Pre-requisito ausente em {definition.key}: {', '.join(missing)}")

    state = {}

    def visit(key, path):
        if state.get(key) == "visited":
            return
        if state.get(key) == "visiting":
            cycle = " -> ".join([*path, key])
            raise ValueError(f"Catalogo de missoes possui ciclo: {cycle}")
        state[key] = "visiting"
        for prerequisite in by_key[key].prerequisites:
            visit(prerequisite, [*path, key])
        state[key] = "visited"

    for key in by_key:
        visit(key, [])


validate_catalog(MISSION_DEFINITIONS)
```

- [ ] **Step 4: Implement safe synchronization and reconciliation**

Criar `mission_engine.py`. `sync_mission_catalog()` deve:

1. criar cada instância com `status=LOCKED` nos defaults;
2. atualizar o snapshot somente quando `started_at is None`, `completed_at is None` e status é
   `LOCKED` ou `AVAILABLE`;
3. preservar qualquer missão `IN_PROGRESS` ou `COMPLETED`;
4. chamar `reconcile_mission_states()`;
5. retornar as instâncias ordenadas.

`reconcile_mission_states()` deve usar o seguinte núcleo:

```python
def reconcile_mission_states(startup):
    missions = list(startup.missions.order_by("order", "key"))
    by_key = {mission.key: mission for mission in missions}

    for mission in missions:
        if mission.status in {Mission.Status.IN_PROGRESS, Mission.Status.COMPLETED}:
            continue
        prerequisites_complete = all(
            by_key.get(key) is not None and by_key[key].status == Mission.Status.COMPLETED
            for key in mission.prerequisite_keys
        )
        desired = Mission.Status.AVAILABLE if prerequisites_complete else Mission.Status.LOCKED
        if mission.status != desired:
            mission.status = desired
            mission.save(update_fields=["status", "updated_at"])

    return list(startup.missions.order_by("order", "key"))
```

`sync_mission_catalog()` deve ser implementado por completo assim:

```python
def sync_mission_catalog(startup):
    for definition in MISSION_DEFINITIONS:
        snapshot = definition.snapshot()
        mission, created = Mission.objects.get_or_create(
            startup=startup,
            key=definition.key,
            defaults={**snapshot, "status": Mission.Status.LOCKED},
        )
        may_refresh_snapshot = (
            not created
            and mission.started_at is None
            and mission.completed_at is None
            and mission.status in {Mission.Status.LOCKED, Mission.Status.AVAILABLE}
        )
        if may_refresh_snapshot:
            changed = []
            for field, value in snapshot.items():
                if getattr(mission, field) != value:
                    setattr(mission, field, value)
                    changed.append(field)
            if changed:
                mission.save(update_fields=[*changed, "updated_at"])

    return reconcile_mission_states(startup)
```

Remover `MISSION_BLUEPRINTS` e `ensure_missions` de `models.py`. Trocar imports/calls existentes em
`views.py` por `sync_mission_catalog` somente na Task 3, para que este commit ainda possa ser revisado
isoladamente sem misturar camada HTTP.

- [ ] **Step 5: Run catalog tests**

Executar:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine
```

Expected: schema e catálogo PASS.

- [ ] **Step 6: Commit catalog and engine foundation**

```powershell
git add apps/backend/startups/models.py apps/backend/startups/mission_catalog.py apps/backend/startups/mission_engine.py apps/backend/startups/test_mission_engine.py
git commit -m "feat: adiciona catalogo versionado de missoes"
```

---

### Task 3: Avaliar, recomendar e concluir missões pelo motor

**Files:**

- Modify: `apps/backend/startups/mission_engine.py`
- Create: `apps/backend/startups/mission_serializers.py`
- Modify: `apps/backend/startups/views.py:18-26, 534-664, 690-739, 771-1018`
- Modify: `apps/backend/startups/tests.py:645-835`
- Modify: `apps/backend/startups/test_mission_engine.py`

**Interfaces:**

- Produces: `MissionEvaluation(progress, requirements, steps, can_add_learning, can_complete)`.
- Produces: `evaluate_mission(mission: Mission) -> MissionEvaluation`.
- Produces: `select_recommended_mission(startup: Startup) -> Mission | None`.
- Produces: `recommendation_reason(mission: Mission) -> str`.
- Produces: `complete_mission_record(mission: Mission) -> tuple[Mission, bool]`.
- Produces: `serialize_mission_card()` e `serialize_mission_detail()`.

- [ ] **Step 1: Add failing evaluation, recommendation and unlock tests**

Acrescentar a `MissionCatalogTests`:

```python
from .mission_engine import (
    complete_mission_record,
    evaluate_mission,
    recommendation_reason,
    select_recommended_mission,
)
from .models import ActivityEvent, Learning, MissionEvidence


def test_recommendation_prefers_in_progress_over_available(self):
    sync_mission_catalog(self.startup)
    first = self.startup.missions.get(key="customer_interviews_5")
    second = self.startup.missions.get(key="refine_problem_with_evidence")
    first.status = Mission.Status.IN_PROGRESS
    first.save(update_fields=["status", "updated_at"])
    second.status = Mission.Status.AVAILABLE
    second.save(update_fields=["status", "updated_at"])

    recommended = select_recommended_mission(self.startup)

    self.assertEqual(recommended.key, "customer_interviews_5")
    self.assertIn("continue", recommendation_reason(recommended).lower())


def test_interview_evaluation_requires_five_interviews_and_learning(self):
    sync_mission_catalog(self.startup)
    mission = self.startup.missions.get(key="customer_interviews_5")
    for number in range(5):
        MissionEvidence.objects.create(
            mission=mission,
            evidence_type=MissionEvidence.Type.INTERVIEW,
            interviewee_name=f"Pessoa {number}",
            notes="Relato suficientemente detalhado para a entrevista.",
        )
    Learning.objects.create(
        startup=self.startup,
        mission=mission,
        content="Padrao encontrado",
        impact="Impacto na proposta",
        next_action="Refinar o problema",
    )

    evaluation = evaluate_mission(mission)

    self.assertEqual(evaluation.progress, 100)
    self.assertTrue(evaluation.can_complete)


def test_completion_unlocks_only_satisfied_dependents_and_is_idempotent(self):
    sync_mission_catalog(self.startup)
    mission = self.startup.missions.get(key="customer_interviews_5")
    for number in range(5):
        MissionEvidence.objects.create(
            mission=mission,
            evidence_type=MissionEvidence.Type.INTERVIEW,
            interviewee_name=f"Pessoa {number}",
            notes="Relato suficientemente detalhado para a entrevista.",
        )
    Learning.objects.create(
        startup=self.startup,
        mission=mission,
        content="Padrao encontrado",
        impact="Impacto na proposta",
        next_action="Refinar o problema",
    )

    _, completed_now = complete_mission_record(mission)
    _, completed_again = complete_mission_record(mission)

    second = self.startup.missions.get(key="refine_problem_with_evidence")
    third = self.startup.missions.get(key="validate_priority_audience")
    self.assertTrue(completed_now)
    self.assertFalse(completed_again)
    self.assertEqual(second.status, Mission.Status.AVAILABLE)
    self.assertEqual(third.status, Mission.Status.LOCKED)
    self.assertEqual(
        ActivityEvent.objects.filter(kind=ActivityEvent.Kind.MISSION_COMPLETED).count(),
        1,
    )
```

- [ ] **Step 2: Run tests and verify engine functions are absent**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionCatalogTests
```

Expected: FAIL on missing imports.

- [ ] **Step 3: Implement evaluation and deterministic selection**

Adicionar a `mission_engine.py`:

```python
from dataclasses import dataclass
from django.db import transaction
from django.utils import timezone

from .models import ActivityEvent, Learning, Mission


@dataclass(frozen=True)
class MissionEvaluation:
    progress: int
    requirements: list[dict]
    steps: list[dict]
    can_add_learning: bool
    can_complete: bool


class MissionRuleError(ValueError):
    pass
```

Implementar a avaliação completa:

```python
def evaluate_mission(mission):
    is_completed = mission.status == Mission.Status.COMPLETED
    if mission.completion_rule == Mission.CompletionRule.INTERVIEWS_AND_LEARNING:
        evidence_count = mission.evidences.filter(
            evidence_type="interview"
        ).count()
        learning_complete = mission.learnings.exists()
        interviews_complete = evidence_count >= mission.required_evidence_count
        total_units = max(mission.required_evidence_count, 1) + 1
        completed_units = min(evidence_count, mission.required_evidence_count) + int(
            learning_complete
        )
        steps = [
            {
                "key": "prepare",
                "title": "Prepare o roteiro",
                "description": "Use perguntas sobre situações reais do passado.",
                "status": "completed" if evidence_count > 0 or is_completed else "current",
            },
            {
                "key": "interviews",
                "title": f"Registre {mission.required_evidence_count} entrevistas",
                "description": f"{evidence_count} de {mission.required_evidence_count} entrevistas concluídas",
                "status": "completed" if interviews_complete else "current" if evidence_count else "available",
            },
            {
                "key": "learning",
                "title": "Resuma os padrões",
                "description": "Síntese registrada" if learning_complete else "Disponível após registrar as entrevistas",
                "status": "completed" if learning_complete else "available" if interviews_complete else "locked",
            },
        ]
        return MissionEvaluation(
            progress=round((completed_units / total_units) * 100),
            requirements=[
                {
                    "key": "interviews",
                    "label": f"{mission.required_evidence_count} entrevistas registradas",
                    "current": evidence_count,
                    "target": mission.required_evidence_count,
                    "completed": interviews_complete,
                },
                {
                    "key": "learning",
                    "label": "Síntese de aprendizado registrada",
                    "current": int(learning_complete),
                    "target": 1,
                    "completed": learning_complete,
                },
            ],
            steps=steps,
            can_add_learning=interviews_complete and not learning_complete and not is_completed,
            can_complete=interviews_complete and learning_complete and not is_completed,
        )

    if mission.completion_rule == Mission.CompletionRule.PRIMARY_SUBMISSION:
        has_submission = mission.evidences.filter(submission_key="primary").exists()
        steps = [
            {
                **step,
                "status": "completed" if has_submission or is_completed else "current",
            }
            for step in mission.step_blueprint
        ]
        return MissionEvaluation(
            progress=100 if has_submission or is_completed else 0,
            requirements=[
                {
                    "key": "submission",
                    "label": "Entregável principal registrado",
                    "current": int(has_submission),
                    "target": 1,
                    "completed": has_submission,
                }
            ],
            steps=steps,
            can_add_learning=False,
            can_complete=has_submission and not is_completed,
        )

    raise MissionRuleError(f"Regra de conclusao desconhecida: {mission.completion_rule}")
```

Seleção determinística:

```python
def select_recommended_mission(startup):
    sync_mission_catalog(startup)
    ordered = startup.missions.order_by("priority", "order", "key")
    return (
        ordered.filter(status=Mission.Status.IN_PROGRESS).first()
        or ordered.filter(status=Mission.Status.AVAILABLE, is_required=True).first()
        or ordered.filter(status=Mission.Status.AVAILABLE).first()
    )


def recommendation_reason(mission):
    if mission.status == Mission.Status.IN_PROGRESS:
        return "Continue esta missão porque ela já está em andamento."
    if mission.prerequisite_keys:
        return "Esta é a próxima etapa liberada pela sua trilha."
    return "Comece por evidências reais antes de avançar para a solução."
```

Conclusão deve travar a linha, reavaliar requisitos, criar o evento e reconciliar dependentes:

```python
@transaction.atomic
def complete_mission_record(mission):
    mission = Mission.objects.select_for_update().get(pk=mission.pk)
    if mission.status == Mission.Status.COMPLETED:
        return mission, False
    if mission.status == Mission.Status.LOCKED:
        raise MissionRuleError("Essa missão ainda está bloqueada.")

    evaluation = evaluate_mission(mission)
    if not evaluation.can_complete:
        raise MissionRuleError("A missão ainda precisa de evidências antes de ser concluída.")

    mission.status = Mission.Status.COMPLETED
    mission.completed_at = timezone.now()
    mission.save(update_fields=["status", "completed_at", "updated_at"])
    ActivityEvent.objects.get_or_create(
        startup=mission.startup,
        dedupe_key=f"mission_completed:{mission.pk}",
        defaults={
            "kind": ActivityEvent.Kind.MISSION_COMPLETED,
            "description": f"Missão concluída: {mission.title}",
            "xp_awarded": mission.xp_reward,
            "metadata": {"missionKey": mission.key},
        },
    )
    reconcile_mission_states(mission.startup)
    return mission, True
```

- [ ] **Step 4: Extract mission serialization without changing the public Today contract**

Criar `mission_serializers.py` com:

```python
from .mission_engine import evaluate_mission
from .models import Mission


TYPE_LABELS = {
    Mission.Type.MAIN: "Missão principal",
    Mission.Type.WEEKLY: "Missão semanal",
    Mission.Type.QUICK: "Tarefa rápida",
    Mission.Type.EXPERIMENT: "Experimento",
    Mission.Type.LEARNING: "Aprendizado",
    Mission.Type.MANAGEMENT: "Gestão recorrente",
}


def serialize_evidence(evidence):
    return {
        "id": evidence.pk,
        "type": evidence.evidence_type,
        "title": evidence.title,
        "summary": evidence.summary,
        "details": evidence.details,
        "intervieweeName": evidence.interviewee_name,
        "intervieweeProfile": evidence.interviewee_profile,
        "context": evidence.context,
        "notes": evidence.notes,
        "occurredOn": evidence.occurred_on.isoformat(),
        "createdAt": evidence.created_at.isoformat(),
    }


def serialize_learning(learning):
    if learning is None:
        return None
    return {
        "id": learning.pk,
        "content": learning.content,
        "impact": learning.impact,
        "nextAction": learning.next_action,
        "confidence": learning.confidence,
        "confidenceLabel": learning.get_confidence_display(),
        "createdAt": learning.created_at.isoformat(),
        "updatedAt": learning.updated_at.isoformat(),
    }


def locked_reasons(mission, by_key):
    return [
        f"Conclua: {by_key[key].title}"
        for key in mission.prerequisite_keys
        if key in by_key and by_key[key].status != Mission.Status.COMPLETED
    ]


def serialize_mission_card(mission, *, by_key, reason=None):
    evaluation = evaluate_mission(mission)
    return {
        "key": mission.key,
        "definitionVersion": mission.definition_version,
        "origin": mission.origin,
        "type": mission.mission_type,
        "typeLabel": TYPE_LABELS.get(mission.mission_type, mission.get_mission_type_display()),
        "phase": mission.phase,
        "title": mission.title,
        "objective": mission.objective,
        "xpReward": mission.xp_reward,
        "status": mission.status,
        "statusLabel": mission.get_status_display(),
        "progress": evaluation.progress,
        "actionType": mission.action_type,
        "isRequired": mission.is_required,
        "order": mission.order,
        "priority": mission.priority,
        "prerequisiteKeys": mission.prerequisite_keys,
        "lockedReasons": locked_reasons(mission, by_key),
        "recommendationReason": reason,
        "completedAt": mission.completed_at.isoformat() if mission.completed_at else None,
    }


def serialize_mission_detail(mission, *, by_key, reason=None):
    card = serialize_mission_card(mission, by_key=by_key, reason=reason)
    evaluation = evaluate_mission(mission)
    learning = mission.learnings.first()
    return {
        **card,
        "whyItMatters": mission.why_it_matters,
        "instructions": mission.instructions,
        "completionCriteria": mission.completion_criteria,
        "contextualTip": mission.contextual_tip,
        "requiredEvidenceCount": mission.required_evidence_count,
        "evidenceCount": mission.evidences.count(),
        "canAddLearning": evaluation.can_add_learning,
        "canComplete": evaluation.can_complete,
        "requirements": evaluation.requirements,
        "steps": evaluation.steps,
        "evidences": [serialize_evidence(item) for item in mission.evidences.all()],
        "learning": serialize_learning(learning),
    }
```

- [ ] **Step 5: Refactor Today and complete endpoint to use the motor**

Em `views.py`:

- importar `sync_mission_catalog`, `select_recommended_mission`, `recommendation_reason` e
  `complete_mission_record`;
- importar `serialize_mission_detail`;
- remover `_serialize_evidence`, `_serialize_learning` e `_serialize_mission`;
- em `_today_payload`, sincronizar catálogo, selecionar a recomendada e serializá-la com o mesmo
  `by_key` usado pela Central;
- adicionar `missionState` como `active`, `arc_complete` ou `unavailable`; usar `arc_complete` quando
  todas as cinco instâncias estiverem concluídas;
- substituir `nextUnlock` fixo pela primeira missão dependente da recomendada, com `available`
  derivado do status real; se o arco acabou, retornar título `Próxima trilha` e descrição
  `A próxima trilha ainda não foi liberada.` sem marcar disponibilidade;
- em `complete_mission`, usar `complete_mission_record`; converter `MissionRuleError` em 409 com o
  detalhe serializado;
- preservar mensagens e o contrato do frontend atual, mas preencher `celebration.unlocked` com o
  título da próxima missão realmente recomendada, ou `Arco concluido` quando não houver outra.

Atualizar `test_today_seeds_a_real_mission` para esperar cinco instâncias e adicionar:

```python
self.assertEqual(payload["mission"]["recommendationReason"], "Comece por evidências reais antes de avançar para a solução.")
self.assertEqual(Mission.objects.filter(startup=self.startup).count(), 5)
```

Atualizar `test_complete_mission_awards_reward_and_unlocks_next_step`: o payload reconciliado deve
mostrar `refine_problem_with_evidence` com status `available`, enquanto a celebração continua
concedendo 150 XP uma única vez:

```python
self.assertEqual(payload["mission"]["key"], "refine_problem_with_evidence")
self.assertEqual(payload["mission"]["status"], "available")
self.assertEqual(payload["celebration"]["xpAwarded"], 150)
self.assertEqual(payload["celebration"]["unlocked"], "Refine o problema com evidências")
```

Remover a asserção antiga que esperava a missão de entrevistas concluída no campo `mission`; essa
missão permanece no histórico da Central, mas a Home já recebe o próximo foco.

- [ ] **Step 6: Run all mission regressions**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine startups.tests.MissionApiTests
```

Expected: catálogo, recomendação, entrevistas, aprendizado, XP e conclusão PASS.

- [ ] **Step 7: Commit the engine integration**

```powershell
git add apps/backend/startups/mission_engine.py apps/backend/startups/mission_serializers.py apps/backend/startups/views.py apps/backend/startups/test_mission_engine.py apps/backend/startups/tests.py
git commit -m "feat: recomenda e conclui missoes pelo motor"
```

---

### Task 4: Implementar entregáveis das missões de problema e público

**Files:**

- Create: `apps/backend/startups/mission_submissions.py`
- Modify: `apps/backend/startups/mission_engine.py`
- Modify: `apps/backend/startups/test_mission_engine.py`

**Interfaces:**

- Produces: `SubmissionValidationError(message, field_errors)`.
- Produces: `SubmissionResult(title, summary, details, journey_key, journey_answer)`.
- Produces: `apply_mission_submission(startup, mission, payload) -> SubmissionMutation`.
- Produces: `SubmissionMutation(mission, evidence, evidence_created, completed_now)`.
- Awards: 25 XP uma única vez pelo primeiro entregável genérico e o XP da missão na conclusão.

- [ ] **Step 1: Write failing domain tests for missions 2 and 3**

Acrescentar a `MissionCatalogTests`:

```python
from .mission_submissions import SubmissionValidationError, apply_mission_submission
from .models import JourneyStep


def complete_prerequisites(self, *keys):
    sync_mission_catalog(self.startup)
    self.startup.missions.filter(key__in=keys).update(
        status=Mission.Status.COMPLETED,
        completed_at=timezone.now(),
    )
    reconcile_mission_states(self.startup)


def test_problem_submission_updates_startup_journey_and_unlocks_audience(self):
    self.complete_prerequisites("customer_interviews_5")
    mission = self.startup.missions.get(key="refine_problem_with_evidence")

    mutation = apply_mission_submission(
        self.startup,
        mission,
        {
            "problemStatement": "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
            "evidenceSummary": "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
        },
    )

    self.startup.refresh_from_db()
    problem_step = self.startup.journey_steps.get(key=Startup.Stage.PROBLEM)
    audience_mission = self.startup.missions.get(key="validate_priority_audience")
    self.assertTrue(mutation.completed_now)
    self.assertEqual(mutation.evidence.submission_key, "primary")
    self.assertEqual(self.startup.problem, mutation.evidence.details["problemStatement"])
    self.assertEqual(problem_step.answer, self.startup.problem)
    self.assertEqual(audience_mission.status, Mission.Status.AVAILABLE)


def test_problem_submission_rejects_shallow_content(self):
    self.complete_prerequisites("customer_interviews_5")
    mission = self.startup.missions.get(key="refine_problem_with_evidence")

    with self.assertRaises(SubmissionValidationError) as caught:
        apply_mission_submission(
            self.startup,
            mission,
            {"problemStatement": "Problema curto", "evidenceSummary": "Pouca evidencia"},
        )

    self.assertIn("problemStatement", caught.exception.field_errors)
    self.assertIn("evidenceSummary", caught.exception.field_errors)
    self.assertFalse(mission.evidences.exists())


def test_audience_submission_updates_audience_and_records_decision(self):
    self.complete_prerequisites("customer_interviews_5", "refine_problem_with_evidence")
    mission = self.startup.missions.get(key="validate_priority_audience")

    mutation = apply_mission_submission(
        self.startup,
        mission,
        {
            "audienceStatement": "Donos de restaurantes independentes com uma unidade e controle manual de estoque.",
            "observedSignals": "O grupo relatou perda semanal, decide as compras e consegue testar uma rotina nova rapidamente.",
            "decision": "adjust",
        },
    )

    self.startup.refresh_from_db()
    audience_step = self.startup.journey_steps.get(key=Startup.Stage.AUDIENCE)
    self.assertEqual(self.startup.audience, mutation.evidence.details["audienceStatement"])
    self.assertEqual(audience_step.answer, self.startup.audience)
    self.assertEqual(mutation.evidence.details["decision"], "adjust")
    self.assertEqual(mutation.mission.status, Mission.Status.COMPLETED)
```

Adicionar `from django.utils import timezone` e importar `reconcile_mission_states` no topo do teste.

- [ ] **Step 2: Run tests and verify the submission service is missing**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionCatalogTests
```

Expected: FAIL on missing `mission_submissions`.

- [ ] **Step 3: Create validation types and exact field rules**

Criar `mission_submissions.py` com:

```python
from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

from .mission_engine import complete_mission_record, reconcile_mission_states
from .models import ActivityEvent, JourneyStep, Mission, MissionEvidence, Startup, ensure_journey

XP_PER_GENERIC_EVIDENCE = 25


class SubmissionValidationError(ValueError):
    def __init__(self, message, field_errors=None):
        super().__init__(message)
        self.message = message
        self.field_errors = field_errors or {}


@dataclass(frozen=True)
class SubmissionResult:
    title: str
    summary: str
    details: dict
    journey_key: str | None = None
    journey_answer: str = ""
    complete_journey_step: bool = False


@dataclass(frozen=True)
class SubmissionMutation:
    mission: Mission
    evidence: MissionEvidence
    evidence_created: bool
    completed_now: bool


def _required_text(payload, key, *, minimum, label, field_errors):
    value = (payload.get(key) or "").strip()
    if len(value) < minimum:
        field_errors[key] = [f"{label} deve ter pelo menos {minimum} caracteres."]
    return value
```

Implementar validadores completos:

```python
def _problem_refinement(payload):
    errors = {}
    problem = _required_text(payload, "problemStatement", minimum=40, label="O problema", field_errors=errors)
    evidence = _required_text(payload, "evidenceSummary", minimum=40, label="A síntese das evidências", field_errors=errors)
    if errors:
        raise SubmissionValidationError("Revise o problema refinado.", errors)
    return SubmissionResult(
        title="Problema refinado",
        summary=evidence,
        details={"problemStatement": problem, "evidenceSummary": evidence},
        journey_key=Startup.Stage.PROBLEM,
        journey_answer=problem,
    )


def _audience_validation(payload):
    errors = {}
    audience = _required_text(payload, "audienceStatement", minimum=30, label="O público prioritário", field_errors=errors)
    signals = _required_text(payload, "observedSignals", minimum=40, label="Os sinais observados", field_errors=errors)
    decision = (payload.get("decision") or "").strip()
    if decision not in {"keep", "adjust"}:
        errors["decision"] = ["Escolha manter ou ajustar o público."]
    if errors:
        raise SubmissionValidationError("Revise a validação do público.", errors)
    return SubmissionResult(
        title="Público prioritário validado",
        summary=signals,
        details={"audienceStatement": audience, "observedSignals": signals, "decision": decision},
        journey_key=Startup.Stage.AUDIENCE,
        journey_answer=audience,
    )
```

Criar o registry:

```python
VALIDATORS = {
    Mission.ActionType.PROBLEM_REFINEMENT: _problem_refinement,
    Mission.ActionType.AUDIENCE_VALIDATION: _audience_validation,
}
```

- [ ] **Step 4: Apply generic evidence, meaningful activity and completion atomically**

Implementar:

```python
def _update_journey(startup, result):
    if result.journey_key is None:
        return
    ensure_journey(startup)
    step = startup.journey_steps.select_for_update().get(key=result.journey_key)
    step.answer = result.journey_answer
    step.save(update_fields=["answer", "updated_at"])

    startup_field = {
        Startup.Stage.PROBLEM: "problem",
        Startup.Stage.AUDIENCE: "audience",
    }.get(result.journey_key)
    if startup_field:
        setattr(startup, startup_field, result.journey_answer)
        startup.save(update_fields=[startup_field, "updated_at"])


@transaction.atomic
def apply_mission_submission(startup, mission, payload):
    mission = Mission.objects.select_for_update().get(pk=mission.pk, startup=startup)
    existing = mission.evidences.filter(submission_key="primary").first()
    if mission.status == Mission.Status.COMPLETED and existing:
        return SubmissionMutation(mission, existing, False, False)
    if mission.status == Mission.Status.LOCKED:
        raise SubmissionValidationError("Essa missão ainda está bloqueada.")
    if mission.action_type not in VALIDATORS:
        raise SubmissionValidationError("Essa missão não aceita este tipo de entrega.")

    result = VALIDATORS[mission.action_type](payload)
    _update_journey(startup, result)
    evidence, created = MissionEvidence.objects.update_or_create(
        mission=mission,
        submission_key="primary",
        defaults={
            "evidence_type": MissionEvidence.Type.DOCUMENT,
            "title": result.title,
            "summary": result.summary,
            "details": result.details,
            "notes": result.summary,
            "occurred_on": timezone.localdate(),
        },
    )
    if created:
        ActivityEvent.objects.get_or_create(
            startup=startup,
            dedupe_key=f"mission_submission:{mission.pk}:primary",
            defaults={
                "kind": ActivityEvent.Kind.EVIDENCE_RECORDED,
                "description": f"Entregável registrado: {mission.title}",
                "xp_awarded": XP_PER_GENERIC_EVIDENCE,
                "metadata": {"missionKey": mission.key, "evidenceId": evidence.pk},
            },
        )
    if mission.started_at is None:
        mission.started_at = timezone.now()
        mission.status = Mission.Status.IN_PROGRESS
        mission.save(update_fields=["started_at", "status", "updated_at"])

    mission, completed_now = complete_mission_record(mission)
    reconcile_mission_states(startup)
    return SubmissionMutation(mission, evidence, created, completed_now)
```

- [ ] **Step 5: Run domain tests and full backend regressions**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine
.\.venv\Scripts\python.exe manage.py test accounts startups
```

Expected: all tests PASS; missions 2 e 3 update Startup/Journey and unlock only real dependents.

- [ ] **Step 6: Commit problem and audience submissions**

```powershell
git add apps/backend/startups/mission_submissions.py apps/backend/startups/mission_engine.py apps/backend/startups/test_mission_engine.py
git commit -m "feat: operacionaliza missoes de problema e publico"
```

---

### Task 5: Operacionalizar proposta de valor e mapa de alternativas

**Files:**

- Modify: `apps/backend/startups/mission_submissions.py`
- Modify: `apps/backend/startups/test_mission_engine.py`

**Interfaces:**

- Extends: `VALIDATORS` com `VALUE_PROPOSITION` e `ALTERNATIVES_MAP`.
- Extends: `_update_journey()` para concluir apenas a etapa que estiver `CURRENT`.
- Preserves: etapa já concluída pode ser revisada sem reabrir ou duplicar XP.
- Preserves: o mapa de alternativas vira evidência da missão, sem concluir `Diferenciais` por engano.
- Produces: missão 4 recomendada e missão 5 disponível em paralelo após a missão 3.

- [ ] **Step 1: Write failing tests for parallel availability and Journey synchronization**

Acrescentar:

```python
def test_audience_completion_releases_value_and_alternatives_in_parallel(self):
    self.complete_prerequisites(
        "customer_interviews_5",
        "refine_problem_with_evidence",
        "validate_priority_audience",
    )

    value = self.startup.missions.get(key="reframe_value_proposition")
    alternatives = self.startup.missions.get(key="map_current_alternatives")
    self.assertEqual(value.status, Mission.Status.AVAILABLE)
    self.assertEqual(alternatives.status, Mission.Status.AVAILABLE)
    self.assertEqual(select_recommended_mission(self.startup).key, value.key)


def test_value_submission_updates_and_completes_current_value_step(self):
    self.complete_prerequisites(
        "customer_interviews_5",
        "refine_problem_with_evidence",
        "validate_priority_audience",
    )
    mission = self.startup.missions.get(key="reframe_value_proposition")

    mutation = apply_mission_submission(
        self.startup,
        mission,
        {
            "valueProposition": "Ajudamos restaurantes independentes a enxergar o estoque antes de comprar e reduzir perdas semanais.",
            "rationale": "A promessa combina o público validado, a compra duplicada e o resultado observado nas entrevistas.",
        },
    )

    value_step = self.startup.journey_steps.get(key=Startup.Stage.VALUE)
    differentiators = self.startup.journey_steps.get(key=Startup.Stage.DIFFERENTIATORS)
    self.assertEqual(value_step.status, JourneyStep.Status.DONE)
    self.assertEqual(differentiators.status, JourneyStep.Status.CURRENT)
    self.assertEqual(value_step.answer, mutation.evidence.details["valueProposition"])


def test_alternatives_submission_does_not_advance_an_unrelated_journey_step(self):
    self.complete_prerequisites(
        "customer_interviews_5",
        "refine_problem_with_evidence",
        "validate_priority_audience",
    )
    ensure_journey(self.startup)
    value_step = self.startup.journey_steps.get(key=Startup.Stage.VALUE)
    differentiators = self.startup.journey_steps.get(key=Startup.Stage.DIFFERENTIATORS)
    mission = self.startup.missions.get(key="map_current_alternatives")

    mutation = apply_mission_submission(
        self.startup,
        mission,
        {
            "alternatives": "Caderno, planilha, memória do comprador e conferência visual feita somente no momento da compra.",
            "limitations": "As alternativas dependem de disciplina manual e não mostram duplicidade antes do pedido ao fornecedor.",
            "opportunity": "Oferecer visibilidade simples e preventiva sem exigir um ERP completo do restaurante.",
        },
    )

    value_step.refresh_from_db()
    differentiators.refresh_from_db()
    self.assertEqual(value_step.status, JourneyStep.Status.CURRENT)
    self.assertEqual(differentiators.status, JourneyStep.Status.PENDING)
    self.assertEqual(differentiators.answer, "")
    self.assertEqual(
        mutation.evidence.details["opportunity"],
        "Oferecer visibilidade simples e preventiva sem exigir um ERP completo do restaurante.",
    )
```

Adicionar `ensure_journey` ao import de `.models` usado por este arquivo de teste.

- [ ] **Step 2: Run tests and verify missing validators fail**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine.MissionCatalogTests
```

Expected: FAIL with `Essa missão não aceita este tipo de entrega.`

- [ ] **Step 3: Add the exact validators**

Adicionar:

```python
def _value_proposition(payload):
    errors = {}
    value = _required_text(payload, "valueProposition", minimum=30, label="A proposta de valor", field_errors=errors)
    rationale = _required_text(payload, "rationale", minimum=30, label="A justificativa", field_errors=errors)
    if errors:
        raise SubmissionValidationError("Revise a proposta de valor.", errors)
    return SubmissionResult(
        title="Proposta de valor reformulada",
        summary=rationale,
        details={"valueProposition": value, "rationale": rationale},
        journey_key=Startup.Stage.VALUE,
        journey_answer=value,
        complete_journey_step=True,
    )


def _alternatives_map(payload):
    errors = {}
    alternatives = _required_text(payload, "alternatives", minimum=40, label="As alternativas", field_errors=errors)
    limitations = _required_text(payload, "limitations", minimum=40, label="As limitações", field_errors=errors)
    opportunity = _required_text(payload, "opportunity", minimum=30, label="A oportunidade", field_errors=errors)
    if errors:
        raise SubmissionValidationError("Revise o mapa de alternativas.", errors)
    return SubmissionResult(
        title="Alternativas atuais mapeadas",
        summary=opportunity,
        details={"alternatives": alternatives, "limitations": limitations, "opportunity": opportunity},
    )


VALIDATORS = {
    Mission.ActionType.PROBLEM_REFINEMENT: _problem_refinement,
    Mission.ActionType.AUDIENCE_VALIDATION: _audience_validation,
    Mission.ActionType.VALUE_PROPOSITION: _value_proposition,
    Mission.ActionType.ALTERNATIVES_MAP: _alternatives_map,
}
```

- [ ] **Step 4: Complete only the current Journey step and open the next one**

Estender `_update_journey()` depois de salvar `answer`:

```python
if result.complete_journey_step and step.status == JourneyStep.Status.CURRENT:
    step.status = JourneyStep.Status.DONE
    step.completed_at = timezone.now()
    step.save(update_fields=["answer", "status", "completed_at", "updated_at"])
    next_step = (
        startup.journey_steps.select_for_update()
        .filter(status=JourneyStep.Status.PENDING)
        .order_by("order")
        .first()
    )
    if next_step:
        next_step.status = JourneyStep.Status.CURRENT
        next_step.save(update_fields=["status", "updated_at"])
        startup.current_stage = next_step.key
        startup.save(update_fields=["current_stage", "updated_at"])
```

Não criar `JOURNEY_STEP_COMPLETED` aqui: o XP da Jornada já deriva do status `DONE`; a ausência de
evento extra evita duplicar sequência/atividade até a política de eventos cruzados ser especificada.

- [ ] **Step 5: Run complete domain regression**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_engine accounts startups
```

Expected: missões 1 a 5 e Jornada PASS; alternativas não avançam uma etapa não equivalente.

- [ ] **Step 6: Commit missions 4 and 5**

```powershell
git add apps/backend/startups/mission_submissions.py apps/backend/startups/test_mission_engine.py
git commit -m "feat: operacionaliza proposta e alternativas"
```

---

### Task 6: Expor Central, detalhe e submissão pela API

**Files:**

- Modify: `apps/backend/startups/mission_serializers.py`
- Modify: `apps/backend/startups/views.py:690-1018`
- Modify: `apps/backend/startups/urls.py:3-35`
- Create: `apps/backend/startups/test_mission_api_v2.py`

**Interfaces:**

- Produces: `GET /api/startups/<id>/missions/`.
- Produces: `GET /api/startups/<id>/missions/<key>/`.
- Produces: `POST /api/startups/<id>/missions/<key>/submission/`.
- Central payload: `{ startup, catalogVersion, arc, recommendedMission, availableMissions, lockedMissions, completedMissions, gamification }`.
- Detail payload: `{ startup, mission, gamification, message?, celebration? }`.

- [ ] **Step 1: Write failing API contract tests**

Criar `test_mission_api_v2.py` com um `TestCase` que cria usuário, token e startup. Incluir:

```python
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from accounts.tokens import issue_auth_token

from .mission_engine import reconcile_mission_states, sync_mission_catalog
from .models import ActivityEvent, Mission, MissionEvidence, Startup

User = get_user_model()


class MissionV2ApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="mission-v2@example.com", password="123")
        self.token = issue_auth_token(self.user)
        self.startup = Startup.objects.create(
            owner=self.user,
            name="Aurora Labs",
            problem="Compra duplicada de ingredientes.",
            audience="Donos de restaurantes pequenos.",
        )
        sync_mission_catalog(self.startup)

    @property
    def auth(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def complete_directly(self, *keys):
        self.startup.missions.filter(key__in=keys).update(
            status=Mission.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        reconcile_mission_states(self.startup)

    def test_center_returns_one_recommendation_and_honest_locked_reasons(self):
        response = self.client.get(f"/api/startups/{self.startup.pk}/missions/", **self.auth)

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["catalogVersion"], 2)
        self.assertEqual(payload["arc"], {"key": "discovery", "title": "Descoberta", "completed": 0, "total": 5, "progress": 0})
        self.assertEqual(payload["recommendedMission"]["key"], "customer_interviews_5")
        self.assertEqual(payload["availableMissions"], [])
        self.assertEqual(len(payload["lockedMissions"]), 4)
        self.assertTrue(payload["lockedMissions"][0]["lockedReasons"])

    def test_center_returns_value_as_focus_and_alternatives_as_available(self):
        self.complete_directly(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )

        response = self.client.get(f"/api/startups/{self.startup.pk}/missions/", **self.auth)
        payload = response.json()

        self.assertEqual(payload["recommendedMission"]["key"], "reframe_value_proposition")
        self.assertEqual(
            [mission["key"] for mission in payload["availableMissions"]],
            ["map_current_alternatives"],
        )

    def test_detail_returns_full_instructions_and_evidence(self):
        response = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/",
            **self.auth,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("instructions", response.json()["mission"])
        self.assertIn("evidences", response.json()["mission"])

    def test_submission_is_idempotent_and_returns_the_next_recommendation(self):
        self.complete_directly("customer_interviews_5")
        url = f"/api/startups/{self.startup.pk}/missions/refine_problem_with_evidence/submission/"
        body = {
            "problemStatement": "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
            "evidenceSummary": "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
        }

        first = self.client.post(url, data=body, content_type="application/json", **self.auth)
        second = self.client.post(url, data=body, content_type="application/json", **self.auth)

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(MissionEvidence.objects.filter(submission_key="primary").count(), 1)
        self.assertEqual(
            ActivityEvent.objects.filter(kind=ActivityEvent.Kind.MISSION_COMPLETED).count(),
            1,
        )
        self.assertEqual(first.json()["nextRecommendedMission"]["key"], "validate_priority_audience")

    def test_another_user_cannot_read_center_or_submit(self):
        other = User.objects.create_user(username="other-v2@example.com", password="123")
        other_token = issue_auth_token(other)
        center = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/",
            HTTP_AUTHORIZATION=f"Bearer {other_token}",
        )
        submission = self.client.post(
            f"/api/startups/{self.startup.pk}/missions/refine_problem_with_evidence/submission/",
            data={},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {other_token}",
        )

        self.assertEqual(center.status_code, 404)
        self.assertEqual(submission.status_code, 404)
```

- [ ] **Step 2: Run tests and verify routes return 404**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_api_v2
```

Expected: FAIL/404 because the routes do not exist.

- [ ] **Step 3: Add center serializer and payload builders**

Adicionar em `mission_serializers.py`:

```python
from .mission_catalog import CATALOG_VERSION
from .mission_engine import recommendation_reason, select_recommended_mission, sync_mission_catalog


def serialize_center_missions(startup):
    missions = sync_mission_catalog(startup)
    by_key = {mission.key: mission for mission in missions}
    recommended = select_recommended_mission(startup)
    cards = {mission.key: serialize_mission_card(mission, by_key=by_key) for mission in missions}
    recommended_card = None
    if recommended:
        recommended_card = serialize_mission_card(
            recommended,
            by_key=by_key,
            reason=recommendation_reason(recommended),
        )
    completed = [mission for mission in missions if mission.status == Mission.Status.COMPLETED]
    available = [
        cards[mission.key]
        for mission in missions
        if mission.status == Mission.Status.AVAILABLE and mission != recommended
    ]
    locked = [cards[mission.key] for mission in missions if mission.status == Mission.Status.LOCKED]
    return {
        "catalogVersion": CATALOG_VERSION,
        "arc": {
            "key": "discovery",
            "title": "Descoberta",
            "completed": len(completed),
            "total": len(missions),
            "progress": round((len(completed) / len(missions)) * 100) if missions else 0,
        },
        "recommendedMission": recommended_card,
        "availableMissions": available,
        "lockedMissions": locked,
        "completedMissions": [cards[mission.key] for mission in completed],
    }
```

Em `views.py`, criar `_mission_center_payload(user, startup)` que combina o resultado acima com
`_serialize_startup(startup)` e `_build_account_progress(_startups_with_journey(user))`.

- [ ] **Step 4: Implement the three authenticated endpoints**

Adicionar imports de `CATALOG_VERSION`, motor, serializers e submissões. Implementar:

```python
def _owned_startup(user, startup_id):
    return Startup.objects.filter(owner=user, pk=startup_id).first()


def _mission_center_payload(user, startup):
    center = serialize_center_missions(startup)
    return {
        "startup": _serialize_startup(startup),
        **center,
        "gamification": _build_account_progress(_startups_with_journey(user)),
    }


@require_GET
def missions(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)
    startup = _owned_startup(user, startup_id)
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)
    return JsonResponse(_mission_center_payload(user, startup))


@require_GET
def mission_detail(request, startup_id, mission_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)
    startup = _owned_startup(user, startup_id)
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)
    sync_mission_catalog(startup)
    by_key = {item.key: item for item in startup.missions.order_by("order", "key")}
    mission = by_key.get(mission_key)
    if mission is None:
        return _error_response("Missao nao encontrada.", status=404)
    recommended = select_recommended_mission(startup)
    reason = recommendation_reason(mission) if recommended and recommended.pk == mission.pk else None
    return JsonResponse(
        {
            "startup": _serialize_startup(startup),
            "mission": serialize_mission_detail(mission, by_key=by_key, reason=reason),
            "gamification": _build_account_progress(_startups_with_journey(user)),
        }
    )


@csrf_exempt
@require_POST
def mission_submission(request, startup_id, mission_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)
    startup = _owned_startup(user, startup_id)
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)
    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))
    mission = _mission_for_startup(startup, mission_key)
    if mission is None:
        return _error_response("Missao nao encontrada.", status=404)
    try:
        mutation = apply_mission_submission(startup, mission, payload)
    except SubmissionValidationError as error:
        return _error_response(
            error.message,
            status=400 if error.field_errors else 409,
            field_errors=error.field_errors,
        )

    missions_by_key = {item.key: item for item in startup.missions.order_by("order", "key")}
    next_mission = select_recommended_mission(startup)
    response_payload = {
        "startup": _serialize_startup(startup),
        "mission": serialize_mission_detail(mutation.mission, by_key=missions_by_key),
        "nextRecommendedMission": (
            serialize_mission_card(
                next_mission,
                by_key=missions_by_key,
                reason=recommendation_reason(next_mission),
            )
            if next_mission
            else None
        ),
        "gamification": _build_account_progress(_startups_with_journey(user)),
        "message": "Missao concluida." if mutation.completed_now else "Essa missao ja esta concluida.",
    }
    if mutation.completed_now:
        response_payload["celebration"] = {
            "title": "Missao cumprida",
            "xpAwarded": mutation.mission.xp_reward,
            "unlocked": next_mission.title if next_mission else "Arco concluido",
        }
    return JsonResponse(response_payload)
```

Adicionar em `urls.py`:

```python
path("startups/<int:startup_id>/missions/", missions),
path("startups/<int:startup_id>/missions/<str:mission_key>/", mission_detail),
path(
    "startups/<int:startup_id>/missions/<str:mission_key>/submission/",
    mission_submission,
),
```

Manter as rotas `evidence`, `learning` e `complete` mais específicas; a ordem acima deve colocar o
detalhe depois das rotas específicas ou usar patterns sem colisão verificadas pelos testes.

- [ ] **Step 5: Run API and full backend tests**

Run:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.test_mission_api_v2 startups.test_mission_engine startups.tests.MissionApiTests
.\.venv\Scripts\python.exe manage.py check
```

Expected: APIs v2, motor, missão antiga e `check` PASS.

- [ ] **Step 6: Commit the API**

```powershell
git add apps/backend/startups/mission_serializers.py apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/test_mission_api_v2.py
git commit -m "feat: expoe central e detalhe de missoes"
```

---

### Task 7: Adicionar contratos, proxies e navegação de Missões no frontend

**Files:**

- Modify: `apps/frontend/src/lib/startup-types.ts:90-190`
- Modify: `apps/frontend/src/lib/startup-navigation.ts:1-12`
- Modify: `apps/frontend/src/lib/startup-navigation.test.ts`
- Create: `apps/frontend/src/app/api/startups/[startupId]/missions/route.ts`
- Create: `apps/frontend/src/app/api/startups/[startupId]/missions/[missionKey]/route.ts`
- Create: `apps/frontend/src/app/api/startups/[startupId]/missions/[missionKey]/submission/route.ts`
- Modify: `apps/frontend/src/components/workspace/workspace-sidebar.tsx:4-49`
- Modify: `apps/frontend/src/components/workspace/workspace-sidebar.test.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.tsx:19-21`
- Modify: `apps/frontend/src/components/workspace/workspace-shell.test.tsx`
- Modify: `apps/frontend/src/components/home/mission-focus-panel.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.test.tsx`
- Modify: `apps/frontend/src/components/home/mission-focus-panel.test.tsx`

**Interfaces:**

- Produces: `MissionCardSummary`, `MissionDetailSummary`, `MissionCenterPayload` e `MissionDetailPayload`.
- Produces: `startupMissionsHref()`, `startupMissionHref()` e `missionExecutionHref()`.
- Produces: proxies autenticados para leitura e submissão.
- Enables: item `Missões` na sidebar e seção ativa em Central/detalhe.

- [ ] **Step 1: Write failing navigation and sidebar tests**

Atualizar `startup-navigation.test.ts`:

```typescript
import {
  missionExecutionHref,
  resolvePanelDestination,
  startupHomeHref,
  startupMissionHref,
  startupMissionsHref,
} from "./startup-navigation";

it("builds the mission center and detail URLs", () => {
  expect(startupMissionsHref(9)).toBe("/painel/startup/9/missoes");
  expect(startupMissionHref(9, "refine_problem_with_evidence")).toBe(
    "/painel/startup/9/missoes/refine_problem_with_evidence"
  );
});

it("keeps interviews on Home and sends structured missions to detail", () => {
  expect(missionExecutionHref(9, "customer_interviews_5", "interviews")).toBe(
    "/painel/startup/9"
  );
  expect(
    missionExecutionHref(9, "refine_problem_with_evidence", "problem_refinement")
  ).toBe("/painel/startup/9/missoes/refine_problem_with_evidence");
});
```

Em `workspace-sidebar.test.tsx`, substituir o nome do primeiro teste e acrescentar:

```typescript
expect(screen.getByRole("link", { name: "Missoes" })).toHaveAttribute(
  "href",
  "/painel/startup/7/missoes"
);
```

No teste sem startup, alterar `toHaveLength(2)` para `toHaveLength(3)`.

- [ ] **Step 2: Run focused frontend tests and verify failures**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/lib/startup-navigation.test.ts src/components/workspace/workspace-sidebar.test.tsx
```

Expected: FAIL because helpers and link do not exist.

- [ ] **Step 3: Add exact TypeScript contracts**

Em `startup-types.ts`, manter `MissionStatus` e substituir o contrato único de missão por:

```typescript
export type MissionOrigin = "catalog" | "dynamic";
export type MissionActionType =
  | "interviews"
  | "problem_refinement"
  | "audience_validation"
  | "value_proposition"
  | "alternatives_map";

export interface MissionCardSummary {
  key: string;
  definitionVersion: number;
  origin: MissionOrigin;
  type: string;
  typeLabel: string;
  phase: string;
  title: string;
  objective: string;
  xpReward: number;
  status: MissionStatus;
  statusLabel: string;
  progress: number;
  actionType: MissionActionType;
  isRequired: boolean;
  order: number;
  priority: number;
  prerequisiteKeys: string[];
  lockedReasons: string[];
  recommendationReason: string | null;
  completedAt: string | null;
}

export interface MissionEvidenceSummary {
  id: number;
  type: string;
  title: string;
  summary: string;
  details: Record<string, string>;
  intervieweeName: string;
  intervieweeProfile: string;
  context: string;
  notes: string;
  occurredOn: string;
  createdAt: string;
}

export interface MissionDetailSummary extends MissionCardSummary {
  whyItMatters: string;
  instructions: string[];
  completionCriteria: string;
  contextualTip: string;
  requiredEvidenceCount: number;
  evidenceCount: number;
  canAddLearning: boolean;
  canComplete: boolean;
  requirements: MissionRequirement[];
  steps: MissionStepSummary[];
  evidences: MissionEvidenceSummary[];
  learning: MissionLearningSummary | null;
}

// Compatibilidade temporária com os componentes atuais da Home.
export type MissionSummary = MissionDetailSummary;

export interface MissionCenterPayload {
  startup: StartupSummary;
  catalogVersion: number;
  arc: { key: string; title: string; completed: number; total: number; progress: number };
  recommendedMission: MissionCardSummary | null;
  availableMissions: MissionCardSummary[];
  lockedMissions: MissionCardSummary[];
  completedMissions: MissionCardSummary[];
  gamification: AccountProgress;
}

export interface MissionDetailPayload {
  startup: StartupSummary;
  mission: MissionDetailSummary;
  gamification: AccountProgress;
  nextRecommendedMission?: MissionCardSummary | null;
  message?: string;
  celebration?: { title: string; xpAwarded: number; unlocked: string };
}
```

Alterar `TodayPayload.mission` para `MissionDetailSummary | null` e adicionar:

```typescript
missionState: "active" | "arc_complete" | "unavailable";
```

Nos fixtures existentes de Home e `MissionFocusPanel`, adicionar ao objeto de missão:

```typescript
definitionVersion: 2,
origin: "catalog",
actionType: "interviews",
isRequired: true,
order: 10,
priority: 100,
prerequisiteKeys: [],
lockedReasons: [],
recommendationReason: "Comece por evidencias reais.",
```

Adicionar `title: ""`, `summary: ""`, `details: {}` a cada evidência de entrevista existente e
`missionState: "active"` ao fixture `TodayPayload`.

- [ ] **Step 4: Make Home action and copy depend on the recommended mission type**

Em `startup-home-screen.test.tsx`, ampliar o mock atual do router de `{ replace }` para
`{ push, replace }`. Criar uma variação do payload com uma missão estruturada recomendada:

```typescript
const structuredMission = {
  ...payload.mission!,
  key: "refine_problem_with_evidence",
  actionType: "problem_refinement" as const,
  title: "Refine o problema com evidências",
  requiredEvidenceCount: 1,
  evidenceCount: 0,
  requirements: [
    { key: "submission", label: "Formulação refinada registrada", complete: false },
  ],
  steps: [
    { key: "submit", title: "Refine o problema", description: "Conecte a formulação às entrevistas.", status: "current" as const },
  ],
  canAddLearning: false,
  canComplete: false,
};

it("opens the structured recommended mission instead of the interview dialog", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ...payload, mission: structuredMission }), { status: 200 })
    )
  );

  render(<StartupHomeScreen startupId={7} />);
  await userEvent.click(await screen.findByRole("button", { name: "Abrir missão" }));

  expect(navigation.push).toHaveBeenCalledWith(
    "/painel/startup/7/missoes/refine_problem_with_evidence"
  );
});
```

Em `mission-focus-panel.tsx`, tornar o CTA e o progresso genéricos:

```typescript
const isInterviewMission = mission.actionType === "interviews";
const primaryLabel = isPending
  ? "Salvando..."
  : !isInterviewMission
    ? "Abrir missão"
    : mission.canComplete
      ? "Concluir missão"
      : mission.canAddLearning
        ? "Registrar aprendizado"
        : "Registrar entrevista";

const progressLabel = isInterviewMission
  ? `${mission.evidenceCount} de ${mission.requiredEvidenceCount} entrevistas`
  : (mission.requirements[0]?.label ?? "Entregável principal");
```

Usar `progressLabel` no lugar do contador fixo de entrevistas. Manter as regras visuais e de
acessibilidade existentes.

Em `startup-home-screen.tsx`, importar `missionExecutionHref`. No início de
`handlePrimaryMissionAction`, antes da lógica de conclusão/entrevista:

```typescript
if (mission.actionType !== "interviews") {
  router.push(missionExecutionHref(startupId, mission.key, mission.actionType));
  return;
}
```

Aplicar a mesma guarda no início de `handleOpenMissionStep`, para que qualquer passo de missão
estruturada navegue ao detalhe e nunca abra os diálogos de entrevista/aprendizado.

- [ ] **Step 5: Add canonical navigation helpers and activate the section**

Adicionar:

```typescript
export function startupMissionsHref(startupId: number) {
  return `${startupHomeHref(startupId)}/missoes`;
}

export function startupMissionHref(startupId: number, missionKey: string) {
  return `${startupMissionsHref(startupId)}/${encodeURIComponent(missionKey)}`;
}

export function missionExecutionHref(
  startupId: number,
  missionKey: string,
  actionType: MissionActionType
) {
  return actionType === "interviews"
    ? startupHomeHref(startupId)
    : startupMissionHref(startupId, missionKey);
}
```

Importar `MissionActionType`. Em `workspace-sidebar.tsx`, habilitar `missions`, ampliar `destination`
para `"home" | "journey" | "missions"` e mapear Missões para `startupMissionsHref`.

Em `workspace-shell.tsx`:

```typescript
function activeSection(pathname: string): WorkspaceSection {
  if (pathname.includes("/missoes")) return "missions";
  if (pathname.endsWith("/jornada")) return "journey";
  return "home";
}
```

No teste do shell, tornar o pathname mockável e verificar que `/painel/startup/7/missoes/x` marca o
link de Missões com `aria-current="page"`. Substituir o mock fixo por:

```typescript
const navigation = vi.hoisted(() => ({
  params: { startupId: "7" },
  pathname: "/painel/startup/7/missoes/refine_problem_with_evidence",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => navigation.params,
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));
```

Adicionar um teste que responde `/api/auth/me` e `/api/startups` como o teste existente e então usa:

```typescript
expect(await screen.findByRole("link", { name: "Missoes" })).toHaveAttribute(
  "aria-current",
  "page"
);
```

- [ ] **Step 6: Create the three Next.js proxies**

Central e detalhe usam `GET` e `proxyAuthenticatedBackend`. A submissão usa:

```typescript
import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ startupId: string; missionKey: string }> }
) {
  const { startupId, missionKey } = await params;
  return proxyAuthenticatedBackend(
    `/startups/${startupId}/missions/${missionKey}/submission/`,
    {
      body: await request.text(),
      fallbackMessage: "Nao foi possivel registrar o entregavel da missao.",
      method: "POST",
    }
  );
}
```

Usar mensagens específicas `Nao foi possivel carregar as missoes.` e
`Nao foi possivel carregar esta missao.` nos GETs.

- [ ] **Step 7: Run frontend contracts and type checking**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/lib/startup-navigation.test.ts src/components/workspace/workspace-sidebar.test.tsx src/components/workspace/workspace-shell.test.tsx
npm.cmd test -- --run src/components/home/startup-home-screen.test.tsx src/components/home/mission-focus-panel.test.tsx
npx.cmd tsc --noEmit --pretty false
```

Expected: tests and TypeScript PASS.

- [ ] **Step 8: Commit frontend foundation**

```powershell
git add apps/frontend/src/lib/startup-types.ts apps/frontend/src/lib/startup-navigation.ts apps/frontend/src/lib/startup-navigation.test.ts apps/frontend/src/app/api/startups apps/frontend/src/components/workspace apps/frontend/src/components/home/startup-home-screen.tsx apps/frontend/src/components/home/startup-home-screen.test.tsx apps/frontend/src/components/home/mission-focus-panel.tsx apps/frontend/src/components/home/mission-focus-panel.test.tsx
git commit -m "feat: habilita navegacao e contratos de missoes"
```

Confirmar com `git status --short` que `apps/frontend/next-env.d.ts` continua fora do commit.

---

### Task 8: Construir a Central de missão aprovada

**Files:**

- Create: `apps/frontend/src/components/missions/startup-missions-route-screen.tsx`
- Create: `apps/frontend/src/components/missions/mission-center-screen.tsx`
- Create: `apps/frontend/src/components/missions/mission-center-screen.module.css`
- Create: `apps/frontend/src/components/missions/mission-center-screen.test.tsx`
- Create: `apps/frontend/src/components/missions/mission-center-screen-css.test.ts`
- Create: `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/missoes/page.tsx`

**Interfaces:**

- Consumes: `GET /api/startups/:id/missions` e `MissionCenterPayload`.
- Consumes: `missionExecutionHref()` para cada CTA.
- Produces: skeleton, erro/retry, foco recomendado, alternativas condicionais e trilha completa.
- Produces: rota canônica `/painel/startup/[startupId]/missoes`.

- [ ] **Step 1: Write failing behavior tests with a complete fixture**

Criar o teste com fixture contendo uma recomendada, uma bloqueada e nenhuma alternativa:

```typescript
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MissionCardSummary, MissionCenterPayload, StartupSummary } from "@/lib/startup-types";

import { MissionCenterScreen } from "./mission-center-screen";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const recommended = {
  key: "customer_interviews_5",
  definitionVersion: 2,
  origin: "catalog",
  type: "main",
  typeLabel: "Missao principal",
  phase: "Descoberta",
  title: "Converse com 5 potenciais clientes",
  objective: "Entender como o problema acontece na vida real.",
  xpReward: 150,
  status: "in_progress",
  statusLabel: "Em andamento",
  progress: 40,
  actionType: "interviews",
  isRequired: true,
  order: 10,
  priority: 100,
  prerequisiteKeys: [],
  lockedReasons: [],
  recommendationReason: "Continue esta missao porque ela ja esta em andamento.",
  completedAt: null,
} satisfies MissionCardSummary;

const payload: MissionCenterPayload = {
  startup: { id: 7, name: "Aurora Labs" } as StartupSummary,
  catalogVersion: 2,
  arc: { key: "discovery", title: "Descoberta", completed: 0, total: 5, progress: 0 },
  recommendedMission: recommended,
  availableMissions: [],
  lockedMissions: [
    {
      ...recommended,
      key: "refine_problem_with_evidence",
      title: "Refine o problema com evidencias",
      status: "locked",
      statusLabel: "Bloqueada",
      progress: 0,
      actionType: "problem_refinement",
      order: 20,
      prerequisiteKeys: ["customer_interviews_5"],
      lockedReasons: ["Conclua: Converse com 5 potenciais clientes"],
      recommendationReason: null,
    },
  ],
  completedMissions: [],
  gamification: { xp: 250, level: 1, xpIntoLevel: 250, xpPerLevel: 300, achievements: [], unlockedCount: 0 },
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
```

Testar:

```typescript
it("renders one focus, hides empty alternatives and explains locks", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })));
  render(<MissionCenterScreen startupId={7} />);

  expect(await screen.findByRole("heading", { name: recommended.title })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Continuar missao" })).toHaveAttribute("href", "/painel/startup/7");
  expect(screen.queryByRole("heading", { name: "Tambem disponivel" })).not.toBeInTheDocument();
  expect(screen.getByText("Conclua: Converse com 5 potenciais clientes")).toBeInTheDocument();
});

it("renders real alternatives when the API returns them", async () => {
  const withAlternative = { ...payload, availableMissions: [{ ...recommended, key: "map_current_alternatives", title: "Mapeie as alternativas atuais", actionType: "alternatives_map", order: 50 }] };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(withAlternative), { status: 200 })));
  render(<MissionCenterScreen startupId={7} />);

  expect(await screen.findByRole("heading", { name: "Tambem disponivel" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Mapeie as alternativas atuais/ })).toHaveAttribute(
    "href",
    "/painel/startup/7/missoes/map_current_alternatives"
  );
});

it("shows an actionable retry state", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Falha" }), { status: 503 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<MissionCenterScreen startupId={7} />);

  fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
});

it("shows an honest completed-arc state without inventing the next module", async () => {
  const completedArc = {
    ...payload,
    arc: { ...payload.arc, completed: 5, progress: 100 },
    recommendedMission: null,
    availableMissions: [],
    lockedMissions: [],
    completedMissions: Array.from({ length: 5 }, (_, index) => ({
      ...recommended,
      key: `completed_${index}`,
      title: `Missao concluida ${index + 1}`,
      status: "completed" as const,
      statusLabel: "Concluida",
      progress: 100,
      order: (index + 1) * 10,
      completedAt: "2026-07-16T12:00:00Z",
    })),
  };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(completedArc), { status: 200 })));
  render(<MissionCenterScreen startupId={7} />);

  expect(await screen.findByRole("heading", { name: "Arco de Descoberta concluido" })).toBeInTheDocument();
  expect(screen.getByText(/A proxima trilha ainda nao foi liberada/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Continuar missao" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify the component is missing**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/missions/mission-center-screen.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement loading and state orchestration**

`MissionCenterScreen` deve:

- usar `useRouter`, `useCallback`, `useEffect` e estados `payload`, `isLoading`, `loadError`;
- buscar `/api/startups/${startupId}/missions` com `cache: "no-store"`;
- redirecionar 401 para `/`;
- mostrar mensagem específica para 404;
- expor `aria-busy` no skeleton;
- combinar as quatro listas em `trail`, remover duplicatas por `key` e ordenar por `order`.
- quando `recommendedMission` for `null` e `arc.progress === 100`, mostrar `Arco de Descoberta
  concluido`, manter o histórico e informar `A proxima trilha ainda nao foi liberada.` sem CTA falso.

O componente de linha deve ser um `<li>`; somente disponível/em andamento/concluída usa `<Link>`,
enquanto bloqueada usa `<div aria-disabled="true">` com o primeiro motivo legível.

- [ ] **Step 4: Implement the approved composition and copy**

Estrutura sem cards aninhados:

```tsx
<div className={styles.page}>
  <header className={styles.header}>
    <div><h1>Missoes</h1><p>Transforme a proxima duvida da startup em acao.</p></div>
    <div aria-label={`${payload.arc.progress}% do arco concluido`} className={styles.arcProgress}>
      <strong>{payload.arc.title}</strong>
      <span>{payload.arc.completed} de {payload.arc.total}</span>
    </div>
  </header>
  <section className={styles.focus} aria-labelledby="mission-focus-title">...</section>
  {payload.availableMissions.length > 0 ? <section aria-labelledby="available-title">...</section> : null}
  <section aria-labelledby="trail-title"><ol className={styles.trail}>...</ol></section>
</div>
```

No foco, exibir razão, título, objetivo, barra semântica, XP e CTA. Na trilha, mostrar estado por
texto e ícone; não usar chips para cada informação.

- [ ] **Step 5: Implement CSS and contract tests**

O CSS deve usar os tokens existentes `#070b13`, `#0b111c`, `#203145`, `#f7efe3`, `#9aa8b8`,
`#f2a51a` e teal `#bfe8ce/#10241b`. Regras obrigatórias verificadas no teste CSS:

```typescript
expect(source).toMatch(/\.page\s*\{[\s\S]*max-width:\s*1540px/i);
expect(source).toMatch(/\.focus\s*\{[\s\S]*border:\s*1px solid rgba\(242, 165, 26/i);
expect(source).not.toMatch(/\.focus\s*\{[^}]*box-shadow:/i);
expect(source).toMatch(/@media \(max-width:\s*1120px\)/i);
expect(source).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)/i);
```

Usar `border-radius` máximo de `16px`, sem gradiente de texto, sem grid decorativo e sem animação de
entrada da página.

- [ ] **Step 6: Add route wrapper and route page**

`StartupMissionsRouteScreen` apenas repassa `startupId` para a Central. A página server component
repete a validação numérica da Jornada e retorna:

```tsx
return <StartupMissionsRouteScreen startupId={numericId} />;
```

- [ ] **Step 7: Run component, CSS and workspace tests**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/missions/mission-center-screen.test.tsx src/components/missions/mission-center-screen-css.test.ts src/components/workspace/workspace-sidebar.test.tsx
npm.cmd run lint
```

Expected: Central behavior, CSS contract, sidebar and lint PASS.

- [ ] **Step 8: Commit the Central**

```powershell
git add apps/frontend/src/components/missions apps/frontend/src/app/painel
git commit -m "feat: cria central de missao"
```

Revisar o staged diff para não incluir páginas do painel fora de `missoes` nem `next-env.d.ts`.

---

### Task 9: Criar a execução das missões estruturadas

**Files:**

- Create: `apps/frontend/src/components/missions/startup-mission-route-screen.tsx`
- Create: `apps/frontend/src/components/missions/mission-detail-screen.tsx`
- Create: `apps/frontend/src/components/missions/mission-detail-screen.module.css`
- Create: `apps/frontend/src/components/missions/mission-detail-screen.test.tsx`
- Create: `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/missoes/[missionKey]/page.tsx`

**Interfaces:**

- Consumes: GET detalhe e POST submissão.
- Produces: formulários explícitos para quatro `MissionActionType`.
- Produces: estados bloqueado, concluído/read-only, erro de campo, submissão e próximo foco.
- Preserves: missão de entrevistas usa Home, sem segunda implementação.

- [ ] **Step 1: Write failing detail and submission tests**

Criar fixture de detalhe expandindo o card da Task 8:

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  MissionCardSummary,
  MissionDetailPayload,
  StartupSummary,
} from "@/lib/startup-types";

import { MissionDetailScreen } from "./mission-detail-screen";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const recommended = {
  key: "customer_interviews_5",
  definitionVersion: 2,
  origin: "catalog",
  type: "main",
  typeLabel: "Missao principal",
  phase: "Descoberta",
  title: "Converse com 5 potenciais clientes",
  objective: "Entender como o problema acontece na vida real.",
  xpReward: 150,
  status: "available",
  statusLabel: "Disponivel",
  progress: 0,
  actionType: "interviews",
  isRequired: true,
  order: 10,
  priority: 100,
  prerequisiteKeys: [],
  lockedReasons: [],
  recommendationReason: "Comece por evidencias reais.",
  completedAt: null,
} satisfies MissionCardSummary;

const detail: MissionDetailPayload = {
  startup: { id: 7, name: "Aurora Labs" } as StartupSummary,
  gamification: { xp: 250, level: 1, xpIntoLevel: 250, xpPerLevel: 300, achievements: [], unlockedCount: 0 },
  mission: {
    ...recommended,
    key: "refine_problem_with_evidence",
    title: "Refine o problema com evidencias",
    actionType: "problem_refinement",
    status: "available",
    statusLabel: "Disponivel",
    order: 20,
    whyItMatters: "Um problema especifico reduz risco.",
    instructions: ["Revise os padroes", "Reescreva o problema"],
    completionCriteria: "Registrar problema e evidencias.",
    contextualTip: "Nao cite a solucao.",
    requiredEvidenceCount: 1,
    evidenceCount: 0,
    canAddLearning: false,
    canComplete: false,
    requirements: [{ key: "submission", label: "Entregavel registrado", current: 0, target: 1, completed: false }],
    steps: [{ key: "submit", title: "Refine o problema", description: "Conecte as entrevistas.", status: "current" }],
    evidences: [],
    learning: null,
  },
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
```

Testar:

```typescript
it("submits problem evidence and shows the next recommendation", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({
      ...detail,
      mission: { ...detail.mission, status: "completed", statusLabel: "Concluida" },
      message: "Missao concluida.",
      nextRecommendedMission: { ...recommended, key: "validate_priority_audience", title: "Valide o publico prioritario", actionType: "audience_validation", order: 30 },
    }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<MissionDetailScreen missionKey="refine_problem_with_evidence" startupId={7} />);

  fireEvent.change(await screen.findByLabelText("Problema refinado"), { target: { value: "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque." } });
  fireEvent.change(screen.getByLabelText("Evidencias que sustentam o problema"), { target: { value: "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes." } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar e concluir missao" }));

  await screen.findByText("Missao concluida.");
  expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
    problemStatement: "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
    evidenceSummary: "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
  });
  expect(screen.getByRole("link", { name: /Valide o publico prioritario/ })).toHaveAttribute(
    "href",
    "/painel/startup/7/missoes/validate_priority_audience"
  );
});

it("shows backend field errors next to the matching control", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Revise", fieldErrors: { problemStatement: ["O problema deve ter pelo menos 40 caracteres."] } }), { status: 400 })));
  render(<MissionDetailScreen missionKey="refine_problem_with_evidence" startupId={7} />);

  fireEvent.click(await screen.findByRole("button", { name: "Salvar e concluir missao" }));
  expect(await screen.findByText("O problema deve ter pelo menos 40 caracteres.")).toBeInTheDocument();
});

it("keeps a completed mission read-only", async () => {
  const completed = { ...detail, mission: { ...detail.mission, status: "completed", statusLabel: "Concluida", evidences: [{ id: 1, type: "document", title: "Problema refinado", summary: "Evidencia registrada", details: { problemStatement: "Problema final" }, intervieweeName: "", intervieweeProfile: "", context: "", notes: "Evidencia registrada", occurredOn: "2026-07-16", createdAt: "2026-07-16T12:00:00Z" }] } };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(completed), { status: 200 })));
  render(<MissionDetailScreen missionKey="refine_problem_with_evidence" startupId={7} />);

  expect(await screen.findByText("Problema final")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Salvar e concluir missao" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify the screen is missing**

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/missions/mission-detail-screen.test.tsx
```

Expected: FAIL on missing component.

- [ ] **Step 3: Implement explicit forms instead of a schema generator**

Criar quatro branches com os rótulos e payloads abaixo:

```typescript
type SubmissionDraft = Record<string, string>;

const initialDrafts: Record<Exclude<MissionActionType, "interviews">, SubmissionDraft> = {
  problem_refinement: { problemStatement: "", evidenceSummary: "" },
  audience_validation: { audienceStatement: "", observedSignals: "", decision: "" },
  value_proposition: { valueProposition: "", rationale: "" },
  alternatives_map: { alternatives: "", limitations: "", opportunity: "" },
};
```

- `problem_refinement`: `Problema refinado`, `Evidencias que sustentam o problema`;
- `audience_validation`: `Publico prioritario`, `Sinais observados`, select `Decisao` com `Manter` e
  `Ajustar`;
- `value_proposition`: `Proposta de valor`, `Por que esta proposta faz sentido`;
- `alternatives_map`: `Alternativas atuais`, `Limitacoes observadas`, `Oportunidade`.

Cada textarea usa `required` e `minLength` igual ao backend. Inputs mantêm valor por `draft[field]` e
erros por `fieldErrors[field]?.[0]`, ligados com `aria-describedby`.

- [ ] **Step 4: Implement loading, mutation and read-only states**

O fetch GET segue a Central. No POST:

```typescript
const response = await fetch(
  `/api/startups/${startupId}/missions/${encodeURIComponent(missionKey)}/submission`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  }
);
```

Tratar 401 com `router.replace("/")`, 400/409 com `AuthErrorPayload`, sucesso com
`MissionDetailPayload`. Chamar `onWorkspaceChanged` após sucesso para atualizar XP/topbar.

Se `actionType === "interviews"`, renderizar explicação e link `Continuar na Home`; não renderizar
formulário. Se bloqueada, mostrar todos os `lockedReasons`. Se concluída, renderizar `details` em
`<dl>` e manter o formulário ausente.

- [ ] **Step 5: Add route integration**

`StartupMissionRouteScreen` usa `useWorkspace()` e repassa callback. A página valida `startupId` e
`missionKey`; chave vazia chama `notFound()`. Renderiza:

```tsx
return <StartupMissionRouteScreen missionKey={missionKey} startupId={numericId} />;
```

- [ ] **Step 6: Style and verify interaction states**

Reutilizar geometria/tokens da Central. Formulário tem largura de leitura máxima `760px`; campos
usam fundo `#070b13`, borda `#526e8d`, foco `#f2a51a`, erro `#ff9c9c`. Botão possui estados default,
hover, focus, disabled e loading. Não usar modal.

Run:

```powershell
cd apps/frontend
npm.cmd test -- --run src/components/missions/mission-detail-screen.test.tsx
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: behavior, types and lint PASS.

- [ ] **Step 7: Commit mission execution**

```powershell
git add apps/frontend/src/components/missions apps/frontend/src/app/painel
git commit -m "feat: permite executar missoes estruturadas"
```

Revisar staged diff e excluir `next-env.d.ts` se aparecer.

---

### Task 10: Reconciliar Home, documentar e validar o incremento completo

**Files:**

- Modify: `apps/backend/startups/test_mission_api_v2.py`
- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx:686-700`
- Modify: `apps/frontend/src/components/home/startup-home-screen.test.tsx`
- Modify: `Documentação/arquitetura-missoes.md`
- Modify: `Documentação/funcionalidades.md`
- Modify: `Documentação/fluxos.md`
- Modify: `Documentação/telas.md`
- Modify: `Documentação/progresso.md`
- Modify: `Documentação/proximos-passos.md`
- Modify: `Documentação/handoff.md`

**Interfaces:**

- Verifies: Home e Central compartilham recomendação e progresso.
- Verifies: todas as rotas e estados do Incremento 1.
- Documents: somente o que foi realmente implementado e validado.

- [ ] **Step 1: Add the cross-surface backend contract test**

Acrescentar em `MissionV2ApiTests`:

```python
def test_today_and_center_share_the_same_recommendation_and_progress(self):
    center = self.client.get(f"/api/startups/{self.startup.pk}/missions/", **self.auth).json()
    today = self.client.get(f"/api/startups/{self.startup.pk}/today/", **self.auth).json()

    self.assertEqual(today["mission"]["key"], center["recommendedMission"]["key"])
    self.assertEqual(today["mission"]["progress"], center["recommendedMission"]["progress"])


def test_today_reports_arc_complete_instead_of_a_false_lock(self):
    self.startup.missions.update(status=Mission.Status.COMPLETED, completed_at=timezone.now())

    today = self.client.get(f"/api/startups/{self.startup.pk}/today/", **self.auth).json()

    self.assertIsNone(today["mission"])
    self.assertEqual(today["missionState"], "arc_complete")
    self.assertEqual(today["nextUnlock"]["title"], "Proxima trilha")
    self.assertFalse(today["nextUnlock"]["available"])
```

Adicionar ao teste da Home:

```typescript
it("distinguishes a completed arc from a blocked next mission", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...payload,
          mission: null,
          missionState: "arc_complete",
          nextUnlock: {
            key: "next_arc",
            title: "Proxima trilha",
            description: "A proxima trilha ainda nao foi liberada.",
            available: false,
          },
        }),
        { status: 200 }
      )
    )
  );

  render(<StartupHomeScreen startupId={7} />);

  expect(await screen.findByRole("heading", { name: "Arco de Descoberta concluido" })).toBeInTheDocument();
  expect(screen.queryByText("Sua proxima missao ainda esta bloqueada")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Rever missoes" })).toHaveAttribute(
    "href",
    "/painel/startup/7/missoes"
  );
});
```

Em `startup-home-screen.tsx`, no ramo sem missão, renderizar `Arco de Descoberta concluido`, a
explicação `Voce concluiu as missoes disponiveis neste incremento.` e o link `Rever missoes` quando
`payload.missionState === "arc_complete"`; preservar a mensagem bloqueada somente para
`unavailable`.

- [ ] **Step 2: Run all automated checks**

Backend:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts startups
```

Frontend:

```powershell
cd apps/frontend
npm.cmd test -- --maxWorkers=1
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
npm.cmd run build
```

Expected: migrations clean, Django check/tests, Vitest, TypeScript, lint and build PASS.

- [ ] **Step 3: Run the local application and validate the real flow**

Run at repository root:

```powershell
.\LIGAR-TUDO.cmd
```

Validate in browser:

1. startup nova recebe cinco missões sem duplicação;
2. Home e Central mostram entrevistas como foco;
3. Central esconde `Também disponível` no início;
4. missão bloqueada explica a anterior necessária;
5. conclusão das entrevistas libera refinamento do problema;
6. missões 2 e 3 atualizam Mapa inicial;
7. após missão 3, proposta é foco e alternativas aparece como disponível;
8. missão 4 atualiza/conclui Proposta de valor quando ela é a etapa atual;
9. missão 5 registra alternativas e oportunidade;
10. XP e fogo mudam somente após atividade válida;
11. refresh não duplica evidência, conclusão ou XP;
12. troca de startup não mistura dados.

- [ ] **Step 4: Validate desktop geometry and accessibility**

Nas resoluções `1280 x 720`, `1366 x 768`, `1536 x 720` e `1920 x 900`, confirmar:

- nenhuma rolagem horizontal;
- sidebar/topbar fixas e somente conteúdo rolável;
- foco, alternativas e trilha legíveis sem empilhamento incorreto;
- textos longos não vazam;
- navegação por Tab alcança CTAs, linhas disponíveis e formulários;
- bloqueios não são comunicados apenas por cor;
- `prefers-reduced-motion` remove transições não essenciais.

- [ ] **Step 5: Update documentation with actual results**

Registrar:

- catálogo e campos realmente criados;
- endpoints e rotas entregues;
- missões 1 a 5 operacionais;
- relação real com Jornada e Mapa inicial;
- comandos e contagens finais dos testes;
- limitações restantes: missões 6 a 10, Experimentos, Decisões e gestão semanal;
- próximo plano recomendado: Incremento 2, somente depois da validação de uso do Incremento 1.

Não copiar números históricos de testes; usar os resultados desta execução.

- [ ] **Step 6: Commit final integration and documentation**

```powershell
git add apps/backend/startups/test_mission_api_v2.py apps/frontend/src/components/home Documentação
git commit -m "docs: registra incremento inicial do motor de missoes"
```

Confirmar que o commit não contém `apps/frontend/next-env.d.ts`.

- [ ] **Step 7: Final branch verification**

Run:

```powershell
git status --short
git log --oneline -10
git diff origin/main...HEAD --stat
```

Expected: somente a alteração preexistente de `next-env.d.ts` pode permanecer fora dos commits; o
diff do incremento contém schema, motor, APIs, Central, detalhe, testes e documentação.
