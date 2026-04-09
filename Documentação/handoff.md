# Handoff do Projeto

## Dados principais

- repositorio: [onlyteteu/TCC](https://github.com/onlyteteu/TCC)
- branch principal: `main`
- ultimo commit conhecido: `17c7ab6`
- data deste handoff: `2026-04-09`

## Objetivo do projeto

Plataforma digital de apoio a criacao e estruturacao inicial de startups.
O foco do produto esta na jornada inicial do empreendedor, com organizacao,
acompanhamento de etapas, progresso e elementos de gamificacao.

## Stack atual

- frontend: Next.js 16 + React 19 + TypeScript
- backend: Django 5.2 + Python 3.12+
- banco: PostgreSQL 17
- infraestrutura local: Docker Desktop + WSL

## Estado atual da implementacao

O projeto ja possui uma base tecnica funcional para continuar o desenvolvimento:

- monorepo com `apps/frontend` e `apps/backend`
- frontend em Next.js configurado, compilando e com tela real de autenticacao
- homepage principal agora dedicada ao fluxo de login/cadastro
- pagina institucional anterior preservada em `/sobre`
- fluxo real de criacao da startup em `/painel` para contas sem startup
- visao interna inicial de startups para contas que ja criaram ao menos uma
- backend Django configurado e validado
- endpoint de saude em `/api/health/`
- endpoints de autenticacao em `/api/auth/register/`, `/api/auth/login/`, `/api/auth/me/` e `/api/auth/logout/`
- endpoints de startups em `/api/startups/` e `/api/startups/create/`
- modelo `Startup` agora vinculado ao usuario autenticado
- migrations do app `startups` criadas e aplicadas
- `docker-compose.yml` pronto para subir o PostgreSQL
- documentacao centralizada na pasta `Documentação`

## Estado atual do design

O fluxo de login/cadastro ja foi implementado no frontend seguindo os mockups aprovados.

- referencia de login aprovada: [login-cadastro-v9.png](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\mockups\login-cadastro-v9.png)
- referencia de cadastro aprovada: [login-cadastro-v10.png](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\mockups\login-cadastro-v10.png)
- referencia aprovada de criar startup: [criar-startup-v1.png](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\mockups\criar-startup-v1.png)
- arquivos editaveis locais: [login-cadastro-v9.svg](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\mockups\login-cadastro-v9.svg) e [login-cadastro-v10.svg](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\mockups\login-cadastro-v10.svg)
- direcao implementada: fundo premium quente, bloco central flutuante, visual gamer/premium e logo com respiracao sutil

## Documentacao importante

Ler primeiro estes arquivos antes de continuar:

- [README.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\README.md)
- [visao-geral.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\visao-geral.md)
- [arquitetura.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\arquitetura.md)
- [telas.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\telas.md)
- [decisoes.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\decisoes.md)
- [progresso.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\progresso.md)
- [proximos-passos.md](C:\Users\mateu\OneDrive\Desktop\TCC-main\Documentação\proximos-passos.md)

## Como continuar em outro PC

### 1. Clonar o repositorio

```powershell
git clone https://github.com/onlyteteu/TCC.git
cd TCC
```

### 2. Preparar o ambiente

Instalar:

- Python 3.12 ou 3.13
- Node.js LTS
- WSL
- Docker Desktop

### 3. Subir o banco

```powershell
docker compose up -d postgres
```

### 4. Backend

```powershell
cd apps/backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

### 5. Frontend

Em outro terminal:

```powershell
cd apps/frontend
npm.cmd install
npm.cmd run dev
```

## Validacoes que ja passaram

- `npm.cmd run lint`
- `npm.cmd run build`
- `.\.venv\Scripts\python.exe manage.py check`
- `.\.venv\Scripts\python.exe manage.py test accounts startups`
- `.\.venv\Scripts\python.exe manage.py migrate`
- fluxo real validado de cadastro, login, consulta de sessao e criacao de startup via `http://127.0.0.1:3000/api/*`

## Proximo passo recomendado

O caminho mais coerente agora e:

1. criar o fluxo autenticado de cadastro da startup
2. permitir editar e renomear a startup depois da criacao inicial
3. evoluir o painel inicial para um dashboard de progresso real
4. iniciar a jornada guiada a partir da startup cadastrada

## Observacoes importantes

- a documentacao do TCC deve continuar sendo atualizada junto com o codigo
- decisoes relevantes nao devem ficar apenas implicitas na implementacao
- o escopo continua focado na estruturacao inicial da startup, sem CRM e sem gestao financeira avancada
