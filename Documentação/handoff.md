# Handoff do projeto

Data de revisão: 20 de julho de 2026

## Dados principais

- repositório: [onlyteteu/TCC](https://github.com/onlyteteu/TCC)
- branch principal: `main`
- aplicação: Startup Quest
- diretório local atual: `C:\Users\mateu\OneDrive\Área de Trabalho\TCC`
- comando recomendado para iniciar o ambiente local: `LIGAR-TUDO.cmd`

O hash não é fixado neste documento. Use `git log -1 --oneline` para consultar a revisão atual.

## Objetivo atual do produto

A Startup Quest é uma plataforma guiada e gamificada para empreendedores iniciantes. Sua função
principal é transformar a dúvida `o que eu faço agora?` em trabalho concreto, verificável e conectado
à evolução real da startup.

O produto não deve terminar depois da fundação. A visão aprovada combina:

- estruturação inicial;
- missões e tarefas;
- evidências e entrevistas;
- experimentos e aprendizados;
- decisões e métricas;
- documentos vivos;
- metas e revisão semanal;
- gamificação baseada em trabalho real.

## Stack

- frontend: Next.js 16.2 + React 19 + TypeScript;
- testes do frontend: Vitest e Testing Library;
- backend: Django 5.2 + Python 3.12+;
- banco: PostgreSQL 17;
- execução local: PowerShell, Docker Desktop e scripts do repositório.

## Estado funcional atual

### Autenticação e fundação

- cadastro, login, perfil e logout reais;
- sessão por cookie HTTP-only no frontend e token assinado no backend;
- criação da startup em cinco etapas;
- nome opcional e Mapa inicial com ideia, segmento, problema e público.

### Workspace

- `/painel` resolve a startup usada mais recentemente;
- Home em `/painel/startup/[id]`;
- Jornada em `/painel/startup/[id]/jornada`;
- Central em `/painel/startup/[id]/missoes`;
- detalhe em `/painel/startup/[id]/missoes/[missionKey]`;
- gerenciador em `/painel/startups`;
- criação em `/painel/startups/nova`;
- sidebar, topbar, seletor, nível, sequência e perfil compartilhados;
- rolagem restrita à área de conteúdo e scrollbars integradas à paleta.

### Home e Motor de Missões 2.0 — Incremento 1

- catálogo versionado com cinco missões operacionais;
- recomendação determinística compartilhada por Home e Central;
- pré-requisitos e motivos de bloqueio derivados pelo backend;
- missão `Converse com 5 potenciais clientes` mantida na Home;
- registro de entrevistas como evidências;
- síntese de aprendizado após cinco entrevistas;
- formulários estruturados para problema, público, proposta de valor e alternativas;
- conclusão, submissão e XP transacionais e idempotentes;
- missões de problema e público atualizam Startup, Jornada e Mapa inicial;
- proposta atualiza e conclui sua etapa quando ela é a atual;
- arco concluído possui estado honesto, sem falso bloqueio;
- XP, nível, sequência, atividade recente e conquistas derivadas de eventos reais.

### Jornada e startups

- oito etapas de Jornada;
- etapas concluídas, atual e bloqueadas;
- Mapa inicial editável;
- troca, renomeação, criação e exclusão confirmada de startups;
- isolamento dos dados entre contas e startups.

## Próxima evolução recomendada

O Incremento 1 do `Motor de Missões 2.0` está implementado. Antes de ampliar o catálogo, validar
o arco atual com usuários e observar compreensão, abandono e qualidade das respostas. Depois
disso, o próximo plano recomendado é o Incremento 2: missões 6 a 8, Experimentos, Decisões e
biblioteca consultável de Aprendizados. Missões 9 e 10, recorte do MVP e gestão semanal permanecem
no Incremento 3.

A especificação completa está em
[2026-07-15-motor-missoes-2.md](design/2026-07-15-motor-missoes-2.md).

## Estado da documentação

Fontes principais:

- [PRODUCT.md](../PRODUCT.md): propósito, posicionamento e princípios;
- [especificacao-plataforma.md](especificacao-plataforma.md): visão ampla da plataforma;
- [funcionalidades.md](funcionalidades.md): o que está implementado;
- [arquitetura.md](arquitetura.md): arquitetura geral;
- [arquitetura-missoes.md](arquitetura-missoes.md): Motor 2.0 e primeiro incremento operacional;
- [fluxos.md](fluxos.md): fluxos de uso;
- [telas.md](telas.md): inventário de telas;
- [decisoes.md](decisoes.md): decisões registradas;
- [progresso.md](progresso.md): histórico de evolução e validações;
- [proximos-passos.md](proximos-passos.md): ordem dos próximos ciclos;
- [design/2026-07-14-workspace-principal-startup-quest.md](design/2026-07-14-workspace-principal-startup-quest.md): workspace aprovado;
- [design/2026-07-15-motor-missoes-2.md](design/2026-07-15-motor-missoes-2.md): especificação dos três incrementos.

`funcionalidades.md` deve continuar sendo a fonte do estado real. Uma especificação não transforma
uma funcionalidade em implementada.

## Como executar localmente

### Caminho recomendado

Na raiz do repositório, execute:

```powershell
.\LIGAR-TUDO.cmd
```

O script prepara ou reutiliza o backend, limpa cache obsoleto do Next.js quando necessário, inicia o
frontend e abre a aplicação em `http://127.0.0.1:3000`.

### Execução manual

Banco:

```powershell
docker compose up -d postgres
```

Backend:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Frontend, em outro terminal:

```powershell
cd apps/frontend
npm.cmd install
npm.cmd run dev
```

## Validação de referência

Antes de declarar uma entrega concluída, executar de acordo com o escopo:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts startups

cd ..\frontend
npm.cmd test -- --maxWorkers=1
npm.cmd run lint
npm.cmd run build
```

Validação completa de 20 de julho de 2026:

- `makemigrations --check --dry-run`: nenhuma mudança pendente;
- `manage.py check`: sem problemas;
- backend: `71/71` testes aprovados;
- frontend: `102/102` testes em 24 arquivos aprovados;
- TypeScript e ESLint: aprovados;
- build Next.js 16.2.10: aprovado, com 12 páginas geradas e as rotas de Central/detalhe listadas.

A suíte frontend ainda imprime o aviso conhecido do jsdom `Not implemented: navigation to
another Document`, sem falha e com código de saída 0. A inspeção visual manual final nos quatro
viewports desktop continua uma checagem de aceitação separada.

## Cuidados para continuar

- confirmar o repositório e a branch antes de editar;
- não tratar os Incrementos 2 e 3 como implementados;
- preservar compatibilidade com startups e missões já criadas;
- manter Home, Central e Jornada com responsabilidades distintas;
- não conceder XP por login, abertura de tela ou clique sem trabalho real;
- não habilitar módulos futuros com páginas vazias;
- atualizar documentação e testes no mesmo ciclo da implementação;
- validar visualmente nas resoluções desktop definidas nas especificações;
- enviar as mudanças ao GitHub somente depois das verificações relevantes.
