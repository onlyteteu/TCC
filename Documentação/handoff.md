# Handoff do projeto

Data de revisão: 15 de julho de 2026

## Dados principais

- repositório: [onlyteteu/TCC](https://github.com/onlyteteu/TCC)
- branch principal: `main`
- aplicação: Startup Quest
- diretório local atual: `C:\Users\mateu\OneDrive\Desktop\TCC\repo`
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
- gerenciador em `/painel/startups`;
- criação em `/painel/startups/nova`;
- sidebar, topbar, seletor, nível, sequência e perfil compartilhados;
- rolagem restrita à área de conteúdo e scrollbars integradas à paleta.

### Home e primeira missão

- missão `Converse com 5 potenciais clientes`;
- registro de entrevistas como evidências;
- síntese de aprendizado após cinco entrevistas;
- conclusão transacional e idempotente;
- XP, nível, sequência, atividade recente e conquistas derivadas de eventos reais.

### Jornada e startups

- oito etapas de Jornada;
- etapas concluídas, atual e bloqueadas;
- Mapa inicial editável;
- troca, renomeação, criação e exclusão confirmada de startups;
- isolamento dos dados entre contas e startups.

## Próxima evolução aprovada

O próximo ciclo é o `Motor de Missões 2.0`.

Direções aprovadas:

- catálogo curado e versionado;
- recomendação determinística e explicável;
- uma missão principal recomendada;
- missões opcionais e semanais quando existirem de verdade;
- pré-requisitos verificáveis;
- trilha inicial de 10 missões, da descoberta ao recorte do MVP;
- tela de Missões no formato `Central de missão`;
- arquitetura preparada para missões dinâmicas futuras;
- entrega em três incrementos: descoberta, experimentos/decisões e MVP/gestão semanal.

A especificação está em
[2026-07-15-motor-missoes-2.md](design/2026-07-15-motor-missoes-2.md). Ela deve ser revisada pelo
usuário antes da criação do plano técnico e antes de qualquer implementação do Motor 2.0.

## Estado da documentação

Fontes principais:

- [PRODUCT.md](../PRODUCT.md): propósito, posicionamento e princípios;
- [especificacao-plataforma.md](especificacao-plataforma.md): visão ampla da plataforma;
- [funcionalidades.md](funcionalidades.md): o que está implementado;
- [arquitetura.md](arquitetura.md): arquitetura geral;
- [arquitetura-missoes.md](arquitetura-missoes.md): primeiro ciclo operacional de missões;
- [fluxos.md](fluxos.md): fluxos de uso;
- [telas.md](telas.md): inventário de telas;
- [decisoes.md](decisoes.md): decisões registradas;
- [progresso.md](progresso.md): histórico de evolução e validações;
- [proximos-passos.md](proximos-passos.md): ordem dos próximos ciclos;
- [design/2026-07-14-workspace-principal-startup-quest.md](design/2026-07-14-workspace-principal-startup-quest.md): workspace aprovado;
- [design/2026-07-15-motor-missoes-2.md](design/2026-07-15-motor-missoes-2.md): próxima evolução.

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

Na última validação completa anterior a esta especificação, o frontend possuía `75/75` testes
aprovados, além de lint e build aprovados. Esse número é histórico e deve ser atualizado após novas
implementações.

## Cuidados para continuar

- confirmar o repositório e a branch antes de editar;
- não tratar Missões 2.0 como implementado enquanto código, migrations, estados e testes não existirem;
- preservar compatibilidade com startups e missões já criadas;
- manter Home, Central e Jornada com responsabilidades distintas;
- não conceder XP por login, abertura de tela ou clique sem trabalho real;
- não habilitar módulos futuros com páginas vazias;
- atualizar documentação e testes no mesmo ciclo da implementação;
- validar visualmente nas resoluções desktop definidas nas especificações;
- enviar as mudanças ao GitHub somente depois das verificações relevantes.
