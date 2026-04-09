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
