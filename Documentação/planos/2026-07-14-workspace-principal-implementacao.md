# Startup Quest Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a tela Hoje no workspace principal da Startup Quest, abrir automaticamente a última startup utilizada e substituir as telas provisórias por Home, Jornada e Gerenciamento consistentes.

**Architecture:** O Django continua como fonte de verdade para startups, jornada, missões e gamificação, ganhando apenas a persistência de último acesso e metadados do gerenciador. No Next.js, um route group autenticado fornece um shell compartilhado com provider de contexto; Home e Jornada mantêm seus próprios dados de negócio, enquanto o seletor, a conta e a lista de startups são globais ao workspace.

**Tech Stack:** Django 5.2, PostgreSQL/SQLite de desenvolvimento, Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library e validação visual no navegador local.

## Global Constraints

- prioridade de layout: `1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`;
- sidebar com `272px` em desktop amplo e `240px` em notebook compacto;
- topbar com `72px`;
- somente a área de conteúdo pode rolar; `body`, sidebar e topbar permanecem estáveis;
- símbolo da marca em caixa real de `52 x 52px`, acompanhado por `Startup` e `Quest` em duas linhas sem quebra;
- âmbar apenas para ação principal, progresso atual e XP; teal para conclusão; cinza para bloqueio;
- Home e Jornada são funcionais; os outros módulos ficam desabilitados com `Em breve`;
- sequência e nível pertencem à conta; missão, fase, jornada e evidências pertencem à startup;
- não adicionar biblioteca de componentes visuais nem migrar banco ou framework;
- não otimizar detalhadamente para celular neste ciclo;
- preservar login e criação existentes, incluindo a assinatura compacta já aprovada;
- nenhuma alteração deve apagar ou sobrescrever mudanças não relacionadas presentes no worktree;
- cada tarefa termina com testes verdes e commit contendo somente seus arquivos.

---

## File structure

### Backend

- `apps/backend/startups/models.py`: adiciona `Startup.last_opened_at`.
- `apps/backend/startups/migrations/0006_startup_last_opened_at.py`: migração do novo campo.
- `apps/backend/startups/views.py`: ordenação recente, serialização, abertura e fallback após exclusão.
- `apps/backend/startups/urls.py`: endpoint `POST /api/startups/<id>/open/`.
- `apps/backend/startups/admin.py`: mostra último acesso no admin.
- `apps/backend/startups/tests.py`: contrato de último acesso, propriedade e exclusão.

### Frontend foundation

- `apps/frontend/vitest.config.ts`: ambiente de testes React.
- `apps/frontend/src/test/setup.ts`: matchers de DOM e limpeza.
- `apps/frontend/src/lib/startup-navigation.ts`: destinos canônicos e resolução do painel.
- `apps/frontend/src/lib/startup-types.ts`: metadados recentes e payload de abertura.
- `apps/frontend/src/app/api/startups/[startupId]/open/route.ts`: proxy autenticado da abertura.
- `apps/frontend/src/app/painel/page.tsx`: resolvedor server-side da startup recente.
- `apps/frontend/src/app/painel/(workspace)/layout.tsx`: autenticação e shell do workspace.

### Shared workspace

- `apps/frontend/src/components/workspace/workspace-context.tsx`: estado global de conta/startups.
- `apps/frontend/src/components/workspace/workspace-shell.tsx`: grade fixa e área rolável.
- `apps/frontend/src/components/workspace/workspace-brand.tsx`: lockup corrigido.
- `apps/frontend/src/components/workspace/workspace-sidebar.tsx`: destinos principais.
- `apps/frontend/src/components/workspace/workspace-topbar.tsx`: seletor, fogo, nível e perfil.
- `apps/frontend/src/components/workspace/workspace-shell.module.css`: tokens e geometria compartilhada.

### Home, Jornada e gerenciamento

- `apps/frontend/src/components/home/mission-focus-panel.tsx`: missão principal e passos.
- `apps/frontend/src/components/home/founder-progress-rail.tsx`: sequência, nível e fase.
- `apps/frontend/src/components/home/startup-home-screen.tsx`: dados, formulários e composição da Home.
- `apps/frontend/src/components/home/startup-home-screen.module.css`: layout da Home.
- `apps/frontend/src/components/journey/journey-workspace.tsx`: mestre-detalhe da Jornada.
- `apps/frontend/src/components/journey/startup-map-summary.tsx`: mapa inicial editável por seção.
- `apps/frontend/src/components/journey/startup-journey-screen.tsx`: dados e edição da Jornada.
- `apps/frontend/src/components/journey/startup-journey-screen.module.css`: layout da Jornada.
- `apps/frontend/src/components/startups/startup-manager-screen.tsx`: criar, abrir, renomear e excluir.
- `apps/frontend/src/components/startups/startup-manager-screen.module.css`: lista compacta e diálogos.
- `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/page.tsx`: Home canônica.
- `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/jornada/page.tsx`: Jornada canônica.
- `apps/frontend/src/app/painel/(workspace)/startups/page.tsx`: gerenciador.
- `apps/frontend/src/app/painel/startups/nova/page.tsx`: criação fora do shell.

### Legacy cleanup and documentation

- remover `dashboard-screen.*`, `startup-overview-screen.*`, `startup-today-screen.*` e `startup-detail-screen.*` somente depois de seus comportamentos estarem cobertos pelas novas telas;
- atualizar `Documentação/telas.md`, `fluxos.md`, `funcionalidades.md`, `arquitetura-missoes.md`, `progresso.md` e `proximos-passos.md`.

### Execution order note

Depois da Task 4, executar a Task 6 antes da Task 5. O gerenciador cria o route group e garante que
os destinos do seletor existam; a Task 5 então move Home e Jornada para esse layout em uma única
integração, sem shell duplicado nem links temporariamente quebrados.

---

### Task 1: Persistir e ordenar a startup usada por último

**Files:**

- Modify: `apps/backend/startups/models.py`
- Create: `apps/backend/startups/migrations/0006_startup_last_opened_at.py`
- Modify: `apps/backend/startups/views.py`
- Modify: `apps/backend/startups/urls.py`
- Modify: `apps/backend/startups/admin.py`
- Test: `apps/backend/startups/tests.py`

**Interfaces:**

- Produces: `Startup.last_opened_at: datetime | None`.
- Produces: `POST /api/startups/<startup_id>/open/` retornando `{ message, startup }`.
- Produces: `StartupSummary.lastOpenedAt`, `StartupSummary.lastActivityAt` e `StartupDeletePayload.nextStartupId`.
- Produces: PATCH de `initialGoal` sincronizado com `Startup.initial_goal`.
- Ordering: `last_opened_at DESC NULLS LAST`, depois `updated_at DESC`, depois `created_at DESC`.

- [ ] **Step 1: Write the failing API tests**

Adicionar imports e testes a `StartupApiTests`:

