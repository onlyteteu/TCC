# Decisoes

## DEC-001: Documentacao continua e obrigatoria

### Decisao

Toda implementacao relevante deve ser acompanhada de atualizacao documental no mesmo ciclo.

### Motivo

O projeto precisa ser defensavel academicamente, manter continuidade de desenvolvimento e gerar
base real para a monografia.

### Impacto

Codigo sem registro das decisoes correspondentes passa a ser considerado incompleto.

## DEC-002: Centralizar a documentacao do TCC em `Documentação`

### Decisao

Os documentos do TCC ficam concentrados na pasta `Documentação`, enquanto o `README.md` permanece
na raiz como porta de entrada do projeto.

### Motivo

Isso organiza melhor o material academico e evita espalhar documentos importantes em multiplos
locais.

### Impacto

Qualquer nova documentacao relevante do TCC deve ser criada ou atualizada nessa pasta.

## DEC-003: Manter o foco na estruturacao inicial da startup

### Decisao

O produto sera limitado a apoiar a criacao e a organizacao inicial da startup.

### Motivo

Esse recorte torna o projeto mais coerente com o problema proposto, mais viavel de implementar e
mais defensavel como TCC.

### Deixado de fora de forma proposital

- CRM
- financeiro avancado
- contabilidade
- operacao completa
- automacoes empresariais complexas

## DEC-004: Priorizar o nucleo do produto antes de expansoes

### Decisao

O primeiro ciclo de implementacao deve priorizar:

- cadastro da startup
- jornada guiada
- dashboard de progresso

### Motivo

Esses tres elementos sustentam o fluxo central do produto e entregam valor direto ao usuario.

### Impacto

Gamificacao e refinamentos devem entrar como complemento ao nucleo, nao como substituicao dele.

## DEC-005: Adotar Next.js, Django e PostgreSQL como stack base

### Decisao

Foi definida a seguinte base tecnica:

- Next.js 16 no frontend
- Django 5.2 no backend
- PostgreSQL 17 no banco de dados
- Python 3.12 como base local do backend

### Motivo

Essa combinacao separa bem apresentacao, regras de negocio e persistencia, alem de ser coerente
com um produto web real e com a defesa academica do TCC.

### Impacto

O repositorio passou a ser estruturado como monorepo com `apps/frontend` e `apps/backend`.

## DEC-006: Iniciar a base do backend com Django puro

### Decisao

O backend inicial foi montado com recursos nativos do Django, sem adicionar DRF neste primeiro
ciclo.

### Motivo

O objetivo imediato era consolidar estrutura, dominio inicial e capacidade de evolucao sem
aumentar complexidade prematuramente.

### Deixado de fora de forma proposital

- DRF
- autenticacao
- endpoints de CRUD completos

## DEC-007: Criar a entidade `Startup` ja no scaffold inicial

### Decisao

O primeiro modelo de dominio implementado foi `Startup`.

### Motivo

Esse e o objeto central da plataforma e conecta a base tecnica diretamente ao objetivo principal
do produto.

### Impacto

O backend ja nasceu orientado ao dominio real do projeto, e nao apenas a uma estrutura tecnica
vazia.

## DEC-008: Adotar card central unico na tela de autenticacao

### Decisao

A tela inicial de login/cadastro deve usar um unico bloco central com alternancia entre `Entrar`
e `Criar conta`.

### Motivo

Essa abordagem mantem a tela simples, elegante e focada, sem multiplicar componentes ou dividir a
atencao do usuario.

### Deixado de fora de forma proposital

- layouts com duas colunas
- excesso de ilustracoes
- fundo pesado ou visualmente carregado

## DEC-009: Reorientar a tela de autenticacao para uma linguagem futurista e gamificada

### Decisao

A direcao inicial mais neutra da tela de login/cadastro foi substituida por uma abordagem visual
mais futurista, com referencias de RPG e interface gamer.

### Motivo

O usuario avaliou que a primeira proposta estava corporativa demais e pouco conectada ao carater
gamificado pretendido para a plataforma.

### Impacto

Os proximos mockups e implementacoes de interface devem buscar:

- atmosfera mais imersiva
- visual tecnologico com energia e progressao
- sinais de gamificacao ja na entrada do produto

### Deixado de fora de forma proposital

