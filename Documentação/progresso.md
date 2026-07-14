# Progresso

Cada entrada abaixo e um retrato do projeto na data indicada. Quando uma entrada antiga menciona
`painel`, `Suas startups`, `pagina de detalhe`, `Hoje` ou criacao direta em `/painel`, ela registra
uma etapa superada; o estado vigente e o ciclo mais recente, de 2026-07-14.

## 2026-07-14 (workspace principal concluido)

### Resultado do ciclo

- `/painel` agora resolve a conta sem startup para `/painel/startups/nova` e a conta com startups
  para a startup aberta mais recentemente;
- criado o shell unico do workspace, com marca compacta, sidebar, topbar, seletor, nivel, sequencia
  e somente a area de conteudo rolavel;
- a Home da startup foi reconstruida em torno da missao principal, passos, evidencias, aprendizado,
  XP, atividade e desbloqueio;
- a Jornada passou a usar lista mestre-detalhe, bloqueios honestos, abas acessiveis e Mapa inicial
  editavel uma secao por vez;
- o gerenciador passou a abrir, renomear e excluir startups com confirmacao e fallback;
- `last_opened_at` passou a persistir a startup usada por ultimo;
- removidos oito arquivos das quatro telas provisorias: `dashboard-screen`, `startup-overview-screen`,
  `startup-today-screen` e `startup-detail-screen`, cada uma com seu modulo CSS;
- atualizados `telas.md`, `fluxos.md`, `funcionalidades.md`, `arquitetura-missoes.md`,
  `progresso.md` e `proximos-passos.md` para refletir o produto real.

### Verificacoes executadas

- auditoria com `rg`: nenhum import ou uso das quatro telas removidas permaneceu no frontend;
- `manage.py makemigrations --check`: nenhuma migration pendente;
- `manage.py test -v 2 --keepdb`: 45 testes Django passando;
- `npm test`: 62 testes Vitest em 18 arquivos passando;
- `npm run lint`, `npx tsc --noEmit` e `npm run build`: concluidos sem erro;
- Next.js e `eslint-config-next` foram atualizados, sem salto de major, para `16.2.10`;
- `npm audit --json` registrou 5 findings transitivos restantes: 2 moderados de producao
  (`next`/`postcss`) e, nas ferramentas de desenvolvimento, 1 baixo e 2 moderados. Nao foi usado
  `npm audit fix --force`;
- build confirmou as rotas de Home, Jornada, gerenciador, criacao e APIs do workspace;
- smoke HTTP nos servidores locais confirmou conta vazia, criacao de duas startups, ordenacao pela
  ultima abertura, payload `today` com missao, payload da Jornada com oito etapas, `PATCH` do campo
  `initialGoal`, isolamento 404 entre contas, exclusao ativa com `nextStartupId` e logout com 401;
  os usuarios temporarios foram removidos;
- os testes de contrato CSS confirmaram os valores de sidebar `272px/240px`, ausencia de uma regra
  de overflow propria na navegacao, reducao da transicao do skip link e reflow do gerenciador sem
  ocultar fase, progresso ou atividade;
- a leitura estatica do CSS e JSX confirmou declaracoes para simbolo `52x52px`, nome em duas linhas,
  topbar `72px`, shell com overflow bloqueado, conteudo com `overflow-y: auto` e regra global de
  reduced-motion. Esses valores nao equivalem a medicao do layout renderizado.

### Validacao visual

A inspecao renderizada deste ciclo cobriu Home, Jornada e o dialogo de exclusao nos viewports
`1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`. Foram conferidos enquadramento, rolagem da
area de conteudo, distribuicao mestre-detalhe e sobreposicao do dialogo. Os testes automatizados
tambem cobrem foco, Escape, trap de foco, tabs e estado `inert`, mas nao foi executado um percurso
manual completo de ponta a ponta usando somente teclado; essa checagem permanece como aceite manual.

Na nomenclatura vigente, `Jornada` e o nome da area do produto; `etapa` e cada unidade do percurso.
O detalhe de uma etapa vive dentro da Jornada, sem rota ou tela independente.