```python
from datetime import timedelta

from django.utils import timezone


def test_create_marks_startup_as_opened(self):
    response = self.client.post(
        "/api/startups/create/",
        data=self.startup_payload(),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 201)
    startup = Startup.objects.get(pk=response.json()["startup"]["id"])
    self.assertIsNotNone(startup.last_opened_at)
    self.assertIsNotNone(response.json()["startup"]["lastOpenedAt"])


def test_list_orders_startups_by_last_opened_at(self):
    now = timezone.now()
    older = Startup.objects.create(
        owner=self.user,
        name="Antiga",
        last_opened_at=now - timedelta(days=2),
    )
    recent = Startup.objects.create(
        owner=self.user,
        name="Recente",
        last_opened_at=now - timedelta(minutes=5),
    )

    response = self.client.get(
        "/api/startups/",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 200)
    self.assertEqual(
        [item["id"] for item in response.json()["startups"]],
        [recent.pk, older.pk],
    )


def test_owner_can_mark_startup_as_opened(self):
    startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

    response = self.client.post(
        f"/api/startups/{startup.pk}/open/",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 200)
    startup.refresh_from_db()
    self.assertIsNotNone(startup.last_opened_at)
    self.assertEqual(response.json()["startup"]["id"], startup.pk)


def test_user_cannot_mark_another_users_startup_as_opened(self):
    other_user = User.objects.create_user(
        username="open-other@example.com",
        email="open-other@example.com",
        password="123",
    )
    startup = Startup.objects.create(owner=other_user, name="AtlasPay")

    response = self.client.post(
        f"/api/startups/{startup.pk}/open/",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 404)


def test_delete_returns_next_recent_startup(self):
    now = timezone.now()
    fallback = Startup.objects.create(
        owner=self.user,
        name="Fallback",
        last_opened_at=now - timedelta(hours=1),
    )
    active = Startup.objects.create(
        owner=self.user,
        name="Ativa",
        last_opened_at=now,
    )

    response = self.client.delete(
        f"/api/startups/{active.pk}/",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.json()["nextStartupId"], fallback.pk)


def test_update_startup_accepts_initial_goal(self):
    startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

    response = self.client.patch(
        f"/api/startups/{startup.pk}/",
        data={"initialGoal": "Validar o problema com cinco entrevistas."},
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {self.token}",
    )

    self.assertEqual(response.status_code, 200)
    startup.refresh_from_db()
    self.assertEqual(startup.initial_goal, "Validar o problema com cinco entrevistas.")
    self.assertEqual(
        response.json()["startup"]["initialGoal"],
        "Validar o problema com cinco entrevistas.",
    )
```