- visual de escritorio tradicional
- tela de autenticacao neutra demais
- excesso de sobriedade que enfraquece a identidade do produto

## DEC-010: Destacar o fundo e simplificar o bloco de autenticacao

### Decisao

Na iteracao seguinte do mockup, o fundo passou a assumir o papel principal da composicao, com
atmosfera de galaxia em tons quentes, enquanto o card central foi simplificado.

### Motivo

O usuario apontou que a tela anterior ainda tinha redundancia de chamadas e precisava de um fundo
mais marcante, com menos cara de interface carregada.

### Impacto

Os proximos refinamentos da tela devem preservar:

- fundo mais expressivo do que o bloco
- destaque em laranja e amarelo
- card central flutuando
- formulario mais direto e sem repeticao desnecessaria

## DEC-011: Implementar autenticacao com Django nativo e token assinado

### Decisao

O fluxo de autenticacao foi implementado com o `User` nativo do Django, endpoints JSON proprios e
token assinado no backend, enquanto o frontend em Next.js faz a ponte por rotas internas e guarda
a sessao em cookie HTTP-only.

### Motivo

Essa abordagem entrega login e cadastro reais sem introduzir DRF ou uma camada extra de
complexidade antes de o fluxo principal do produto amadurecer.

### Impacto

- o backend passa a ter o modulo `accounts`
- o frontend deixa de ser apenas estatico e passa a ter autenticacao funcional
- os proximos fluxos podem assumir a existencia de um usuario autenticado

## DEC-012: Adotar catalogo versionado e recomendacao deterministica de missoes

### Decisao

O proximo ciclo de Missoes usara um catalogo curado e versionado, com instancias persistidas por
startup e um motor de regras deterministico para escolher uma unica missao recomendada.

### Motivo

Uma trilha fixa sem contexto seria rigida demais, enquanto gerar missoes por inteligencia artificial
agora tornaria criterio, recompensa e progressao dificeis de validar. O catalogo versionado oferece
orientacao confiavel e deixa o dominio preparado para recomendacoes dinamicas futuras.

### Impacto

- missoes iniciadas e concluidas preservam sua versao;
- pre-requisitos e desbloqueios passam a ser verificaveis;
- Home e Central de missao usam a mesma recomendacao do backend;
- inteligencia artificial futura pode sugerir candidatas, mas nao decide conclusao ou XP sozinha.

## DEC-013: Usar a Central de missao como tela de Missoes

### Decisao

A area de Missoes tera uma missao principal recomendada, poucas alternativas reais e a trilha logo
abaixo. O usuario escolheu essa estrutura entre `Central de missao`, `Trilha primeiro` e `Quadro por
status`.

### Motivo

A Central preserva a funcao de guia da plataforma sem transformar as missoes em um fluxo totalmente
rigido ou em um quadro de tarefas livre. Ela tambem permite introduzir semanais e opcionais sem
competir com a prioridade principal.

### Impacto

- a Home continua respondendo qual e a proxima acao;
- a Central explica contexto, opcoes, dependencias e historico;
- secoes sem conteudo real ficam ocultas;
- a trilha inicial termina no recorte do MVP e sera seguida por ciclos de gestao recorrente.

## DEC-014: Redesenhar a Jornada como Mapa de Capítulos

### Decisao

A Jornada será organizada como um `Mapa de Capítulos`, agrupando as oito etapas existentes em
Fundamento, Proposta, Validação e Construção. A tela apresentará percurso, marco atual, registros
construídos e próximo desbloqueio. A execução permanecerá em Missões.

### Motivo

O layout mestre-detalhe atual é funcional, mas se comporta como lista e formulário, compete com a
Central de missão e comunica pouco da transformação acumulada da startup. O Mapa de Capítulos cria
uma responsabilidade própria para a Jornada sem duplicar progresso ou domínio.

### Impacto

- os quatro capítulos serão derivados das oito etapas existentes;
- o CTA principal do marco atual será `Continuar missão`;
- `Revisar registro` será secundário e não concluirá etapa;
- o backend continuará decidindo bloqueios, conclusão e XP;
- o Mapa inicial passará a se chamar `Mapa da startup` na interface;
- a especificação aprovada está em `design/2026-07-21-jornada-mapa-capitulos.md`;
- esta decisão ainda não está implementada.