## 2026-07-13 (marca no canto e formulário centralizado)

### Correção da composição da criação da startup

- removidos logo e nome `Startup Quest` do fluxo vertical que empilhava a marca sobre o formulário
- criada uma identidade compacta e independente no canto superior esquerdo
- mantido o cartão de cada etapa geometricamente centralizado na largura e na altura da viewport
- eliminada a rolagem da composição desktop com `overflow: clip`, sem depender apenas de esconder a barra
- preservado o fluxo rolável como segurança em telas estreitas, abaixo de `760px` de largura
- criada compactação específica para alturas de até `820px`, inclusive para a etapa de segmento,
  que concentra sete opções e é a etapa visualmente mais densa
- em larguras intermediárias, o símbolo permanece no canto e o nome da marca é ocultado para não
  disputar espaço horizontal com o formulário

### Validações executadas

- percurso real das etapas de nome, ideia, segmento e problema no navegador local
- em `1536 x 720`, cartões centralizados sem corte; a etapa de segmento passou de `811px` para
  `637px` de altura e ficou inteiramente visível
- em `1366 x 768`, etapa de segmento centralizada entre `y=66` e `y=702`
- em `1920 x 900`, formulário centralizado e identidade isolada no canto superior esquerdo
- `npm run lint`, `npx tsc --noEmit` e `npm run build` executados com sucesso
- `git diff --check` sem erros de whitespace

## 2026-07-13 (direção da plataforma completa)

### Produto e escopo aprovados

- consolidada a Startup Quest como gerenciador guiado de startups, e não apenas como formulário
  de estruturação inicial
- aprovado o fluxo `Hoje -> Jornada -> Missão -> Evidência e aprendizado -> Recompensa ->
  Próxima missão`
- definidas sete fases: descoberta, problema e solução, validação, modelo de negócio, MVP,
  tração inicial e gestão contínua
- definida gamificação baseada em trabalho real: XP, níveis, conquistas, desbloqueios e
  sequência de dias com atividade significativa
- definido que login isolado não mantém a sequência
- confirmada a prioridade desktop e a direção visual escura, profissional e motivadora
- criada a especificação funcional consolidada em `Documentação/especificacao-plataforma.md`
- aprovada e arquivada a primeira prancha de paleta em
  `Documentação/design/paleta-startup-quest-v1.png`
- aprovada e arquivada a tela-modelo da página Hoje em
  `Documentação/design/mockup-hoje-v1.png`
- definidos os papéis e a integração de Experimentos, Aprendizados, Métricas e Documentos

## 2026-07-13 (primeiro ciclo operacional completo)

### Página Hoje e missão guiada

- substituída a antiga entrada da startup pela página operacional `Hoje`, seguindo o mockup aprovado
- preservada a jornada existente na rota `/painel/startup/<id>/jornada`
- implementada a primeira missão real: conversar com cinco potenciais clientes
- adicionados objetivo, motivo, passos, dica, critério de conclusão, recompensa e próximo desbloqueio
- implementado formulário para registrar cada entrevista como evidência persistida
- implementado registro da síntese dos padrões após as cinco entrevistas
- implementada conclusão idempotente da missão, evitando recompensa duplicada
- itens ainda não implementados da navegação aparecem honestamente como `em breve`, sem links falsos

### Gamificação baseada em trabalho real

- cada entrevista válida concede 10 XP
- a primeira síntese da missão concede 25 XP
- a conclusão da missão concede 150 XP
- login isolado não concede XP nem mantém a sequência
- entrevista, aprendizado e conclusão geram eventos de atividade deduplicados
- sequência calculada por dias distintos com atividade significativa
- conquistas ampliadas para primeira entrevista, cinco entrevistas, primeiro aprendizado,
  primeira missão e sequência de três dias
- conclusão de uma etapa da jornada conta para a sequência sem duplicar os 100 XP já existentes

### Persistência e APIs

- criados os modelos `Mission`, `MissionEvidence`, `Learning` e `ActivityEvent`
- criada e aplicada a migration `0005`
- criada semeadura automática da missão inicial para startups novas e existentes
- criado endpoint da página Hoje e endpoints de evidência, aprendizado e conclusão
- conta de XP passa a combinar progresso da jornada com eventos operacionais
- arquitetura e regras registradas em `Documentação/arquitetura-missoes.md`

