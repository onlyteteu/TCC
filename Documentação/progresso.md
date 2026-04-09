# Progresso

## 2026-04-08

### Definicao do produto e do TCC

- consolidacao da proposta central da plataforma
- definicao do problema, objetivo e recorte
- delimitacao do que esta dentro e fora do escopo
- definicao conceitual do MVP

### Estruturacao da documentacao

- criacao do `README.md` como visao geral do repositorio
- criacao da pasta `Documentação`
- separacao da documentacao por tema
- registro formal das decisoes iniciais

- criacao do `handoff.md` para retomada do projeto em outro computador

### Estruturacao tecnica inicial

- definicao da stack com Next.js, Django e PostgreSQL
- criacao do monorepo com `apps/frontend` e `apps/backend`
- criacao de `.gitignore`, `.editorconfig`, `.gitattributes` e `docker-compose.yml`
- criacao dos arquivos base de configuracao do frontend
- criacao da homepage inicial do frontend
- criacao dos arquivos base do backend Django
- criacao do endpoint `/api/health/`
- criacao do modelo `Startup`
- geracao da migration inicial `0001_initial.py`
- criacao do primeiro mockup visual da tela de login/cadastro
- criacao de segunda versao do mockup com direcao futurista/gamer
- criacao de terceira versao do mockup com tons quentes e composicao mais limpa
- criacao de quinta versao do mockup com fundo premium inspirado na referencia e bloco central simplificado
- criacao de sexta versao do mockup removendo badges extras, subtitulo longo e ajustando destaque no nome da plataforma
- criacao de setima versao do mockup com simbolo mais alto e titulo principal melhor tratado visualmente
- criacao de oitava versao ajustando novamente a distancia entre logo e titulo
- criacao de nona versao removendo o titulo intermediario e redistribuindo o conteudo do card
- criacao de decima versao do mockup dedicada ao cadastro, mantendo a linguagem da v9 e trocando o formulario para nome, e-mail, senha e confirmar senha
- criacao do primeiro mockup da tela de painel de startups, com saudacao discreta, cards enxutos e indicador visual de saude
- criacao do primeiro mockup da home geral da conta, com top bar de navegacao, saudacao destacada e cards limpos de startups
- criacao do primeiro mockup da tela vazia para iniciar a startup, com bloco central, campo unico de nome e CTA principal
- implementacao real da tela de login/cadastro no frontend com abas funcionais
- implementacao da logo com animacao sutil de respiracao
- criacao da pagina institucional em `/sobre` para preservar a visao inicial do produto
- criacao do painel autenticado inicial em `/painel`
- implementacao do modulo `accounts` no backend Django
- criacao dos endpoints `/api/auth/register/`, `/api/auth/login/`, `/api/auth/me/` e `/api/auth/logout/`
- integracao entre frontend e backend via rotas internas do Next.js
- validacao real do fluxo de cadastro e login pelo frontend local
- refinamento das microanimacoes da autenticacao com troca mais fluida entre abas e compactacao visual do modo de cadastro
- refinamento final dos CTAs principais para uma base mais escura com contorno neon laranja sutil

## 2026-04-09

### Evolucao do fluxo interno

- implementacao real da tela de criacao da startup em `/painel`
- adicao da opcao `Ainda nao sei o nome` para permitir criar a startup mesmo sem nome definido
- implementacao de animacao sutil de respiracao nos elementos de fundo da tela de criacao
- implementacao de uma visao inicial de startups ja criadas para o usuario autenticado
- integracao do `/painel` para decidir entre criar startup ou mostrar as startups existentes

### Backend e persistencia

- criacao dos endpoints `/api/startups/` e `/api/startups/create/`
- vinculacao da entidade `Startup` ao usuario autenticado
- geracao e aplicacao da migration `0002_startup_owner.py`
- cobertura de testes para listagem e criacao de startups

### Validacoes executadas

- execucao de `.\.venv\Scripts\python.exe manage.py test accounts startups` com sucesso
- execucao de `.\.venv\Scripts\python.exe manage.py check` com sucesso
- execucao de `.\.venv\Scripts\python.exe manage.py migrate` com sucesso
- execucao de `npm.cmd run lint` com sucesso
- execucao de `npm.cmd run build` com sucesso
- validacao real da criacao da startup via `http://127.0.0.1:3000/api/startups`

### Validacoes executadas

- instalacao do Python 3.12 no ambiente local
- habilitacao do WSL no Windows
- instalacao do Docker Desktop
- instalacao das dependencias do frontend
- instalacao das dependencias do backend
- subida do container local do PostgreSQL
- aplicacao das migrations no banco
- execucao de `npm.cmd run lint` com sucesso
- execucao de `npm.cmd run build` com sucesso
- execucao de `py -3.12 manage.py check` com sucesso
- execucao de `.\.venv\Scripts\python.exe manage.py test accounts` com sucesso
- validacao do fluxo real de cadastro e login em `http://127.0.0.1:3000/api/auth/*`