- [ ] **Step 2: Run the tests and confirm the expected failures**

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py test startups.tests.StartupApiTests -v 2
```

Expected: failures mentioning missing `last_opened_at`, missing `/open/` route and missing `nextStartupId`.

- [ ] **Step 3: Add the model field and migration**

Em `Startup`:

```python
last_opened_at = models.DateTimeField(null=True, blank=True, db_index=True)
```

Criar a migração:

```python
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("startups", "0005_mission_learning_missionevidence_activityevent_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="startup",
            name="last_opened_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]
```

- [ ] **Step 4: Implement ordering, serialization and the open endpoint**

Adicionar a `views.py`:

```python
from django.db.models import F


def _ordered_startups_for_user(user):
    return Startup.objects.filter(owner=user).order_by(
        F("last_opened_at").desc(nulls_last=True),
        "-updated_at",
        "-created_at",
    )


def _last_activity_at(startup):
    event = startup.activity_events.order_by("-occurred_at").first()
    return event.occurred_at.isoformat() if event else startup.updated_at.isoformat()
```

Incluir em `_serialize_startup`:

```python
"lastOpenedAt": startup.last_opened_at.isoformat() if startup.last_opened_at else None,
```

Em `list_startups`, usar `_ordered_startups_for_user(user)` e adicionar em cada item:

```python
serialized["lastActivityAt"] = _last_activity_at(startup)
```

Na criação, preencher o campo:

```python
startup = Startup.objects.create(
    owner=user,
    name=name or _build_deferred_name(user),
    description=description,
    segment=segment,
    problem=problem,
    audience=audience,
    last_opened_at=timezone.now(),
)
```

Adicionar view e rota:

```python
@csrf_exempt
@require_POST
def open_startup(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    startup.last_opened_at = timezone.now()
    startup.save(update_fields=["last_opened_at"])
    return JsonResponse(
        {
            "message": f"{startup.name} agora e a startup ativa.",
            "startup": _serialize_startup(startup),
        }
    )
```

```python
path("startups/<int:startup_id>/open/", open_startup),
```

- [ ] **Step 5: Return deterministic fallback after deletion**

Alterar a chamada para `_delete_startup(startup, startup_id, user)` e implementar:

```python
def _delete_startup(startup, startup_id, user):
    startup_name = startup.name
    startup.delete()
    next_startup = _ordered_startups_for_user(user).first()

    return JsonResponse(
        {
            "deletedStartupId": startup_id,
            "nextStartupId": next_startup.pk if next_startup else None,
            "message": f'{startup_name} foi excluida com sucesso.',
        }
    )
```

Adicionar `last_opened_at` ao `list_display` do admin.

Ampliar a atualização do mapa sem confundir o nome JSON com o campo Python:

```python
UPDATABLE_FIELDS = ("name", "description", "segment", "problem", "audience", "initialGoal")

MODEL_FIELD_BY_PAYLOAD_FIELD = {
    "name": "name",
    "description": "description",
    "segment": "segment",
    "problem": "problem",
    "audience": "audience",
    "initialGoal": "initial_goal",
}
```

Validar `initialGoal` com máximo de `255` caracteres. Ao salvar, aplicar
`setattr(startup, MODEL_FIELD_BY_PAYLOAD_FIELD[field], value)` e montar `update_fields` com os nomes
do modelo. Manter a sincronização de `problem` e `audience` com as etapas existentes.

- [ ] **Step 6: Run migration checks and backend tests**

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations --check
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py test startups -v 2
```

Expected: no pending migration, migration applied and all startup tests passing.

- [ ] **Step 7: Commit the backend unit**

```powershell
git add apps/backend/startups/models.py apps/backend/startups/migrations/0006_startup_last_opened_at.py apps/backend/startups/views.py apps/backend/startups/urls.py apps/backend/startups/admin.py apps/backend/startups/tests.py
git commit -m "feat: persiste startup usada por ultimo"
```

---

### Task 2: Criar a fundação de testes e resolver as rotas do workspace

**Files:**

- Modify: `apps/frontend/package.json`
- Modify: `apps/frontend/package-lock.json`
- Create: `apps/frontend/vitest.config.ts`
- Create: `apps/frontend/src/test/setup.ts`
- Create: `apps/frontend/src/lib/startup-navigation.ts`
- Create: `apps/frontend/src/lib/startup-navigation.test.ts`
- Modify: `apps/frontend/src/lib/startup-types.ts`
- Create: `apps/frontend/src/app/api/startups/[startupId]/open/route.ts`
- Modify: `apps/frontend/src/app/painel/page.tsx`
- Create: `apps/frontend/src/components/panel-resolution-error.tsx`

**Interfaces:**

- Produces: `resolvePanelDestination(startups: StartupSummary[]): string`.
- Produces: `startupHomeHref(startupId: number): string`.
- Produces: frontend `POST /api/startups/[startupId]/open` proxy.
- Consumes: backend list already ordered by recent use.

- [ ] **Step 1: Install the frontend test runner and add scripts**

```powershell
cd apps/frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Adicionar scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Criar `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Criar `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- [ ] **Step 2: Write the failing navigation tests**

```ts
import { describe, expect, it } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import { resolvePanelDestination, startupHomeHref } from "./startup-navigation";

const startup = { id: 42 } as StartupSummary;

describe("startup navigation", () => {
  it("opens creation when the account has no startup", () => {
    expect(resolvePanelDestination([])).toBe("/painel/startups/nova");
  });

  it("opens the first startup returned by the recent-order API", () => {
    expect(resolvePanelDestination([startup])).toBe("/painel/startup/42");
  });

  it("builds the canonical Home URL", () => {
    expect(startupHomeHref(9)).toBe("/painel/startup/9");
  });
});
```

- [ ] **Step 3: Run the test and confirm module-not-found failure**

```powershell
cd apps/frontend
npm test -- src/lib/startup-navigation.test.ts
```

Expected: FAIL because `startup-navigation.ts` does not exist.

- [ ] **Step 4: Implement navigation helpers and extend payload types**

```ts
import type { StartupSummary } from "@/lib/startup-types";

export function startupHomeHref(startupId: number) {
  return `/painel/startup/${startupId}`;
}

export function startupJourneyHref(startupId: number) {
  return `${startupHomeHref(startupId)}/jornada`;
}

export function resolvePanelDestination(startups: StartupSummary[]) {
  return startups.length > 0 ? startupHomeHref(startups[0].id) : "/painel/startups/nova";
}
```

Adicionar aos tipos:

```ts
lastOpenedAt: string | null;
lastActivityAt?: string;
```

```ts
export interface StartupOpenPayload {
  message: string;
  startup: StartupSummary;
}
```

Adicionar a `StartupDeletePayload`:

```ts
nextStartupId: number | null;
```

- [ ] **Step 5: Add the authenticated open proxy**

```ts
import { proxyAuthenticatedBackend } from "@/lib/authenticated-backend-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;
  return proxyAuthenticatedBackend(`/startups/${startupId}/open/`, {
    fallbackMessage: "Nao foi possivel abrir a startup agora.",
    method: "POST",
  });
}
```

- [ ] **Step 6: Convert `/painel` into a server-side resolver**

O arquivo deve autenticar, chamar `fetchBackend("/startups/")`, ler `StartupListPayload` e usar
`resolvePanelDestination`. Em falha transitória, renderizar:

```tsx
"use client";

export function PanelResolutionError() {
  return (
    <main>
      <section role="alert">
        <h1>Nao foi possivel abrir seu workspace</h1>
        <p>Confira se o backend esta ligado e tente novamente.</p>
        <button onClick={() => window.location.reload()} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
```

Fluxo obrigatório de `page.tsx`:

```tsx
const cookieStore = await cookies();
const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
if (!token) redirect("/");

const response = await fetchBackend("/startups/", {
  headers: { Authorization: `Bearer ${token}` },
  cache: "no-store",
});
if (response.status === 401) redirect("/");
if (!response.ok) return <PanelResolutionError />;

const payload = await readJsonResponse<StartupListPayload>(response);
if (!payload) return <PanelResolutionError />;
redirect(resolvePanelDestination(payload.startups));
```

- [ ] **Step 7: Verify the helper tests and frontend boundary**

```powershell
cd apps/frontend
npm test -- src/lib/startup-navigation.test.ts
npm run lint
npx tsc --noEmit
```

Expected: tests, lint and typecheck pass with code `0`.

- [ ] **Step 8: Commit the routing foundation**

```powershell
git add apps/frontend/package.json apps/frontend/package-lock.json apps/frontend/vitest.config.ts apps/frontend/src/test/setup.ts apps/frontend/src/lib/startup-navigation.ts apps/frontend/src/lib/startup-navigation.test.ts apps/frontend/src/lib/startup-types.ts apps/frontend/src/app/api/startups/'[startupId]'/open/route.ts apps/frontend/src/app/painel/page.tsx apps/frontend/src/components/panel-resolution-error.tsx
git commit -m "feat: resolve entrada do workspace pela startup recente"
```

---

### Task 3: Implementar o shell compartilhado e corrigir a marca

**Files:**

- Create: `apps/frontend/src/components/workspace/workspace-context.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-brand.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-sidebar.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-topbar.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-shell.tsx`
- Create: `apps/frontend/src/components/workspace/workspace-shell.module.css`
- Test: `apps/frontend/src/components/workspace/workspace-brand.test.tsx`
- Test: `apps/frontend/src/components/workspace/workspace-sidebar.test.tsx`

**Interfaces:**

- Produces: `WorkspaceProvider`, `useWorkspace()` and `WorkspaceShell`.
- `WorkspaceState`: `{ user, startups, accountProgress, activeStartup, isLoading, error }`.
- `refreshWorkspace(): Promise<void>` refreshes list and global gamification.
- `openStartup(id: number): Promise<boolean>` persists recent use and navigates only after success.

- [ ] **Step 1: Write failing brand and navigation tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceBrand } from "./workspace-brand";

describe("WorkspaceBrand", () => {
  it("renders the fixed two-line name beside the symbol", () => {
    render(<WorkspaceBrand href="/painel/startup/1" />);
    const link = screen.getByRole("link", { name: "Startup Quest" });
    expect(link).toHaveTextContent("Startup");
    expect(link).toHaveTextContent("Quest");
    expect(link.querySelectorAll("span[data-brand-line]")).toHaveLength(2);
  });
});
```

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceSidebar } from "./workspace-sidebar";

describe("WorkspaceSidebar", () => {
  it("keeps Home and Jornada enabled and future modules disabled", () => {
    render(<WorkspaceSidebar activeSection="home" startupId={7} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
    expect(screen.getByRole("link", { name: "Jornada" })).toHaveAttribute(
      "href",
      "/painel/startup/7/jornada"
    );
    expect(screen.getByText("Experimentos").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});
```

- [ ] **Step 2: Run tests and confirm missing-component failures**

```powershell
cd apps/frontend
npm test -- src/components/workspace
```

Expected: FAIL because the workspace components do not exist.

- [ ] **Step 3: Create the structural brand**

```tsx
import Link from "next/link";

import { QuestMark } from "@/components/quest-mark";

import styles from "./workspace-shell.module.css";

export function WorkspaceBrand({ href }: { href: string }) {
  return (
    <Link aria-label="Startup Quest" className={styles.brand} href={href}>
      <span className={styles.brandMark}>
        <QuestMark mode="compact" />
      </span>
      <span className={styles.brandName} aria-hidden="true">
        <span data-brand-line>Startup</span>
        <span data-brand-line>Quest</span>
      </span>
    </Link>
  );
}
```

Geometria obrigatória no CSS:

```css
.brand {
  --quest-mark-size: 52px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 76px;
  color: inherit;
  text-decoration: none;
}

.brandMark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  overflow: visible;
}

.brandName {
  display: grid;
  gap: 3px;
  min-width: 0;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brandName > span {
  white-space: nowrap;
}

.brandName > span:first-child { color: #f2a51a; }
.brandName > span:last-child { color: #f7efe3; }
```

- [ ] **Step 4: Implement the sidebar contract**

Definir a lista sem ações administrativas:

```tsx
const items = [
  { key: "home", label: "Home", icon: "home", enabled: true },
  { key: "journey", label: "Jornada", icon: "journey", enabled: true },
  { key: "missions", label: "Missoes", icon: "mission", enabled: false },
  { key: "experiments", label: "Experimentos", icon: "flask", enabled: false },
  { key: "learnings", label: "Aprendizados", icon: "book", enabled: false },
  { key: "metrics", label: "Metricas", icon: "chart", enabled: false },
  { key: "documents", label: "Documentos", icon: "file", enabled: false },
  { key: "achievements", label: "Conquistas", icon: "award", enabled: false },
] as const;
```

`Home` usa `startupHomeHref`, `Jornada` usa `startupJourneyHref`; os demais itens renderizam
`<span aria-disabled="true">`, texto e `<small>Em breve</small>`.

- [ ] **Step 5: Implement workspace context**

O provider deve carregar `/api/auth/me` e `/api/startups` em paralelo, expor `refreshWorkspace` e
marcar o ID presente na URL por `POST /api/startups/{id}/open` uma única vez por mudança de ID. O
prop `activeStartupId` é opcional: no gerenciador, `activeStartup` usa a primeira startup da lista
ordenada; em uma conta vazia, permanece `null`.

Criar uma função privada `markStartupOpened(startupId: number): Promise<boolean>` que executa apenas
o POST. O efeito da rota chama essa função sem navegar; `openStartup` chama a mesma função e depois
usa `router.push(startupHomeHref(startupId))`. Quando `activeStartupId` for `null`, nenhum POST é
feito, portanto visitar o gerenciador não muda a startup recente.
Definir o contrato público:

```tsx
type WorkspaceContextValue = {
  accountProgress: AccountProgress | null;
  activeStartup: StartupSummary | null;
  error: string | null;
  isLoading: boolean;
  openStartup: (startupId: number) => Promise<boolean>;
  refreshWorkspace: () => Promise<void>;
  startups: StartupSummary[];
  user: AuthUser | null;
};

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace deve ser usado dentro de WorkspaceProvider");
  return value;
}
```

Em resposta `401`, usar `router.replace("/")`. Em erro de rede, manter o shell e mostrar a ação
`Tentar novamente`. `openStartup` só executa `router.push(startupHomeHref(id))` quando o POST for
bem-sucedido.

- [ ] **Step 6: Implement topbar and shell**

`WorkspaceTopbar` consome o contexto e inclui:

- seletor com a startup ativa e até quatro startups recentes;
- links `Ver todas as startups` e `Criar nova startup`;
- fogo com `currentStreak` ou `Comece hoje`;
- nível global;
- menu do avatar com `Sair`.

`WorkspaceShell` deriva `routeStartupId` de `useParams`, deriva a seção de `usePathname` e passa o
ID opcional ao provider. Um `WorkspaceFrame` interno consome `activeStartup` do contexto e define
`activeStartupId = activeStartup?.id ?? null` antes de renderizar a marca e a sidebar:

```tsx
<WorkspaceProvider activeStartupId={routeStartupId}>
  <a className={styles.skipLink} href="#workspace-content">Ir para o conteudo</a>
  <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <WorkspaceBrand href={activeStartupId ? startupHomeHref(activeStartupId) : "/painel/startups"} />
      <WorkspaceSidebar activeSection={activeSection} startupId={activeStartupId} />
    </aside>
    <div className={styles.workspace}>
      <WorkspaceTopbar />
      <main className={styles.content} id="workspace-content">{children}</main>
    </div>
  </div>
</WorkspaceProvider>
```

`WorkspaceSidebar` aceita `startupId: number | null`. Quando for `null`, Home e Jornada aparecem
desabilitadas com a explicação `Crie uma startup para acessar`; os módulos futuros continuam com
`Em breve`.

Base CSS completa da geometria:

```css
.shell {
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #070b13;
  color: #f7efe3;
}

:global(html:has(.shell)),
:global(body:has(.shell)) {
  height: 100%;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px 18px 20px;
  overflow: hidden;
  border-right: 1px solid #203145;
  background: #060a12;
}

.workspace {
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
}

.content {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

@media (max-width: 1450px) {
  .shell { grid-template-columns: 240px minmax(0, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  .shell *, .shell *::before, .shell *::after {
    scroll-behavior: auto;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: Preserve the current routes until both screens are shell-free**

Não mover nem envolver as páginas atuais nesta tarefa. `StartupTodayScreen` e `StartupDetailScreen`
ainda possuem shell próprio; conectar o layout agora criaria duas sidebars e duas topbars. Confirmar
que elas continuam nos caminhos atuais:

```powershell
Test-Path -LiteralPath 'src/app/painel/startup/[startupId]/page.tsx'
Test-Path -LiteralPath 'src/app/painel/startup/[startupId]/jornada/page.tsx'
```

Expected: os dois comandos retornam `True`. A integração atômica do route group ocorrerá na Task 5,
depois de Home e Jornada não renderizarem mais shells próprios.

- [ ] **Step 8: Run component tests, lint and typecheck**

```powershell
cd apps/frontend
npm test -- src/components/workspace
npm run lint
npx tsc --noEmit
```

Expected: all commands exit with code `0`.

- [ ] **Step 9: Commit the shared shell**

```powershell
git add apps/frontend/src/components/workspace
git commit -m "feat: cria shell compartilhado do workspace"
```

---

### Task 4: Transformar Hoje na Home orientada por missão

**Files:**

- Create: `apps/frontend/src/components/home/mission-focus-panel.tsx`
- Create: `apps/frontend/src/components/home/founder-progress-rail.tsx`
- Create: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Create: `apps/frontend/src/components/home/startup-home-screen.module.css`
- Test: `apps/frontend/src/components/home/mission-focus-panel.test.tsx`
- Source to preserve temporarily: `apps/frontend/src/components/startup-today-screen.tsx`

**Interfaces:**

- `MissionFocusPanel` consumes `MissionSummary`, `onPrimaryAction` and `onOpenStep`.
- `FounderProgressRail` consumes `AccountProgress` and the `journey` slice from `TodayPayload`.
- `StartupHomeScreen` owns `/today`, evidence, learning and completion requests.

- [ ] **Step 1: Write the failing mission-state test**

Criar uma factory local completa e testar os quatro estados:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MissionSummary } from "@/lib/startup-types";

import { MissionFocusPanel } from "./mission-focus-panel";

const mission: MissionSummary = {
  key: "customer_interviews_5",
  type: "main",
  typeLabel: "Missao principal",
  phase: "Descoberta",
  title: "Converse com 5 potenciais clientes",
  objective: "Entender o problema na vida real.",
  whyItMatters: "Entrevistas substituem suposicoes por evidencias.",
  instructions: ["Prepare o roteiro", "Registre 5 entrevistas", "Resuma os padroes"],
  completionCriteria: "Cinco entrevistas e um aprendizado.",
  contextualTip: "Pergunte sobre situacoes reais do passado.",
  requiredEvidenceCount: 5,
  evidenceCount: 1,
  xpReward: 150,
  status: "in_progress",
  statusLabel: "Em andamento",
  progress: 20,
  canAddLearning: false,
  canComplete: false,
  completedAt: null,
  requirements: [],
  evidences: [],
  learning: null,
  steps: [
    { key: "prepare", title: "Prepare o roteiro", description: "Use perguntas reais.", status: "completed" },
    { key: "interviews", title: "Registre 5 entrevistas", description: "1 de 5 concluidas.", status: "current" },
    { key: "review", title: "Resuma os padroes", description: "Disponivel depois das entrevistas.", status: "locked" },
  ],
};

describe("MissionFocusPanel", () => {
  it("renders progress, reward and a non-interactive locked step", () => {
    const onOpenStep = vi.fn();
    render(
      <MissionFocusPanel
        mission={mission}
        onOpenStep={onOpenStep}
        onPrimaryAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: mission.title })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
    expect(screen.getByText("+150 XP")).toBeInTheDocument();
    expect(screen.getByText("Resuma os padroes").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(screen.getByText("Registre 5 entrevistas"));
    expect(onOpenStep).toHaveBeenCalledWith("interviews");
  });
});
```

- [ ] **Step 2: Run the Home test and confirm missing-component failure**

```powershell
cd apps/frontend
npm test -- src/components/home/mission-focus-panel.test.tsx
```

Expected: FAIL because `MissionFocusPanel` does not exist.

- [ ] **Step 3: Implement the mission panel with semantic states**

Definir a interface:

```tsx
type MissionFocusPanelProps = {
  mission: MissionSummary;
  onOpenStep: (stepKey: string) => void;
  onPrimaryAction: () => void;
};

const statusLabels = {
  available: "Disponivel",
  completed: "Concluido",
  current: "Em andamento",
  locked: "Bloqueado",
} as const;
```

Renderizar título, objetivo, recompensa, contador, `role="progressbar"`, lista ordenada, dica e ação
principal. Para `locked`, o `<li>` recebe `aria-disabled="true"` e não recebe handler; nos demais
estados, um `<button className={styles.stepAction}>` visível como a linha inteira chama
`onOpenStep(step.key)`. O texto do requisito vem de `step.description`, evitando um bloqueio sem
explicação.

- [ ] **Step 4: Extract account and startup progress into the right rail**

Definir:

```tsx
type FounderProgressRailProps = {
  account: AccountProgress;
  journey: TodayPayload["journey"];
};
```

O primeiro cartão usa `currentStreak` e `streakStatus`; o segundo usa `level`, `xpIntoLevel` e
`xpPerLevel`; o terceiro usa `journey.currentStepLabel` e `journey.progress`. Cada barra expõe
`role="progressbar"`, `aria-valuemin`, `aria-valuemax` e `aria-valuenow`.

- [ ] **Step 5: Recompose the existing Today behavior as `StartupHomeScreen`**

Copiar do componente atual os handlers de:

- `GET /api/startups/{id}/today`;
- `POST evidence`;
- `POST learning`;
- `POST complete`;
- formulário de entrevista;
- formulário de aprendizado;
- celebração e mensagens.

Remover do novo arquivo toda marcação de sidebar, topbar e shell. A composição final deve ser:

```tsx
<div className={styles.page}>
  <header className={styles.pageHeader}>
    <h1>Bom dia, {payload.user.firstName}</h1>
    <p>Hoje, o foco e entender o problema antes de construir a solucao.</p>
  </header>
  <div className={styles.primaryGrid}>
    {payload.mission ? (
      <MissionFocusPanel
        mission={payload.mission}
        onOpenStep={handleOpenMissionStep}
        onPrimaryAction={handlePrimaryMissionAction}
      />
    ) : (
      <section className={styles.missionUnavailable}>
        <h2>Sua proxima missao ainda esta bloqueada</h2>
        <p>Continue a etapa atual da Jornada para liberar uma nova missao.</p>
        <Link href={`/painel/startup/${startupId}/jornada`}>Continuar Jornada</Link>
      </section>
    )}
    <FounderProgressRail account={payload.gamification} journey={payload.journey} />
  </div>
  <div className={styles.secondaryGrid}>
    <RecentActivity activities={payload.recentActivities} />
    <NextUnlock unlock={payload.nextUnlock} />
  </div>
  {workMode !== "overview" ? renderWorkDialog() : null}
</div>
```

Definir no mesmo arquivo os helpers privados
`RecentActivity({ activities }: { activities: ActivitySummary[] })` e
`NextUnlock({ unlock }: { unlock: TodayPayload["nextUnlock"] })`. Mover o JSX atual dos formulários
para a função privada `renderWorkDialog()` e manter os estados `overview`, `interview`, `learning` e
`details`. `handleOpenMissionStep` seleciona `interview` para `interviews`, `learning` para `review` e
`details` para os demais passos disponíveis. `handlePrimaryMissionAction` prioriza concluir quando
`canComplete`, registrar aprendizado quando `canAddLearning` e registrar entrevista nos demais casos.

- [ ] **Step 6: Implement the desktop grid without browser-level scrolling**

```css
.page {
  width: min(1540px, 100%);
  margin: 0 auto;
  padding: 32px;
}

.primaryGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
  gap: 24px;
  align-items: start;
}

.secondaryGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
  gap: 24px;
  margin-top: 24px;
}

@media (max-width: 1450px) {
  .page { padding: 24px; }
  .primaryGrid { grid-template-columns: minmax(0, 1fr) 320px; }
}

@media (max-width: 1120px) {
  .primaryGrid, .secondaryGrid { grid-template-columns: minmax(0, 1fr); }
}
```

- [ ] **Step 7: Keep the new Home isolated until atomic route integration**

Exportar `StartupHomeScreen` normalmente, mas não alterar a página canônica ainda. A tela antiga
continua atendendo a rota enquanto Jornada ainda possui shell próprio. Confirmar que o novo arquivo
não importa `WorkspaceShell`, sidebar ou topbar; ele deve representar somente o conteúdo da Home.

- [ ] **Step 8: Run Home tests and frontend checks**

```powershell
cd apps/frontend
npm test -- src/components/home
npm run lint
npx tsc --noEmit
```

Expected: all commands exit with code `0`.

- [ ] **Step 9: Commit the Home unit**

```powershell
git add apps/frontend/src/components/home
git commit -m "feat: transforma hoje na home guiada por missao"
```

---

### Task 5: Reorganizar a Jornada em mestre-detalhe com Mapa inicial

**Files:**

- Create: `apps/frontend/src/components/journey/journey-workspace.tsx`
- Create: `apps/frontend/src/components/journey/startup-map-summary.tsx`
- Create: `apps/frontend/src/components/journey/startup-journey-screen.tsx`
- Create: `apps/frontend/src/components/journey/startup-journey-screen.module.css`
- Test: `apps/frontend/src/components/journey/journey-workspace.test.tsx`
- Move: `apps/frontend/src/app/painel/startup/[startupId]/page.tsx` to `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/page.tsx`
- Move: `apps/frontend/src/app/painel/startup/[startupId]/jornada/page.tsx` to `apps/frontend/src/app/painel/(workspace)/startup/[startupId]/jornada/page.tsx`
- Source to preserve temporarily: `apps/frontend/src/components/startup-detail-screen.tsx`

**Interfaces:**

- `JourneyWorkspace` consumes `journey`, `progress`, `selectedStepKey`, `onSelectStep` and edição.
- `StartupMapSummary` consumes `StartupSummary` and `onSaveField`.
- `StartupJourneyScreen` owns a tab union: `"journey" | "initial-map"`.

- [ ] **Step 1: Write the failing Journey behavior test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { JourneyStepSummary } from "@/lib/startup-types";

import { JourneyWorkspace } from "./journey-workspace";

const steps: JourneyStepSummary[] = [
  { key: "problem", title: "Definicao do problema", status: "done", answer: "Dor real", order: 0, completedAt: "2026-07-10T10:00:00Z" },
  { key: "value", title: "Proposta de valor", status: "current", answer: "", order: 1, completedAt: null },
  { key: "mvp", title: "Planejamento do MVP", status: "pending", answer: "", order: 2, completedAt: null },
];

describe("JourneyWorkspace", () => {
  it("opens current step and keeps pending steps locked", () => {
    const onSelectStep = vi.fn();
    render(
      <JourneyWorkspace
        isSaving={false}
        journey={steps}
        onSaveStep={vi.fn()}
        onSelectStep={onSelectStep}
        progress={33}
        selectedStepKey="value"
      />
    );

    expect(screen.getByRole("heading", { name: "Proposta de valor" })).toBeInTheDocument();
    expect(screen.getByText("Planejamento do MVP").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(screen.getByText("Definicao do problema"));
    expect(onSelectStep).toHaveBeenCalledWith("problem");
  });
});
```

- [ ] **Step 2: Run the Journey test and confirm missing-component failure**

```powershell
cd apps/frontend
npm test -- src/components/journey/journey-workspace.test.tsx
```

Expected: FAIL because `JourneyWorkspace` does not exist.

- [ ] **Step 3: Implement master-detail states**

Definir props:

```tsx
type JourneyWorkspaceProps = {
  isSaving: boolean;
  journey: JourneyStepSummary[];
  onSaveStep: (step: JourneyStepSummary, answer: string, complete: boolean) => Promise<void>;
  onSelectStep: (stepKey: string) => void;
  progress: number;
  selectedStepKey: string;
};
```

A lista da esquerda usa botão para `done` e `current`. `pending` usa `aria-disabled="true"`, cadeado e
o texto `Conclua a etapa atual para desbloquear`. O painel da direita mostra pergunta, ajuda,
resposta existente, textarea e a ação `Concluir etapa` apenas para `current`; uma etapa `done` usa
`Salvar alteração`.

- [ ] **Step 4: Implement `StartupMapSummary` with localized editing**

Usar seis seções:

```ts
const mapFields = [
  { key: "name", label: "Nome" },
  { key: "description", label: "Ideia" },
  { key: "segment", label: "Territorio" },
  { key: "problem", label: "Problema" },
  { key: "audience", label: "Publico inicial" },
  { key: "initialGoal", label: "Objetivo inicial" },
] as const;
```

Somente uma seção entra em edição por vez. O botão `Editar {label}` abre input ou textarea; `Escape`
cancela; salvar chama `onSaveField(field, value)` e mantém a sincronização já existente de problema e
público com as etapas da jornada.

- [ ] **Step 5: Recompose data and editing in `StartupJourneyScreen`**

Preservar do componente antigo:

- `GET /api/startups/{id}/journey`;
- `PATCH /api/startups/{id}/journey/{stepKey}`;
- `PATCH /api/startups/{id}` para mapa inicial;
- validações de nome e respostas;
- celebração de etapa;
- estado de carregamento e erro.

Remover fundo orbital, marca própria, link de voltar, cartão gigante de próximo passo e lista longa.
A composição é:

```tsx
<div className={styles.page}>
  <header className={styles.header}>
    <div>
      <span>Jornada da startup</span>
      <h1>{startup.currentStageLabel}</h1>
      <p>{completedCount} de {journey.length} etapas concluidas</p>
    </div>
    <button onClick={openCurrentStep} type="button">Continuar etapa atual</button>
  </header>
  <div className={styles.tabs} role="tablist" aria-label="Visoes da startup">
    <button aria-controls="journey-panel" aria-selected={tab === "journey"} id="journey-tab" onClick={() => setTab("journey")} role="tab">Jornada</button>
    <button aria-controls="initial-map-panel" aria-selected={tab === "initial-map"} id="initial-map-tab" onClick={() => setTab("initial-map")} role="tab">Mapa inicial</button>
  </div>
  <section aria-labelledby={`${tab}-tab`} id={`${tab}-panel`} role="tabpanel">
    {tab === "journey" ? <JourneyWorkspace /> : <StartupMapSummary />}
  </section>
</div>
```

As setas esquerda/direita alternam as abas e movem o foco; `Home` e `End` levam à primeira e à
última aba. O painel inativo não permanece na árvore de acessibilidade.

- [ ] **Step 6: Implement the Journey desktop grid**

```css
.page {
  width: min(1540px, 100%);
  margin: 0 auto;
  padding: 32px;
}

.journeyGrid {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.stepList {
  position: sticky;
  top: 0;
  max-height: calc(100dvh - 72px - 190px);
  overflow-y: auto;
}

@media (max-width: 1180px) {
  .journeyGrid { grid-template-columns: minmax(240px, 300px) minmax(0, 1fr); }
}
```

- [ ] **Step 7: Integrate Home and Journey atomically under the shared shell**

Mover as duas páginas com `git mv` para o route group autenticado criado na Task 6. O layout já
envolve seus filhos com `WorkspaceShell`; não criar outro layout nem envolver as páginas novamente.

Nas duas páginas, validar `startupId` com `Number.isInteger` e `notFound()`. A Home retorna:

```tsx
return <StartupHomeScreen startupId={numericId} />;
```

A Jornada retorna:

```tsx
return <StartupJourneyScreen startupId={numericId} />;
```

Remover das páginas a verificação duplicada da cookie; o route group é a única fronteira de
autenticação. Esta ativação acontece somente depois de ambas as telas estarem livres de shell próprio.

- [ ] **Step 8: Run Journey tests and checks**

```powershell
cd apps/frontend
npm test -- src/components/journey
npm run lint
npx tsc --noEmit
```

Expected: all commands exit with code `0`.

- [ ] **Step 9: Commit the Journey unit**

```powershell
git add apps/frontend/src/components/journey apps/frontend/src/app/painel/'(workspace)'/startup/'[startupId]'/page.tsx apps/frontend/src/app/painel/'(workspace)'/startup/'[startupId]'/jornada/page.tsx
git commit -m "feat: reorganiza jornada em mestre detalhe"
```

---

### Task 6: Criar o gerenciador e a rota dedicada de criação

**Files:**

- Create: `apps/frontend/src/components/startups/startup-manager-screen.tsx`
- Create: `apps/frontend/src/components/startups/startup-manager-screen.module.css`
- Test: `apps/frontend/src/components/startups/startup-manager-screen.test.tsx`
- Create: `apps/frontend/src/app/painel/(workspace)/layout.tsx`
- Create: `apps/frontend/src/app/painel/(workspace)/startups/page.tsx`
- Create: `apps/frontend/src/app/painel/startups/nova/page.tsx`
- Create: `apps/frontend/src/components/startups/create-startup-route-screen.tsx`
- Modify: `apps/frontend/src/components/workspace/workspace-context.tsx`

**Interfaces:**

- Manager consumes `startups`, `activeStartup`, `refreshWorkspace` and `openStartup`.
- Rename uses `PATCH /api/startups/{id}`.
- Delete uses `DELETE /api/startups/{id}` and `nextStartupId`.
- Creation reuses `StartupCreationScreen.onCreated(startup, message)`.

- [ ] **Step 1: Write the failing manager test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { StartupSummary } from "@/lib/startup-types";

import { StartupManagerScreen } from "./startup-manager-screen";

const startups = [
  { id: 1, name: "Aurora", currentStageLabel: "Proposta de valor", journeyProgress: 25, lastActivityAt: "2026-07-14T10:00:00Z" },
  { id: 2, name: "Atlas", currentStageLabel: "Publico-alvo", journeyProgress: 12, lastActivityAt: "2026-07-13T10:00:00Z" },
] as StartupSummary[];

describe("StartupManagerScreen", () => {
  it("shows compact rows and requires the startup name before deletion", () => {
    render(
      <StartupManagerScreen
        activeStartupId={1}
        onDelete={vi.fn()}
        onOpen={vi.fn()}
        onRename={vi.fn()}
        startups={startups}
      />
    );

    expect(screen.getByText("Startup ativa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Excluir Aurora" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir definitivamente" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Digite Aurora para confirmar"), {
      target: { value: "Aurora" },
    });
    expect(screen.getByRole("button", { name: "Excluir definitivamente" })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run the manager test and confirm missing-component failure**

```powershell
cd apps/frontend
npm test -- src/components/startups/startup-manager-screen.test.tsx
```

Expected: FAIL because `StartupManagerScreen` does not exist.

- [ ] **Step 3: Implement the compact manager**

Cada linha deve renderizar nome, fase, barra de progresso, última atividade formatada, estado ativo e
menu de ações. A página tem um único botão principal `Criar nova startup` apontando para
`/painel/startups/nova`.

Contrato de callbacks:

```tsx
type StartupManagerScreenProps = {
  activeStartupId: number | null;
  onDelete: (startup: StartupSummary) => Promise<void>;
  onOpen: (startupId: number) => Promise<void>;
  onRename: (startup: StartupSummary, name: string) => Promise<string | null>;
  startups: StartupSummary[];
};
```

O diálogo de exclusão usa `role="dialog"`, `aria-modal="true"`, foco inicial no input, fechamento por
`Escape` e confirmação literal do nome. O texto informa que jornada, missões e evidências serão
removidas.

- [ ] **Step 4: Connect manager operations to the workspace context**

Após renomear, chamar `refreshWorkspace`. Após excluir:

```ts
const payload = (await response.json()) as StartupDeletePayload;
await refreshWorkspace();
if (startup.id === activeStartup?.id) {
  router.replace(
    payload.nextStartupId ? startupHomeHref(payload.nextStartupId) : "/painel/startups/nova"
  );
}
```

Erros permanecem na linha ou no diálogo que originou a ação; não usar alerta global genérico.

- [ ] **Step 5: Create the standalone creation route**

```tsx
"use client";

import { useRouter } from "next/navigation";

import { StartupCreationScreen } from "@/components/startup-creation-screen";
import { startupHomeHref } from "@/lib/startup-navigation";

export function CreateStartupRouteScreen() {
  const router = useRouter();
  return (
    <StartupCreationScreen
      canGoBack
      onBack={() => router.push("/painel/startups")}
      onCreated={(startup) => router.replace(startupHomeHref(startup.id))}
    />
  );
}
```

A página server-side autentica pela cookie como as demais e retorna `<CreateStartupRouteScreen />`.
Quando a conta não possui startup, o botão voltar pode permanecer disponível porque `/painel/startups`
mostrará o estado vazio com a mesma ação de criação.

- [ ] **Step 6: Create the authenticated workspace layout for the manager**

Criar o route group agora, sem mover Home ou Jornada. Assim o gerenciador usa o shell real e os
links do seletor já existem quando Home/Jornada forem integradas na Task 5:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has(AUTH_COOKIE_NAME)) redirect("/");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
```

Nesta tarefa, o route group contém somente `/painel/startups`; as páginas legadas de Home/Jornada
continuam fora dele e preservam seus shells atuais até a integração atômica da Task 5.

- [ ] **Step 7: Run manager tests and frontend checks**

```powershell
cd apps/frontend
npm test -- src/components/startups
npm run lint
npx tsc --noEmit
```

Expected: all commands exit with code `0`.

- [ ] **Step 8: Commit manager and creation routes**

```powershell
git add apps/frontend/src/components/startups apps/frontend/src/components/workspace/workspace-context.tsx apps/frontend/src/app/painel/'(workspace)'/layout.tsx apps/frontend/src/app/painel/'(workspace)'/startups/page.tsx apps/frontend/src/app/painel/startups/nova/page.tsx
git commit -m "feat: adiciona gerenciamento de startups"
```

---

### Task 7: Remover as telas provisórias, validar o produto e atualizar a documentação

**Files:**

- Delete: `apps/frontend/src/components/dashboard-screen.tsx`
- Delete: `apps/frontend/src/components/dashboard-screen.module.css`
- Delete: `apps/frontend/src/components/startup-overview-screen.tsx`
- Delete: `apps/frontend/src/components/startup-overview-screen.module.css`
- Delete: `apps/frontend/src/components/startup-today-screen.tsx`
- Delete: `apps/frontend/src/components/startup-today-screen.module.css`
- Delete: `apps/frontend/src/components/startup-detail-screen.tsx`
- Delete: `apps/frontend/src/components/startup-detail-screen.module.css`
- Modify: `Documentação/telas.md`
- Modify: `Documentação/fluxos.md`
- Modify: `Documentação/funcionalidades.md`
- Modify: `Documentação/arquitetura-missoes.md`
- Modify: `Documentação/progresso.md`
- Modify: `Documentação/proximos-passos.md`

**Interfaces:**

- Consumes: backend, rotas e componentes concluídos nas Tasks 1–6.
- Produces: workspace sem imports legados, documentação atual e evidência de verificação.

- [ ] **Step 1: Prove the legacy screens are no longer imported**

```powershell
rg -n "DashboardScreen|StartupOverviewScreen|StartupTodayScreen|StartupDetailScreen" apps/frontend/src
```

Expected: matches only inside the four legacy files. Se houver import fora deles, corrigir o destino
para `StartupHomeScreen`, `StartupJourneyScreen` ou `StartupManagerScreen` antes de excluir.

- [ ] **Step 2: Delete only the unused legacy files**

```powershell
git rm apps/frontend/src/components/dashboard-screen.tsx apps/frontend/src/components/dashboard-screen.module.css apps/frontend/src/components/startup-overview-screen.tsx apps/frontend/src/components/startup-overview-screen.module.css apps/frontend/src/components/startup-today-screen.tsx apps/frontend/src/components/startup-today-screen.module.css apps/frontend/src/components/startup-detail-screen.tsx apps/frontend/src/components/startup-detail-screen.module.css
```

- [ ] **Step 3: Run the complete automated verification**

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py makemigrations --check
.\.venv\Scripts\python.exe manage.py test -v 2

cd ..\frontend
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Expected: no pending migrations, all Django and Vitest tests pass, lint/typecheck pass and production
build exits with code `0`.

- [ ] **Step 4: Validate routes and ownership in the browser**

Com backend e frontend ligados, verificar:

1. login sem startup leva a `/painel/startups/nova`;
2. login com startups leva à mais recente;
3. seletor troca startup e a mesma abre no próximo login;
4. Home mostra missão, passos, fogo, nível, fase, atividade e desbloqueio;
5. Jornada abre a etapa atual e mantém futura bloqueada;
6. Mapa inicial edita uma seção por vez;
7. gerenciador abre, renomeia e exige confirmação para excluir;
8. exclusão ativa abre o fallback correto;
9. logout volta ao login;
10. ID pertencente a outro usuário retorna estado não encontrado sem vazar dados.

- [ ] **Step 5: Validate geometry at target viewports**

Para `1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`, confirmar:

- símbolo mede `52 x 52px`;
- `Startup` e `Quest` permanecem em duas linhas e não invadem o símbolo;
- sidebar mede `272px` ou `240px` conforme o breakpoint;
- topbar mede `72px`;
- `document.documentElement.scrollHeight === innerHeight`;
- somente `[class*="content"]` tem `scrollHeight > clientHeight` quando necessário;
- Home mantém duas colunas até o breakpoint definido;
- Jornada não corta lista, detalhe, tabs ou ação principal;
- não há scrollbar horizontal.

- [ ] **Step 6: Validate keyboard and reduced-motion behavior**

Confirmar foco visível, skip link, seletor, tabs, ações da missão, editor da Jornada e diálogo de
exclusão. Ativar `prefers-reduced-motion: reduce` e confirmar que nenhuma animação contínua permanece.

- [ ] **Step 7: Update durable documentation**

Registrar exatamente:

- `telas.md`: Home, Jornada, Gerenciamento e módulos desabilitados;
- `fluxos.md`: login, resolução recente, troca, criação e exclusão;
- `funcionalidades.md`: escopo global/local da gamificação;
- `arquitetura-missoes.md`: interação entre missão, passos, evidência, aprendizado e XP;
- `progresso.md`: arquivos, testes, resoluções e resultado final;
- `proximos-passos.md`: Missões completas, Experimentos, Aprendizados, Métricas, Documentos e
  Conquistas como ciclos posteriores.

- [ ] **Step 8: Review the final diff for unrelated files**

```powershell
git status --short
git diff --check
git diff --stat
```

Expected: no whitespace errors; only files named in this plan are staged for the final commit. Any
pre-existing unrelated modification remains unstaged and untouched.

- [ ] **Step 9: Commit cleanup and documentation**

```powershell
git add Documentação/telas.md Documentação/fluxos.md Documentação/funcionalidades.md Documentação/arquitetura-missoes.md Documentação/progresso.md Documentação/proximos-passos.md
git diff --cached --name-only
git commit -m "docs: conclui workspace principal da plataforma"
```

---

## Self-review

### Spec coverage

- entrada pela última startup: Tasks 1 e 2;
- startup vazia e criação dedicada: Tasks 2 e 6;
- shell, rolagem, logo e navegação: Task 3;
- Home orientada pela missão e gamificação contextual: Task 4;
- Jornada mestre-detalhe e Mapa inicial: Task 5;
- seletor, renomear, excluir e fallback: Tasks 3 e 6;
- estados de carregamento, erro, bloqueio e sessão: Tasks 2–6;
- acessibilidade, resoluções e redução de movimento: Tasks 3–7;
- retirada das telas provisórias e documentação: Task 7.

### Type consistency

- `lastOpenedAt`, `lastActivityAt` e `nextStartupId` nascem no backend da Task 1 e entram nos tipos da
  Task 2 antes de serem consumidos pelo provider e gerenciador;
- `startupHomeHref` e `startupJourneyHref` são definidos na Task 2 e usados nas Tasks 3, 5 e 6;
- `WorkspaceProvider` é definido na Task 3 e consumido pelo gerenciador da Task 6;
- Home usa `TodayPayload` existente; Jornada usa `JourneyPayload` existente;
- nenhuma rota funcional aponta para um componente removido na Task 7.

### Scope control

- não inclui implementação completa de módulos futuros;
- não altera o modelo de gamificação existente além de sua apresentação;
- não redesenha login, onboarding ou símbolo;
- não cria dependência visual externa;
- Vitest e Testing Library entram somente para tornar os novos componentes verificáveis.