### Validações executadas

- `manage.py check` sem problemas
- `manage.py makemigrations --check --dry-run` sem mudanças pendentes
- 34 testes de backend passando, incluindo 8 testes novos do fluxo de missão
- `npm run lint`, `npx tsc --noEmit` e `npm run build` passando
- validação real no navegador: entrevista salva, missão avançou de 0/5 para 1/5,
  XP passou de 200 para 210, sequência iniciou em 1 dia e atividade apareceu no histórico
- revisão visual desktop-first e revisão isolada de layout e tipografia usadas para evitar
  hierarquia dispersa, excesso de cards e escala tipográfica inconsistente

## 2026-07-13 (correção do glitch nas telas de autenticação)

### Causa e correção

- identificado conflito entre a rolagem do documento e a rolagem interna da tela de autenticação
- removida a altura rígida de `100dvh` do contêiner principal; a tela mantém altura mínima, mas
  deixa o documento ser o único responsável pela rolagem
- mantido o conteúdo completo e rolável em login, cadastro, janelas estreitas e telas baixas
- removido o atraso artificial de 1,05 segundo antes da navegação para o painel
- ajustada a transição para nunca terminar em uma tela vazia enquanto a próxima rota carrega
- mantida a mensagem `Preparando sua jornada...` visível durante uma eventual espera real

### Validações executadas

- reprodução no viewport `447 x 906`: antes havia rolagem simultânea no documento e no `<main>`
- após a correção, nenhum descendente mantém rolagem própria e resta somente a barra do documento
- login e cadastro conferidos visualmente no navegador sem barra duplicada
- login real validado até `/painel`, sem pausa artificial ou estado visual vazio
- primeira etapa de criação da startup conferida no mesmo viewport

### Ajuste complementar do fundo no final da autenticação

- identificado que o arco decorativo inferior rotacionado ultrapassava o contêiner escuro em até
  60 px e ampliava apenas a área rolável do documento
- reposicionado o arco dentro dos limites da tela, eliminando a faixa do fundo global claro sem
  reintroduzir uma segunda barra de rolagem

### Composição fixa e centralizada da autenticação

- login e cadastro passaram a ocupar exatamente o viewport com `position: fixed` e sem rolagem
  nas dimensões usuais de computador
- removida a dependência de `100dvh`, evitando diferenças entre a altura visual e a altura usada
  pelo navegador
- o conjunto central usa níveis de escala por altura que participam do cálculo de layout, mantendo
  a centralização geométrica em notebooks mais baixos
- validado sem rolagem em `1440 x 900`, `1366 x 768`, `1280 x 720`, `1024 x 650` e `447 x 906`
- mantido fallback de rolagem única somente abaixo de 620 px de altura para preservar campos,
  legibilidade e navegação com zoom elevado

## 2026-07-13 (primeira etapa visivel em telas baixas)

### Correcao responsiva na fundacao da startup

Durante a validacao real em uma janela de `887 x 698`, o botao `Continuar` da primeira etapa
comecava abaixo da viewport, mesmo com a rolagem de seguranca ja existente. A tela continuava
utilizavel por rolagem, mas a acao principal nao aparecia na primeira dobra.

- criada uma composicao compacta apenas para desktop com ate `760px` de altura
- reduzidos espacos da marca, logo, card, formulario e CTA sem alterar a composicao de telas altas
- preservada a regra para telas estreitas, que continua usando fluxo de pagina e rolagem natural

### Validacoes executadas

- fluxo real validado de cadastro, fundacao da startup, painel, detalhe e rascunho da jornada
- `manage.py test accounts startups`: 26 testes passando
- validacao no viewport `887 x 698`: o CTA passou de `y=746-811` para `y=554-610`, ficando
  inteiramente visivel na primeira dobra

## 2026-07-09 (correcao de rolagem na jornada de criacao)

### Bug: card cortado e botao inalcancavel em telas mais baixas

