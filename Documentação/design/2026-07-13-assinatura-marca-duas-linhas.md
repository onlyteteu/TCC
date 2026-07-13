# Assinatura compacta da marca na criação da startup

Data: 13 de julho de 2026  
Status: design selecionado; aguardando revisão final antes da implementação

## Contexto

Nas cinco etapas de criação da startup, a marca permanece no canto superior esquerdo enquanto o
formulário fica centralizado. A primeira versão horizontal apresentou desalinhamento óptico porque
o componente `QuestMark` mantinha uma caixa de `132 x 132px` e era reduzido apenas visualmente por
`transform`. O nome e o símbolo, portanto, não formavam uma única assinatura visual.

O tamanho da marca também podia variar conforme a etapa e a altura da tela. Essa variação quebrava
a continuidade do fluxo e tornava o cabeçalho menos previsível.

## Decisão aprovada

Usar uma assinatura horizontal compacta com:

- símbolo à esquerda;
- palavra `Startup` na primeira linha;
- palavra `Quest` na segunda linha;
- alinhamento vertical central entre símbolo e bloco de texto;
- a mesma composição e o mesmo tamanho nas etapas 1 a 5.

A escolha corresponde à opção B da comparação visual aprovada pelo usuário.

## Composição visual

### Símbolo

- caixa estrutural real de `52 x 52px` no modo desktop;
- o SVG deve ocupar `100%` dessa caixa;
- não usar `transform: scale(...)` para corrigir tamanho de layout;
- preservar o brilho discreto e a animação interna de respiração;
- manter os círculos e o traço atuais sem redesenhar o símbolo.

### Nome da marca

- bloco em duas linhas, sem quebra automática adicional;
- `Startup` em dourado suave;
- `Quest` em creme, criando contraste e leitura mais rápida;
- tamanho de `0.78rem`, definido uma única vez para o lockup;
- peso `800` enquanto a tipografia global atual for mantida;
- `line-height: 1`;
- `letter-spacing: 0.18em`;
- texto em caixa alta.

### Relação entre símbolo e nome

- composição feita com `display: flex`;
- `align-items: center`;
- distância de `10px` entre símbolo e bloco de texto;
- eventuais ajustes ópticos limitados a `1px`, aplicados somente depois de a caixa estrutural estar
  correta;
- símbolo e nome devem entrar como uma unidade visual, evitando animações de chegada desencontradas.

## Posicionamento

- manter a assinatura no canto superior esquerdo e fora do fluxo central do formulário;
- usar posição estável por breakpoint, evitando variação contínua por `clamp()` no eixo vertical;
- no desktop padrão, usar margem de `32px` no topo e `40px` na esquerda;
- em notebooks com altura de até `820px`, usar `16px` no topo e `24px` na esquerda;
- o formulário continua geometricamente centralizado e não pode ser deslocado pela marca.

## Padronização entre etapas e telas

- remover qualquer dependência entre o tamanho da assinatura e `isNameStep`;
- remover a classe redundante `logoRegionNameStep`;
- remover a redução exclusiva de `.contentNameStep .brandTitle`;
- não ocultar o nome da marca entre `761px` e `1100px`, pois a versão em duas linhas já economiza
  largura;
- todas as cinco etapas usam o mesmo JSX, as mesmas dimensões e a mesma animação;
- telas com até `760px` de largura usam um modo compacto estrutural de `48 x 48px`, definido apenas
  pelo breakpoint e igual em todas as etapas.

## Alteração técnica prevista

- adicionar ao `QuestMark` um modo compacto com dimensão real, sem alterar os modos usados pela
  autenticação;
- substituir o texto único `Startup Quest` por dois elementos semânticos dentro do bloco do nome;
- consolidar as regras da assinatura em seletores únicos no CSS da criação da startup;
- preservar o posicionamento absoluto da marca e a centralização independente do cartão.

## Estados e acessibilidade

- a assinatura é identidade visual, não controle interativo;
- o SVG continua decorativo com `aria-hidden="true"`;
- o nome permanece como texto real e legível por tecnologias assistivas;
- em `prefers-reduced-motion: reduce`, a assinatura aparece imediatamente sem animação de entrada ou
  respiração;
- contraste do dourado e do creme deve permanecer legível sobre o fundo escuro.

## Validação obrigatória

Percorrer as cinco etapas e confirmar:

1. mesmo tamanho e posição da assinatura em todas as etapas;
2. alinhamento óptico entre símbolo e bloco em duas linhas;
3. formulário centralizado sem sobreposição;
4. ausência de rolagem nas dimensões desktop suportadas;
5. nome visível em notebooks com largura entre `761px` e `1100px`;
6. comportamento responsivo em `1536 x 720`, `1366 x 768`, `1280 x 720` e `1920 x 900`;
7. ausência de regressão visual nas telas de autenticação que também usam `QuestMark`;
8. `npm run lint`, `npx tsc --noEmit` e `npm run build` executados com sucesso.

## Fora do escopo

- redesenhar o símbolo da Startup Quest;
- trocar a família tipográfica global da plataforma;
- alterar o formulário, os textos ou a sequência das cinco etapas;
- reposicionar o cartão central;
- aplicar a nova assinatura a todas as demais páginas neste mesmo ciclo.
