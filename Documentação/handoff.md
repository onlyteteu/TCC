# Handoff do Projeto

## Dados principais

- repositorio: [onlyteteu/TCC](https://github.com/onlyteteu/TCC)
- branch principal: `main`
- ultimo commit conhecido: `b50f58f`
- data deste handoff: `2026-04-08`

## Objetivo do projeto

Plataforma digital de apoio a criacao e estruturacao inicial de startups.
O foco do produto esta na jornada inicial do empreendedor, com organizacao,
acompanhamento de etapas, progresso e elementos de gamificacao.

## Stack atual

- frontend: Next.js 16 + React 19 + TypeScript
- backend: Django 5.2 + Python 3.12
- banco: PostgreSQL 17
- infraestrutura local: Docker Desktop + WSL

## Estado atual da implementacao

O projeto ja possui uma base tecnica funcional para continuar o desenvolvimento:

- monorepo com `apps/frontend` e `apps/backend`
- frontend inicial em Next.js configurado e compilando
- backend Django configurado e validado
- endpoint de saude em `/api/health/`
- modelo inicial `Startup` criado
- migration inicial do app `startups` criada e aplicada
- `docker-compose.yml` pronto para subir o PostgreSQL
- documentacao centralizada na pasta `Documentacao`

## Estado atual do design

A tela de login/cadastro esta em fase de mockup, sem implementacao real no frontend ainda.

- versao visual mais recente: [login-cadastro-v9.png](C:\Users\PROEC\Desktop\TCC\Documentação\mockups\login-cadastro-v9.png)
- arquivo editavel local: [login-cadastro-v9.svg](C:\Users\PROEC\Desktop\TCC\Documentação\mockups\login-cadastro-v9.svg)
- direcao aprovada ate aqui: fundo premium quente, bloco central flutuante, visual mais moderno/gamer/premium

## Documentacao importante

Ler primeiro estes arquivos antes de continuar:

- [README.md](C:\Users\PROEC\Desktop\TCC\README.md)
- [visao-geral.md](C:\Users\PROEC\Desktop\TCC\Documentação\visao-geral.md)
- [arquitetura.md](C:\Users\PROEC\Desktop\TCC\Documentação\arquitetura.md)
- [telas.md](C:\Users\PROEC\Desktop\TCC\Documentação\telas.md)
- [decisoes.md](C:\Users\PROEC\Desktop\TCC\Documentação\decisoes.md)
- [progresso.md](C:\Users\PROEC\Desktop\TCC\Documentação\progresso.md)
- [proximos-passos.md](C:\Users\PROEC\Desktop\TCC\Documentação\proximos-passos.md)

## Como continuar em outro PC

### 1. Clonar o repositorio

```powershell
git clone https://github.com/onlyteteu/TCC.git
cd TCC
```

### 2. Preparar o ambiente

Instalar:

- Python 3.12
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
py -3.12 -m pip install -r requirements.txt
py -3.12 manage.py migrate
py -3.12 manage.py runserver
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
- `py -3.12 manage.py check`
- `py -3.12 manage.py migrate`

## Proximo passo recomendado

O caminho mais coerente agora e:

1. aprovar a direcao final do mockup da tela de login/cadastro
2. implementar essa tela no frontend em Next.js
3. criar o fluxo real de cadastro da startup
4. conectar frontend e backend

## Observacoes importantes

- a documentacao do TCC deve continuar sendo atualizada junto com o codigo
- decisoes relevantes nao devem ficar apenas implicitas na implementacao
- o escopo continua focado na estruturacao inicial da startup, sem CRM e sem gestao financeira avancada