Reportado pelo usuario com captura de tela: na primeira porta (`Crie sua startup`), em janelas
largas porem com pouca altura (comum em notebooks, ~900px de altura), o card ultrapassava a altura
da viewport e o botao `Criar startup` ficava fora da area visivel. Como a pagina usava
`position: fixed` com `overflow-y: hidden`, nao havia como rolar ate o botao — ele ficava
inacessivel de verdade, nao so escondido.

- causa raiz: `.page` em `startup-creation-screen.module.css` fixava `overflow-y: hidden`
  incondicionalmente; so havia rolagem para telas estreitas (`max-width: 760px`), nao para telas
  baixas
- corrigido `overflow-y` de `hidden` para `auto` na base da regra, permitindo rolar sempre que o
  conteudo ultrapassar a viewport, em qualquer combinacao de largura/altura
- removido um `overflow-y: hidden` redundante em `.content` que era inerte mas arriscado
- ampliado o breakpoint de altura reduzida de `760px` para `920px` e diminuido o espacamento da
  primeira porta (logo, card, titulo) nesse breakpoint, para que o botao apareca sem rolagem na
  maioria dos notebooks
- aplicada a mesma correcao preventivamente em `auth-screen.module.css` (login/cadastro), que tinha
  o mesmo padrao de risco (`overflow: clip` incondicional) e podia sofrer o mesmo problema no modo
  `Criar conta` (4 campos) em telas baixas

### Validacoes executadas

- `npm run build` (producao) compilado com sucesso, validando sintaxe de CSS e TypeScript
- verificacao visual nao concluida nesta sessao (extensao do navegador indisponivel); pendente
  confirmacao do usuario

## 2026-07-09

### Correcao critica: bloqueio de acesso via 127.0.0.1

O Next.js 16 bloqueia por padrao a conexao de hot-reload (`webpack-hmr`) quando o site e acessado
por uma origem diferente de `localhost`. Como o projeto e acessado por `http://127.0.0.1:3000`
(README e `LIGAR-TUDO.cmd`), isso travava a hidratacao do React no navegador: a pagina aparecia
normalmente e os campos de texto funcionavam (comportamento nativo do navegador), mas nenhum
clique surtia efeito.

- adicionado `allowedDevOrigins: ["127.0.0.1", "localhost"]` em `next.config.ts`
- exige reinicio completo do servidor de desenvolvimento apos a mudanca (config nao recarrega a quente)

### Celebracao ao concluir etapa da jornada

- ao concluir uma etapa, o marcador da etapa exibe um anel expansivo e seis faiscas, reaproveitando
  o vocabulario visual da celebracao de fundacao (ciclo 3), em versao compacta e mais curta (~1.5s)
- a etapa concluida recebe um leve glow dourado e um brilho diagonal que atravessa o card uma vez
- efeitos respeitam `prefers-reduced-motion` (ficam ocultos, sem decoracao cinetica)
- decisao de escopo: por acontecer com frequencia (ate 8 vezes por startup), a celebracao fica
  ancorada no card da etapa, sem tomar a tela inteira como a celebracao de fundacao (que acontece
  uma unica vez por startup)

### Validacoes executadas

- `manage.py test accounts startups` com 26 testes passando (sem mudanca de backend neste ciclo)
- `npx tsc --noEmit` e `npm run lint` sem erros
- revisao manual da estrutura JSX/CSS (a ferramenta de teste de clique automatizado se mostrou
  instavel nesta sessao; verificacao funcional feita por revisao de codigo e checagem de tipos)

## 2026-07-08 (ciclo 5)

### Gamificacao leve

- XP e nivel calculados do estado real da jornada (100 XP por etapa concluida, nivel a cada 300)
- cinco conquistas derivadas de eventos reais: Fundacao, Batismo, Primeira porta,
  Meio caminho e Jornada completa
- sem modelos novos no banco: tudo derivado do `JourneyStep`, coerente com o principio de
  gamificacao leve que nao vira o foco do produto
- painel exibe metrica de nivel com XP e fileira de conquistas (desbloqueadas em destaque,
  travadas esmaecidas com descricao no tooltip)
