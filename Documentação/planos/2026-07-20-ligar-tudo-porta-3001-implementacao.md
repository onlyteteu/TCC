# LIGAR-TUDO na porta 3001 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer `LIGAR-TUDO.cmd` iniciar a plataforma de forma confiável com frontend fixo em `3001` e backend corretamente configurado em `/api`.

**Architecture:** `start.ps1` continua orquestrando Docker, PostgreSQL, Django e Next.js. A mudança centraliza as portas em variáveis, valida a propriedade dos listeners antes de encerrá-los e injeta a URL completa do backend no processo do frontend.

**Tech Stack:** PowerShell 5.1, Docker Compose, Django 5.2, Next.js 16 e Windows.

## Global Constraints

- Frontend fixo em `127.0.0.1:3001`.
- Backend fixo em `127.0.0.1:8000` com prefixo `/api` no proxy.
- Nunca encerrar processo que não pertença a este repositório.
- Preservar `apps/frontend/next-env.d.ts` fora do commit.

---

### Task 1: Corrigir e validar o launcher local

**Files:**

- Create: `scripts/test-startup-launcher.ps1`
- Modify: `start.ps1`

**Interfaces:**

- Consumes: portas `8000`, `3001`, caminhos `$Backend` e `$Frontend`.
- Produces: frontend em `http://127.0.0.1:3001` com `BACKEND_API_BASE_URL=http://127.0.0.1:8000/api`.

- [x] **Step 1: Escrever o teste de contrato do launcher**

O script deve carregar `start.ps1` como texto e falhar enquanto ele ainda apontar o frontend para
`3000`, não definir a URL `/api` ou não verificar a porta `3001`.

- [x] **Step 2: Executar o teste e confirmar RED**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-startup-launcher.ps1`

Expected: falha indicando que o launcher ainda não fixa a porta `3001`.

- [x] **Step 3: Implementar a mudança mínima**

Definir `$BackendPort = 8000`, `$FrontendPort = 3001`, `$BackendApiBaseUrl` com `/api`, usar essas
variáveis nos listeners, mensagens, processo do Next.js, esperas HTTP e abertura do navegador.

- [x] **Step 4: Executar o teste e confirmar GREEN**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-startup-launcher.ps1`

Expected: todos os contratos do launcher aprovados.

- [x] **Step 5: Validar a execução real**

Encerrar apenas os processos atuais deste projeto, executar `start.ps1` e confirmar:

```text
http://127.0.0.1:3001/ -> 200
http://127.0.0.1:8000/api/health/ -> 200
```

Também confirmar que uma rota autenticada do proxy não retorna `404` do Django por ausência de
`/api`.

- [x] **Step 6: Executar verificações e commitar**

Run: `git diff --check`

Stage somente `start.ps1`, o teste e estes documentos; excluir `next-env.d.ts`. Commit sugerido:
`fix: estabiliza launcher local na porta 3001`.

## Resultado da execução

- `http://127.0.0.1:3001/`: `200`.
- `http://127.0.0.1:3001/painel`: `200`.
- CSS do Next.js: dois arquivos carregados com `200`.
- `http://127.0.0.1:8000/api/health/`: `200`.
- `/api/startups` pelo proxy: `401` JSON sem sessão, confirmando que a chamada chegou ao endpoint
  correto sob `/api` e não ao antigo `/startups/` que retornava `404`.
- Segunda execução consecutiva: frontend próprio identificado, cache limpo e servidor reiniciado
  em `3001` sem tocar no serviço da porta `3000`.
- Docker Compose usa o nome fixo `tcc`, evitando tentativa de criar outro `tcc-postgres` quando o
  launcher é validado em um worktree.
