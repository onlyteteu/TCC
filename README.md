# Startup Quest

Projeto de TCC do curso de Gestão da Informação da UFG.

A Startup Quest é uma plataforma guiada e gamificada para ajudar empreendedores iniciantes a
estruturar, validar e administrar a evolução de uma startup. O produto transforma a pergunta
`o que eu faço agora?` em missões concretas, evidências, aprendizados, decisões e progresso visível.

## Stack

- frontend: Next.js 16.2, React 19 e TypeScript;
- backend: Django 5.2 e Python 3.12+;
- banco: PostgreSQL 17;
- testes: Vitest, Testing Library e Django TestCase;
- ambiente local: PowerShell e Docker Desktop.

## Estado atual

Em 21 de julho de 2026, o projeto possui:

- autenticação e sessão reais;
- criação guiada da startup em cinco etapas;
- workspace autenticado com sidebar e topbar compartilhadas;
- abertura automática da startup usada mais recentemente;
- Home orientada por missão;
- Central de missão e cinco missões operacionais do primeiro arco;
- missão de cinco entrevistas com evidências e aprendizado;
- XP, nível, sequência e atividade baseados em ações significativas;
- Jornada com oito etapas e Mapa inicial editável;
- criação, troca, renomeação e exclusão de startups;
- frontend e backend cobertos por testes automatizados;
- documentação de produto, arquitetura, decisões, design e progresso.

O primeiro incremento do `Motor de Missões 2.0` está implementado. A próxima evolução de produto
aprovada é o redesenho da Jornada como `Mapa de Capítulos`, ainda não implementado. Ele organizará
as oito etapas existentes em Fundamento, Proposta, Validação e Construção, mantendo a execução em
Missões. Consulte a
[especificação da Jornada](Documentação/design/2026-07-21-jornada-mapa-capitulos.md).

## Estrutura do repositório

- `apps/frontend`: aplicação web em Next.js;
- `apps/backend`: API e domínio em Django;
- `Documentação`: base documental do projeto e do TCC;
- `docker-compose.yml`: PostgreSQL local;
- `LIGAR-TUDO.cmd` e `start.ps1`: inicialização integrada do ambiente.

## Como executar

O caminho recomendado no Windows é executar, na raiz:

```powershell
.\LIGAR-TUDO.cmd
```

O script sobe ou reutiliza os serviços e abre `http://127.0.0.1:3000`.

### Execução manual

Banco:

```powershell
docker compose up -d postgres
```

Backend:

```powershell
cd apps/backend
py -3.12 -m venv .venv
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

Para apontar o frontend para outro backend, use `apps/frontend/.env.local.example` como referência.

## Testes e verificações

Backend:

```powershell
cd apps/backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts startups
```

Frontend:

```powershell
cd apps/frontend
npm.cmd test -- --maxWorkers=1
npm.cmd run lint
npm.cmd run build
```

## Documentação

Comece por:

- [PRODUCT.md](PRODUCT.md): visão de produto e princípios;
- [visão geral](Documentação/visao-geral.md);
- [funcionalidades](Documentação/funcionalidades.md): estado implementado;
- [arquitetura](Documentação/arquitetura.md);
- [decisões](Documentação/decisoes.md);
- [progresso](Documentação/progresso.md);
- [próximos passos](Documentação/proximos-passos.md);
- [handoff](Documentação/handoff.md).

As especificações de design ficam em `Documentação/design`. Uma especificação aprovada só deve ser
marcada como funcionalidade implementada depois de código, migrations, estados, testes e validação.

## Regra de desenvolvimento

Decisões importantes de produto, arquitetura, fluxo, interface e funcionalidade não devem ficar
somente no código. A documentação correspondente deve ser atualizada no mesmo ciclo da mudança.