- listagem de startups devolve `accountProgress` junto dos cards
- atualizacao silenciosa do progresso da conta apos criar ou excluir startup

### Validacoes executadas (ciclo 5)

- `manage.py test accounts startups` com 26 testes passando (2 novos de gamificacao)
- `npx tsc --noEmit` e `npm run lint` sem erros
- painel validado no navegador: Nivel 02 com 300 XP e conquistas 3 de 5 refletindo o estado real

## 2026-07-08 (ciclo 4)

### Progresso da jornada no painel

- listagem de startups agora inclui `journeyProgress` e `nextStepLabel` por startup
- seed preguicoso da jornada tambem na listagem, cobrindo startups antigas
- cards do painel ganharam barra fina de progresso e proxima etapa da jornada
- metrica `A definir depois` substituida por `Progresso medio` da conta

### Validacoes executadas (ciclo 4)

- `manage.py test startups` com 21 testes passando
- `npx tsc --noEmit` e `npm run lint` sem erros
- painel validado no navegador com barra de progresso e proxima etapa por card

## 2026-07-08 (ciclo 3)

### Jornada guiada real

- criacao do modelo `JourneyStep` (etapa, resposta, status, ordem, conclusao) vinculado a startup
- enum de etapas completado com as 8 etapas do TCC (adicionados diferenciais, modelo de negocio e metas)
- migration `0004` gerada e aplicada
- seed automatico da jornada na criacao da startup (problema e publico ja concluidos na fundacao,
  proposta de valor como etapa atual) e seed preguicoso para startups anteriores
- endpoints `GET /api/startups/<id>/journey/` e `PATCH /api/startups/<id>/journey/<key>/`
- concluir etapa exige resposta, abre a proxima porta e avanca `current_stage` da startup
- etapas futuras ficam travadas (409 ao tentar responder porta fechada)
- respostas de problema e publico sincronizadas entre startup e jornada nos dois sentidos
- jornada jogavel na pagina de detalhe: etapa atual abre editor com pergunta, dica e exemplo,
  botoes de concluir e salvar rascunho, etapas concluidas podem ser refinadas
- bloco `Proximo passo` agora reflete a etapa atual da jornada real

### Validacoes executadas (ciclo 3)

- `manage.py test accounts startups` com 24 testes passando (7 novos da jornada)
- `npx tsc --noEmit` e `npm run lint` sem erros
- fluxo validado no navegador: jornada semeada para startup existente (25%), proposta de valor
  concluida, porta de diferenciais aberta, progresso 38% e chip da etapa atualizado

## 2026-07-08 (ciclo 2)

### Pagina de detalhe da startup

- criacao da rota `/painel/startup/[id]` com a primeira visao interna de uma startup especifica
- criacao do endpoint `GET /api/startups/<id>/` no backend e proxy correspondente no Next.js
- card do painel virou porta de entrada: titulo clicavel e botao `Entrar na startup`
- mapa inicial da startup com edicao inline de ideia, segmento, problema e publico (via PATCH)
- renomeacao tambem disponivel na pagina de detalhe
- bloco `Proximo passo` derivado do estado real: dar nome (se pendente) ou proposta de valor
- mapa da jornada com as 8 etapas do TCC, status honesto (2 concluidas na fundacao,
  proposta de valor como etapa atual em construcao) e barra de progresso
- estados de carregamento, erro e 404 para startup inexistente ou de outra conta

### Validacoes executadas (ciclo 2)

- `manage.py test accounts startups` com 17 testes passando (2 novos para o GET)
- `npx tsc --noEmit` e `npm run lint` sem erros
- fluxo validado no navegador: painel -> entrar -> renomear pelo proximo passo -> editar problema
  -> jornada refletindo 25% -> voltar ao painel
- startup de outra conta retorna 404 no GET

## 2026-07-08 (ciclo 1)

### Edicao da startup e refinamento do painel

