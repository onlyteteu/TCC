# Arquitetura

## Estado atual

Na data de 2026-04-08, a arquitetura conceitual foi convertida em uma base tecnica inicial ja
implementada no repositorio.

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

### `startups`

Responsavel pela primeira entidade de dominio do projeto, `Startup`.

## Entidade inicial implementada

### Startup

Campos atuais:

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

O frontend possui uma homepage inicial em `app router`, criada para:

- apresentar a proposta da plataforma
- comunicar o recorte do TCC
- servir como ponto de partida visual do produto

## Infraestrutura inicial

- `docker-compose.yml` com servico `postgres`
- configuracoes de ambiente para frontend e backend
- `.gitignore`, `.editorconfig` e `.gitattributes`

## O que foi deixado de fora neste ciclo

- autenticacao
- API completa de cadastro da startup
- dashboard funcional
- jornada guiada interativa
- DRF
- containers de frontend e backend

## Decisoes em aberto

- autenticacao e autorizacao
- formato da API de aplicacao
- estrategia de deploy
- aprofundamento do modelo de dados para jornada e progresso
