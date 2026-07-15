# Relatorio da rodada final de correcoes integradas

Base revisada: `e4d6628`

## Resultado

Todos os Important e Minors do brief foram tratados sem ampliar modulos futuros, sem alterar o
route group autenticado e sem enfraquecer o isolamento por owner/404.

## Ciclos RED / GREEN

### Sessao invalida

- RED: `npm test -- src/app/api/auth/logout/route.test.ts` falhou porque a rota de logout nao
  oferecia `GET` capaz de limpar cookie antes do redirect.
- GREEN: a rota `GET /api/auth/logout` expira `startup_quest_session` e redireciona para `/`;
  `/painel` usa essa saida somente quando o backend responde 401. 403/404 nao viraram logout.

### Startup ativa e POST de abertura

- RED: `workspace-context.test.tsx` manteve Aurora apos abrir Boreal e revelou a duplicidade entre
  clique e efeito da rota.
- GREEN: o contexto guarda o ID selecionado independentemente do route ID nulo, aplica a resposta
  de `/open`, reordena a lista, atualiza `lastMarkedStartupId` antes de navegar e marca acesso
  direto uma unica vez. A cobertura combinada com o gerenciador preserva B como ativa ate a
  exclusao e usa o fallback retornado pelo backend.

### Reconciliacao Home/Jornada/Mapa

- RED: callbacks de reconciliacao permaneceram em zero depois de entrevista e conclusao de etapa.
- GREEN: wrappers cliente das rotas conectam Home e Jornada ao `refreshWorkspace({ silent: true })`.
  Entrevista, aprendizado, conclusao de missao, PATCH da Jornada e edicao do Mapa atualizam os
  dados globais sem apagar o payload local nem criar loop de fetch.

### Contrato learning e missao concluida

- RED: `learning` abriu o dialogo generico porque a Home esperava a chave ficticia `review`; o
  payload concluido ainda oferecia acoes que causariam 409.
- GREEN: fixtures e handler usam apenas `learning`; missao concluida fica somente leitura, mostra
  evidencias/aprendizado e encaminha para a Jornada.

### Acessibilidade de menus e dialogs

- RED: os testes provaram que `<details>` permanecia aberto, o shell completo nao ficava `inert` e
  o gerenciador nao coordenava o modal com o layout.
- GREEN: seletor fecha e devolve foco ao summary depois da troca; dialogs usam portal fora do shell;
  contexto unico marca sidebar, topbar, conteudo e skip link como `inert`/`aria-hidden`; Home e
  Gerenciador coordenam abertura, fechamento, Escape, conclusao e desmontagem.

### Ordenacao e limites do backend

- RED: o empate de datas retornou PK crescente; os novos testes tambem exercitaram `NULLS LAST`,
  fallback de `lastActivityAt` e limites 255/256 de `initialGoal`.
- GREEN: a ordenacao termina em `-pk`; 25/25 testes focados de `StartupApiTests` passaram.

## Dependencias e audit

- `next` e `eslint-config-next`: `16.2.10` exatos, sem salto de major.
- lockfile regenerado por `npm install --save-exact next@16.2.10 eslint-config-next@16.2.10`.
- nao foi executado `npm audit fix --force`.
- `npm audit --json`: 5 findings transitivos, nenhum high/critical:
  - producao: 2 moderate (`next` afetado pelo `postcss` 8.4.31 empacotado);
  - desenvolvimento: 1 low (`@babel/core`) e 2 moderate (`brace-expansion`, `js-yaml`).
- O audit do npm sugere um downgrade/major inadequado para o par Next/PostCSS; foi documentado em
  vez de forcar uma alteracao insegura.

## Verificacao final

- `manage.py makemigrations --check`: nenhuma mudanca detectada.
- `manage.py test -v 2 --keepdb`: 45/45 testes passando.
- `npm test`: 68/68 testes em 19 arquivos passando apos o complemento final descrito abaixo.
- `npm run lint`: passou.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou em Next.js 16.2.10; 12 paginas geradas e rotas esperadas listadas.
- `npm audit --json`: executado e classificado acima (exit 1 pelos 5 findings restantes).
- `git diff --check`: passou.

## Documentacao e verificacao visual

`Documentacao/progresso.md` e `funcionalidades.md` registram contagens atuais, sessao, reconciliacao,
nomenclatura `Jornada`/`etapa`, dependencias e audit. A inspecao renderizada anterior desta rodada
cobriu Home, Jornada e dialog nos quatro viewports desktop alvo. Nao se alega um percurso manual
completo usando somente teclado; os comportamentos de foco/teclado possuem cobertura automatizada.

## Preocupacoes remanescentes

- Permanecem os 5 findings transitivos descritos no audit, aguardando patches seguros dos pacotes
  de origem.
- Os modulos futuros continuam intencionalmente desabilitados e fora desta rodada.

## Complemento final de 2026-07-15

Base deste complemento: `cedd5d1`.

### Contratos fechados

- A topbar agora mostra XP junto ao nivel e acompanha uma reconciliacao real de
  `accountProgress` sem reload.
- A missao concluida renderiza uma lista somente leitura com nome, perfil, contexto,
  observacoes e data das evidencias, alem de conteudo, impacto, proxima acao e confianca do
  aprendizado retornado pelo backend. Permanecem apenas o resumo e o link valido para a Jornada.
- `refreshWorkspace` captura a versao de mutacao no inicio da requisicao. Uma abertura concluida
  incrementa essa versao, impedindo um refresh mais antigo de repor ordem e `lastOpenedAt`
  obsoletos.
- O helper `closeDetailsMenu` centraliza fechamento e restauracao de foco. Links do seletor
  devolvem foco ao `summary` quando o destino ja e a rota atual.
- O percurso integrado `/painel` com cookie invalido e backend 401 agora tem cobertura unica:
  redirect para o GET de logout, expiracao do cookie e renderizacao do login sem retorno a
  `/painel`.

### RED / GREEN deste complemento

- RED focado: 4 falhas esperadas e 10 testes passando. As falhas provaram XP ausente, conteudo
  concluido ausente, refresh antigo sobrescrevendo Boreal e foco nao restaurado no link no-op.
- O teste integrado de sessao passou desde sua primeira execucao porque a implementacao do GET de
  logout ja existia na base; ele fecha uma lacuna de cobertura, sem mudanca produtiva artificial.
- GREEN focado: 14/14 testes em 4 arquivos.

### Verificacao fresca do complemento

- `npm test`: uma primeira execucao completa teve 2 timeouts de 5 segundos em testes de Jornada,
  sem falha de assercao. Os dois arquivos passaram isolados (9/9) e a repeticao completa em
  processo fresco passou: 68/68 em 19 arquivos. Uma verificacao pós-commit ainda encontrou um
  timeout isolado no gerenciador; o arquivo passou sozinho (4/4) e a suite completa serial
  (`npm test -- --maxWorkers=1`) passou: 68/68 em 19 arquivos.
- `npm run lint`: passou.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou; 12 paginas geradas e rotas esperadas listadas.
- Backend nao foi alterado neste complemento, portanto seus comandos nao foram repetidos.
- `git diff --check`: executado novamente antes do commit do relatorio.

### Commits de implementacao

- `80d5c09 fix: preserva progresso e ordem do workspace`
- `6ff5d14 fix: detalha missao concluida em modo leitura`
- `eafcc9c test: cobre retorno de sessao invalida ao login`
