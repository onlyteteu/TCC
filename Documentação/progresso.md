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
