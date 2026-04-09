# Plataforma de Apoio a Criacao de Startups

Projeto de TCC do curso de Gestao da Informacao da UFG.

## Visao geral

Este projeto propoe uma plataforma digital para apoiar a estruturacao inicial de startups.
O foco nao esta na gestao empresarial completa, mas em ajudar o usuario a organizar a ideia,
entender a etapa atual da jornada, visualizar progresso e receber direcionamento sobre os
proximos passos.

## Stack atual

- frontend: Next.js 16 + React 19 + TypeScript
- backend: Django 5.2 + Python 3.12+
- banco de dados: PostgreSQL 17
- versionamento: Git

## Estado atual

Na data de 2026-04-09, o projeto ja possui uma base tecnica funcional para continuar o produto:

- monorepo com `apps/frontend` e `apps/backend`
- tela real de login/cadastro no frontend com visual inspirado nos mockups aprovados
- fluxo real de criacao da startup em `/painel` para contas sem startup
- visao interna inicial de startups ja criadas para contas autenticadas
- backend Django com endpoint de saude em `/api/health/`
- backend Django com autenticacao em `/api/auth/register/`, `/api/auth/login/` e `/api/auth/me/`
- backend Django com API de startups em `/api/startups/` e `/api/startups/create/`
- modelo inicial `Startup`
- startup vinculada ao usuario autenticado
- migrations do modulo `startups` aplicadas
- `docker-compose.yml` para PostgreSQL
- PostgreSQL local em container com status saudavel
- migrations aplicadas com sucesso no banco
- documentacao do TCC organizada e atualizada

## Estrutura do repositorio

- `apps/frontend`: aplicacao web em Next.js
- `apps/backend`: backend em Django
- `Documentação`: base documental do TCC
- `docker-compose.yml`: infraestrutura inicial do PostgreSQL

## Como executar

### Frontend

1. Entrar em `apps/frontend`
2. Executar `npm.cmd install`
3. Executar `npm.cmd run dev`
4. Acessar `http://127.0.0.1:3000`

### Backend

1. Entrar em `apps/backend`
2. Executar `py -3.13 -m venv .venv` se o ambiente virtual ainda nao existir
3. Executar `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`
4. Executar `.\.venv\Scripts\python.exe manage.py runserver`

### Banco de dados

1. Subir o PostgreSQL com `docker compose up -d postgres`
2. No backend, executar `.\.venv\Scripts\python.exe manage.py migrate`

### Variaveis de ambiente do frontend

Use o exemplo em `apps/frontend/.env.local.example` quando quiser apontar o frontend para um
backend diferente do padrao local:

- `BACKEND_API_BASE_URL=http://127.0.0.1:8000/api`

## Estrutura da documentacao

A documentacao do TCC fica concentrada na pasta [Documentação](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação).

- [visao-geral.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\visao-geral.md)
- [funcionalidades.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\funcionalidades.md)
- [arquitetura.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\arquitetura.md)
- [fluxos.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\fluxos.md)
- [telas.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\telas.md)
- [decisoes.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\decisoes.md)
- [progresso.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\progresso.md)
- [proximos-passos.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\proximos-passos.md)
- [handoff.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\handoff.md)

## Regra de desenvolvimento

Nenhuma decisao importante de produto, arquitetura, fluxo, interface ou funcionalidade deve ficar
apenas no codigo. Sempre que algo relevante for implementado ou alterado, a documentacao
correspondente deve ser atualizada no mesmo ciclo de trabalho.