- criacao do endpoint `PATCH /api/startups/<id>/` para atualizacao parcial de nome, ideia, segmento, problema e publico
- unificacao de `PATCH` e `DELETE` na mesma rota `startups/<id>/` no backend
- proxy `PATCH` na rota interna do Next.js em `/api/startups/[startupId]`
- renomeacao inline da startup no painel `Suas startups`, com destaque `Dar nome agora` para startups sem nome
- cumprimento real da promessa `Ainda nao sei o nome`: agora o nome pode ser definido depois
- substituicao do `window.confirm` de exclusao por modal proprio no estilo do produto, com fechamento por Escape e clique fora
- remocao da copy provisoria de teste na confirmacao de exclusao
- adicao de `prefers-reduced-motion` nos modulos `quest-mark` e `startup-overview`
- estados de foco visiveis (`focus-visible`) nos botoes de acao do painel

### Validacoes executadas

- execucao de `manage.py test accounts startups` com 15 testes passando (5 novos para o PATCH)
- execucao de `manage.py check` com sucesso
- execucao de `npx tsc --noEmit` com sucesso
- execucao de `npm run lint` com sucesso
- validacao real do fluxo renomear no navegador: startup sem nome renomeada para um nome definido com flash de sucesso
- validacao real do modal de exclusao: cancelar mantem, Escape fecha, confirmar exclui
- validacao das regras da API: nome vazio 400, corpo vazio 400, startup de outro dono 404, sem token 401

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
- criacao da segunda versao do mockup da home geral da conta, redesenhando o hub como uma cabine de comando com startup principal em foco, radar lateral e doca de acoes rapidas
- criacao do primeiro mockup da tela vazia para iniciar a startup, com bloco central, campo unico de nome e CTA principal
- criacao do primeiro mockup da segunda etapa da startup, focado em uma descricao curta da ideia
- criacao do primeiro mockup da etapa de segmento, tratando segmento como territorio inicial da ideia
- criacao do primeiro mockup da etapa de problema, separando a dor do usuario da solucao proposta
- criacao do primeiro mockup da etapa de publico inicial, incentivando um recorte pequeno e concreto
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
- implementacao de transicao cinematografica curta entre autenticacao e area interna
- implementacao de entrada por camadas na primeira tela de criacao da startup
- refinamento do estado intermediario de carregamento do painel autenticado
- conversao da criacao da startup em uma jornada de cinco etapas: nome, ideia, segmento, problema e publico
- persistencia de ideia, segmento, problema e publico inicial junto da startup
- exibicao provisoria do mapa inicial da startup na tela `Suas startups`
- refinamento da troca entre etapas com titulo digitado, bloco da pergunta em entrada suave e correcao de rolagem lateral
- ajuste da composicao da jornada: primeira porta restaurada com mais respiro e portas seguintes sem altura de fundo desnecessaria
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
- execucao de `.\node_modules\.bin\tsc.cmd --noEmit --pretty false` com sucesso
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

## 2026-07-13

### Padronizacao da marca na criacao da startup

- reposicionamento da assinatura da Startup Quest para o canto superior esquerdo
- composicao horizontal compacta com simbolo e nome em duas linhas: `Startup` e `Quest`
- criacao do modo `compact` do componente `QuestMark`, com caixa geometrica real de 52 x 52 pixels no desktop
- uso da mesma assinatura visual nas cinco etapas da criacao da startup
- preservacao do formulario centralizado e sem rolagem nas resolucoes desktop validadas
- compactacao do ritmo vertical das etapas com texto em telas de 720 e 768 pixels de altura
- manutencao da adaptacao existente para telas de ate 760 pixels, sem priorizar o mobile nesta fase

### Validacoes executadas

- inspecao visual das cinco etapas no navegador local
- validacao geometrica da marca em 1280 x 720, 1366 x 768, 1536 x 720 e 1920 x 900
- confirmacao de caixa do simbolo em 52 x 52 pixels e assinatura com 52 pixels de altura em todas as resolucoes desktop
- confirmacao de formulario centralizado e sem extravasamento nas quatro resolucoes
- execucao de `npm.cmd run lint` com sucesso
- execucao de `npx.cmd tsc --noEmit --pretty false` com sucesso
- execucao de `npm.cmd run build` com sucesso
- verificacao de layout pelo detector do Impeccable sem alertas
