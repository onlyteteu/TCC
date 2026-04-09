# Arquitetura

## Estado atual

Na data de 2026-04-09, a arquitetura conceitual ja avancou para uma base tecnica funcional com
autenticacao real e primeiro fluxo de startups entre frontend e backend.

## Stack definida

- frontend: Next.js 16.2.2 com React 19 e TypeScript
- backend: Django 5.2.13 com Python 3.12
- banco de dados: PostgreSQL 17 via `docker-compose.yml`

## Objetivo arquitetural

Construir uma base organizada e escalavel para sustentar:

- jornada guiada
- cadastro estruturado da startup
- acompanhamento de progresso
- gamificacao leve
- crescimento futuro sem descaracterizar o recorte do TCC

## Principios tecnicos

- separacao clara entre frontend e backend
- modularidade
- baixo acoplamento
- clareza entre dominio e interface
- facilidade de evolucao
- consistencia entre codigo e documentacao

## Estrutura do repositorio

- `apps/frontend`: camada de apresentacao em Next.js
- `apps/backend`: backend, dominio e acesso a dados em Django
- `Documentação`: documentacao funcional, arquitetural e decisoria do TCC
- `docker-compose.yml`: provisionamento inicial do PostgreSQL

## Modulos atuais do backend

### `core`

Responsavel pelo endpoint inicial de saude da aplicacao em `/api/health/`.

### `accounts`

Responsavel pelo fluxo de autenticacao da plataforma:

- cadastro de conta
- login
- validacao de sessao
- encerramento de sessao

### `startups`

Responsavel pela primeira entidade de dominio do projeto, `Startup`, e pelo fluxo inicial de:

- listagem das startups do usuario autenticado
- criacao da startup
- associacao entre startup e conta autenticada

## Entidade inicial implementada

### Startup

Campos atuais:

- `owner`
- `name`
- `description`
- `segment`
- `current_stage`
- `initial_goal`
- `created_at`
- `updated_at`

### Problema que resolve

Cria a primeira estrutura persistente alinhada ao objetivo da plataforma: registrar a startup que
sera acompanhada ao longo da jornada.

### Relacao com o objetivo do projeto

Sem a entidade de startup, nao existe base para cadastro, progresso ou jornada guiada.

## Frontend inicial implementado

O frontend possui:

- tela principal de login/cadastro em `app router`
- rotas internas em `app/api/auth` para conversar com o backend Django
- rota interna em `app/api/startups` para conversar com a API de startups
- fluxo interno em `/painel` que decide entre criar a startup ou mostrar as startups ja criadas
- pagina institucional anterior preservada em `/sobre`

### Tela principal de autenticacao

Foi criada para:

- materializar os mockups aprovados de login e cadastro
- manter a identidade futurista e gamificada
- servir como ponto de entrada real da plataforma

### Integracao com o backend

O frontend usa rotas internas do Next.js para:

- enviar login e cadastro ao Django
- armazenar a sessao em cookie HTTP-only
- validar o usuario autenticado antes de abrir o painel
- listar startups da conta autenticada
- criar a startup a partir da tela real de onboarding interno

## Infraestrutura inicial

- `docker-compose.yml` com servico `postgres`
- configuracoes de ambiente para frontend e backend
- `.gitignore`, `.editorconfig` e `.gitattributes`

## O que foi deixado de fora neste ciclo

- edicao completa da startup
- dashboard funcional completo
- jornada guiada interativa
- DRF
- containers de frontend e backend

## Decisoes em aberto

- formato da API de aplicacao
- estrategia de deploy
- aprofundamento do modelo de dados para jornada e progresso
- aprofundamento da autorizacao por funcionalidades internas
