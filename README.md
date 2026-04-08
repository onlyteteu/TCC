# Plataforma de Apoio a Criacao de Startups

Projeto de TCC do curso de Gestao da Informacao da UFG.

## Visao geral

Este projeto propoe uma plataforma digital para apoiar a estruturacao inicial de startups.
O foco nao esta na gestao empresarial completa, mas em ajudar o usuario a organizar a ideia,
entender a etapa atual da jornada, visualizar progresso e receber direcionamento sobre os
proximos passos.

## Stack atual

- frontend: Next.js 16 + React 19 + TypeScript
- backend: Django 5.2 + Python 3.12
- banco de dados: PostgreSQL 17
- versionamento: Git

## Estado atual

Na data de 2026-04-08, o projeto ja possui uma base tecnica inicial implementada:

- monorepo com `apps/frontend` e `apps/backend`
- homepage inicial no frontend
- backend Django com endpoint de saude em `/api/health/`
- modelo inicial `Startup`
- migration inicial do modulo `startups`
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

### Backend

1. Entrar em `apps/backend`
2. Executar `py -3.12 -m pip install -r requirements.txt`
3. Executar `py -3.12 manage.py runserver`

### Banco de dados

1. Subir o PostgreSQL com `docker compose up -d postgres`
2. No backend, executar `py -3.12 manage.py migrate`

## Estrutura da documentacao

A documentacao do TCC fica concentrada na pasta [Documentação](C:\Users\PROEC\Desktop\TCC\Documentação).

- [visao-geral.md](C:\Users\PROEC\Desktop\TCC\Documentação\visao-geral.md)
- [funcionalidades.md](C:\Users\PROEC\Desktop\TCC\Documentação\funcionalidades.md)
- [arquitetura.md](C:\Users\PROEC\Desktop\TCC\Documentação\arquitetura.md)
- [fluxos.md](C:\Users\PROEC\Desktop\TCC\Documentação\fluxos.md)
- [telas.md](C:\Users\PROEC\Desktop\TCC\Documentação\telas.md)
- [decisoes.md](C:\Users\PROEC\Desktop\TCC\Documentação\decisoes.md)
- [progresso.md](C:\Users\PROEC\Desktop\TCC\Documentação\progresso.md)
- [proximos-passos.md](C:\Users\PROEC\Desktop\TCC\Documentação\proximos-passos.md)

## Regra de desenvolvimento

Nenhuma decisao importante de produto, arquitetura, fluxo, interface ou funcionalidade deve ficar
apenas no codigo. Sempre que algo relevante for implementado ou alterado, a documentacao
correspondente deve ser atualizada no mesmo ciclo de trabalho.
