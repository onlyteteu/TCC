# Painel 2.0 do workspace

**Data:** 31 de agosto de 2026
**Status:** direção aprovada; especificação para revisão antes do plano de implementação

## Resumo da decisão

O primeiro ciclo de retomada da Startup Quest redesenhará o workspace autenticado sem alterar o
backend, o catálogo de missões ou os contratos das APIs. O objetivo é fazer a interface comunicar a
maturidade que o produto já possui: uma ferramenta guiada de trabalho empreendedor, e não um
dashboard genérico com gamificação aplicada por cima.

O ciclo combina três mudanças coordenadas:

1. criar uma fundação visual compartilhada para o workspace;
2. simplificar shell, sidebar e topbar;
3. reorganizar a Home para que missão, evidência e consequência formem uma única linha de trabalho.

Home, Jornada e Missões continuam com responsabilidades distintas. A criação da startup permanece
mais atmosférica; o workspace usa a mesma identidade em um registro mais calmo, denso e confiável.

## Problema atual

A área autenticada é funcional e bem testada, mas ainda apresenta cinco problemas de percepção e
uso:

- cores, superfícies, bordas e medidas são repetidas diretamente em vários módulos CSS;
- Home, Jornada e Missões usam variações próximas, porém não idênticas, do mesmo vocabulário;
- a sidebar exibe cinco destinos indisponíveis e faz o produto parecer incompleto;
- nível, sequência e progresso aparecem em mais de um lugar e competem com a missão;
- a Home distribui a atenção entre painéis semelhantes, quando deveria deixar uma próxima ação
  inequivocamente dominante.

O redesenho não deve esconder funcionalidade nem trocar consistência por decoração. Seu sucesso é
o usuário identificar, em poucos segundos, o que precisa fazer, por que isso importa e qual
resultado será incorporado à memória da startup.

## Objetivos

- transformar o workspace em uma ferramenta visualmente coesa e confiável;
- manter uma única ação principal por estado da Home;
- aproximar evidência, aprendizado e próximo desbloqueio da missão que os produz;
- separar progresso global da conta de progresso local da startup;
- reduzir ruído da navegação sem apagar a visão futura do produto da documentação;
- criar tokens e componentes que sustentem os próximos ciclos sem novas paletas paralelas;
- preservar rotas, payloads, regras de XP, permissões e comportamento transacional existentes;
- manter os quatro viewports desktop de referência e uma base funcional em larguras menores.

## Fora do escopo

- alterar modelos, migrations, endpoints ou respostas do backend;
- criar as missões 6 a 10, Experimentos, Decisões ou novos módulos;
- redesenhar os formulários das missões neste ciclo;
- refazer autenticação ou criação da startup;
- reescrever a página institucional `/sobre`;
- criar otimização mobile completa;
- adicionar IA, novos eventos de XP ou recompensas;
- mudar o símbolo ou o nome Startup Quest.

Esses itens permanecem no roadmap geral e recebem especificações próprias depois que o Painel 2.0
estiver validado.

## Princípios de interface

### Trabalho antes de status

A missão e sua próxima ação ocupam a maior área e recebem o maior contraste. Progresso, XP e
atividade informam contexto, mas nunca disputam o primeiro olhar.

### Competência antes de pontos

O workspace descreve o resultado empreendedor conquistado. XP e sequência funcionam como
confirmação secundária, não como título da experiência.

### Uma superfície, uma responsabilidade

Painéis só existem quando agrupam informações que precisam ser compreendidas em conjunto. Listas e
seções usam divisórias e espaço antes de criarem novos cartões. Não haverá cartões aninhados.

### Familiaridade de ferramenta

Botões, campos, menus, estados, skeletons e feedbacks seguem padrões reconhecíveis. Personalidade
vem da composição, do texto e dos momentos de progresso, não de controles inventados.

### Estado explicado por texto

Atual, concluído, bloqueado, erro e sucesso nunca dependem apenas de cor ou ícone.

## Fundação visual

### Tokens semânticos

O workspace passa a usar custom properties prefixadas com `--sq-`, evitando colisão com os tokens
claros e antigos ainda usados por `/sobre`. Os valores iniciais consolidam a paleta já validada:

| Papel | Token | Valor inicial |
| --- | --- | --- |
| Fundo do workspace | `--sq-bg` | `#070b13` |
| Fundo da sidebar | `--sq-sidebar` | `#060a12` |
| Superfície principal | `--sq-surface` | `#0b111c` |
| Superfície elevada | `--sq-surface-raised` | `#111927` |
| Superfície interativa | `--sq-surface-interactive` | `#152033` |
| Borda padrão | `--sq-border` | `#203145` |
| Borda forte | `--sq-border-strong` | `#2b3d52` |
| Texto principal | `--sq-text` | `#f7efe3` |
| Texto secundário | `--sq-text-muted` | `#9aa8b8` |
| Texto discreto | `--sq-text-subtle` | `#7f8da0` |
| Ação e estado atual | `--sq-accent` | `#f2a51a` |
| Ação em hover | `--sq-accent-hover` | `#ffb630` |
| Sucesso | `--sq-success` | `#bfe8ce` |
| Fundo de sucesso | `--sq-success-bg` | `#10241b` |
| Erro | `--sq-danger` | `#ffaaaa` |

Também serão centralizados:

- espaçamento: `4`, `8`, `12`, `16`, `24` e `32px`;
- raios: `8`, `12` e `16px`, além de pílula somente para tags e indicadores compactos;
- duração: `160ms` para interação e `220ms` para mudança de estado;
- foco: contorno sólido de `2px` âmbar com afastamento de `3px`;
- largura máxima do conteúdo: `1540px`.

Os tokens ficam disponíveis globalmente, mas o ciclo migra apenas o workspace. Autenticação,
criação e `/sobre` não serão convertidos parcialmente.

### Tipografia

- uma única família sans para títulos, controles e corpo do produto;
- escala fixa e compacta, sem títulos de landing page;
- título de página entre `1.9rem` e `2.3rem` conforme o contexto;
- títulos de seção entre `1rem` e `1.35rem`;
- corpo principal em `1rem`, textos auxiliares nunca menores que `0.78rem`;
- pesos usados para hierarquia, sem excesso de caixa alta e espaçamento entre letras;
- linhas explicativas limitadas a aproximadamente `70ch`.

### Componentes e estados

O vocabulário comum inclui:

- ação primária âmbar preenchida;
- ação secundária neutra com borda;
- ação textual para navegação contextual;
- superfície padrão, superfície de destaque e seção sem card;
- status textual de atual, disponível, concluído e bloqueado;
- skeleton com a geometria final do conteúdo;
- feedback inline de sucesso, erro e informação;
- menu/popover com a mesma superfície e o mesmo foco do restante do workspace.

Todo controle interativo precisa de estado padrão, hover, foco, ativo, desabilitado e carregando.

## Shell do workspace

### Sidebar

A navegação principal exibirá somente destinos funcionais:

1. Home;
2. Jornada;
3. Missões.

Experimentos, Aprendizados, Métricas, Documentos e Conquistas deixam de aparecer como linhas
desabilitadas. Eles continuam documentados no roadmap e serão adicionados quando cada módulo tiver
dados, estados vazios, regras e testes reais.

A sidebar preserva:

- marca compacta no topo;
- item ativo com texto, ícone e superfície diferenciados;
- foco visível;
- largura de `272px` em desktop amplo e `240px` nos notebooks definidos;
- ausência de rolagem própria no layout desktop.

O espaço liberado não recebe decoração nem atalhos artificiais.

### Topbar

A topbar mantém:

- seletor da startup ativa à esquerda;
- sequência e nível globais em formato compacto;
- avatar e menu de conta à direita.

Nível e sequência permanecem aqui como contexto persistente da conta e deixam de ser repetidos como
cartões na Home. O seletor continua oferecendo troca rápida, gerenciamento e criação de startups.

### Área de conteúdo

- somente a área abaixo da topbar rola;
- a atmosfera orbital continua discreta e restrita ao plano de fundo;
- conteúdo centralizado em até `1540px`;
- padding de `32px`, reduzido para `24px` e depois `18px` conforme a largura;
- nenhuma escala global por `transform`.

## Home redesenhada

### Hierarquia geral

A Home terá três níveis, nesta ordem:

1. contexto do dia;
2. trabalho principal;
3. continuidade e histórico.

Ela não será uma coleção de métricas. O primeiro viewport deve mostrar a saudação, a missão e a
próxima ação sem exigir rolagem nas quatro resoluções desktop de referência.

### Contexto do dia

O cabeçalho usa saudação neutra `Olá, {nome}` para não depender do horário. A frase abaixo é
derivada do estado atual:

- com missão: objetivo resumido da missão recomendada;
- arco concluído: reconhecimento do arco e convite para revisão;
- bloqueio: explicação do requisito que precisa ser resolvido.

Não haverá números, chips ou ação adicional no cabeçalho.

### Zona principal de trabalho

O layout desktop possui:

- coluna principal flexível com a missão;
- coluna contextual entre `300px` e `340px` com o estado local da startup.

A missão apresenta:

- motivo da recomendação;
- título e objetivo;
- progresso verificável;
- passos com estados textuais;
- dica contextual;
- recompensa em posição secundária;
- uma ação primária coerente com o próximo requisito.

Passos concluídos podem abrir seu registro. Passos bloqueados não são clicáveis e informam o
pré-requisito. O painel não duplica instruções completas que pertencem ao fluxo de execução.

A coluna contextual apresenta somente informações locais da startup:

- capítulo e marco atuais;
- progresso do arco;
- próximo desbloqueio;
- ação para abrir a Jornada quando necessário.

Ela substitui a repetição de nível e sequência na Home.

### Continuidade e histórico

Abaixo da zona principal haverá duas seções compactas:

- atividade recente;
- próximo resultado ou desbloqueio.

As seções usam divisórias e linhas, evitando um novo mosaico de cartões. Se não houver atividade,
o estado vazio ensina qual primeira ação produzirá um registro.

### Evidências e execução

O fluxo guiado de entrevistas, as fichas de evidência e o registro de aprendizado continuam
contextuais à missão. Eles não serão duplicados no overview da Home. Ao abrir o trabalho, o usuário
deve manter acesso ao contexto acumulado e retornar ao overview sem perder rascunho.

### Estados especiais

#### Carregamento

- shell permanece estável;
- skeleton representa cabeçalho, missão e coluna contextual;
- nenhuma marca giratória isolada no centro da página.

#### Erro

- erro de carregamento substitui apenas o conteúdo da Home;
- mensagem usa linguagem do usuário, sem citar Django, proxy ou backend;
- oferece `Tentar novamente` e uma rota segura para o painel.

#### Arco concluído

- reconhece o resultado empreendedor, não apenas o fim das missões;
- oferece revisão da trilha;
- não inventa missão, progresso ou conteúdo futuro.

#### Próxima missão bloqueada

- explica qual requisito falta;
- oferece a ação que resolve o bloqueio;
- não exibe um painel vazio.

#### Ambiente de teste

O banner reiniciável e o botão de conclusão continuam funcionais, mas permanecem visualmente
separados do produto normal e não alteram a hierarquia da missão.

## Responsividade

Viewports de aceite:

- `1920 x 900`;
- `1536 x 864`;
- `1366 x 768`;
- `1280 x 720`.

Regras:

- a missão e sua ação principal devem aparecer no primeiro viewport desktop;
- a coluna contextual passa para baixo da missão quando não houver largura segura;
- topbar reduz texto auxiliar antes de remover ações;
- abaixo de `980px`, o shell preserva funcionalidade, mas a otimização mobile completa fica fora do
  ciclo;
- conteúdo longo quebra sem overflow horizontal;
- menus e diálogos não podem ser cortados por containers com `overflow`.

## Acessibilidade e movimento

- contraste mínimo de `4.5:1` para textos comuns e `3:1` para texto grande e elementos funcionais;
- alvos principais com pelo menos `44px` de altura;
- foco visível em todos os controles;
- item ativo, conclusão e bloqueio acompanhados por texto;
- ordem de tabulação acompanha a ordem visual;
- headings formam uma hierarquia sem saltos;
- barras expõem `role`, valor atual, mínimo, máximo e nome acessível;
- feedback assíncrono usa regiões vivas sem tomar o foco;
- transições não animam largura, altura, padding ou margin;
- `prefers-reduced-motion` remove movimento não essencial;
- teclado alcança sidebar, seletor, ação da missão, passos disponíveis e ações secundárias.

## Arquitetura de componentes

O ciclo reutiliza componentes existentes e melhora limites sem reescrever o domínio:

- `WorkspaceShell`: aplica tokens, layout e área rolável;
- `WorkspaceSidebar`: renderiza apenas destinos funcionais;
- `WorkspaceTopbar`: mantém seletor, progresso global e conta;
- `MissionFocusPanel`: concentra missão, passos e ação principal;
- `FounderProgressRail`: deixa de misturar progresso global e local; sua responsabilidade local é
  extraída para um painel de progresso da startup;
- `StartupProgressPanel`: novo componente de apresentação para capítulo, marco e desbloqueio;
- `RecentActivity`: lista compacta, sem card aninhado;
- `NextUnlock`: resumo compacto conectado ao estado atual;
- `StartupHomeScreen`: orquestra dados e estados, sem duplicar markup de componentes.

Os tipos e payloads atuais permanecem a fonte de dados. A reorganização não cria cálculo paralelo
no frontend; progresso, recomendação, bloqueios e gamificação continuam derivados pelo backend.

## Dados e comportamento preservados

- `GET /api/startups/<id>/today/` permanece o payload da Home;
- o callback de reconciliação do workspace continua após mutações;
- conclusão e XP permanecem idempotentes;
- ambiente de teste continua restrito à startup autorizada;
- sessão, isolamento entre contas e navegação canônica não mudam;
- Jornada e Central continuam usando os endpoints atuais;
- nenhum dado existente será migrado ou reinterpretado.

## Estratégia de implementação

O trabalho será dividido em cinco incrementos verificáveis:

1. tokens e contratos visuais;
2. sidebar e topbar;
3. composição da Home e progresso local;
4. estados, responsividade e acessibilidade;
5. documentação e validação final.

Cada incremento começa por testes de contrato ou comportamento que falhem pelo motivo esperado.
Mudanças visuais não dependerão apenas de snapshots textuais: haverá inspeção renderizada nos quatro
viewports de aceite.

## Critérios de aceitação

### Percepção e hierarquia

- em até cinco segundos, a missão e a próxima ação são o primeiro foco da Home;
- criação e workspace parecem partes da mesma marca, com registros apropriados a cada contexto;
- o workspace não apresenta cinco módulos indisponíveis na navegação;
- XP, nível e sequência não são repetidos como cartões na Home;
- não existem cartões aninhados na composição principal;
- o primeiro viewport desktop contém contexto, missão e ação principal.

### Consistência

- shell, Home, Jornada e Missões consomem os mesmos tokens semânticos migrados;
- botões equivalentes possuem a mesma geometria, foco e estados;
- superfícies e bordas têm papéis definidos, sem novas cores literais para o mesmo papel;
- carregamento, erro, sucesso, bloqueio e vazio seguem o vocabulário comum;
- os tokens antigos de `/sobre` não contaminam o workspace.

### Comportamento

- todas as rotas atuais continuam funcionando;
- seletor, perfil, logout e navegação por startup preservam o comportamento;
- missão, entrevistas, evidências, aprendizado e ambiente de teste mantêm seus fluxos;
- arco concluído e bloqueio continuam honestos;
- nenhuma alteração de backend ou migration é necessária.

### Qualidade técnica

- testes frontend existentes continuam aprovados e recebem cobertura para a nova hierarquia;
- `npm.cmd run lint` passa;
- `npm.cmd run build` passa;
- testes Django continuam aprovados como verificação de não regressão dos contratos;
- não há overflow horizontal nem rolagem dupla nos viewports de aceite;
- percurso por teclado cobre shell e Home;
- contraste e foco são conferidos na interface renderizada;
- o detector visual não aponta novos antipadrões no escopo alterado.

## Documentação que acompanha o ciclo

- criar `DESIGN.md` com tokens e princípios duráveis depois que a implementação confirmar os
  valores finais;
- atualizar `Documentação/telas.md` para a nova Home e navegação;
- atualizar `Documentação/funcionalidades.md` sem declarar módulos futuros como ativos;
- atualizar `Documentação/progresso.md` com verificações executadas;
- atualizar `Documentação/proximos-passos.md` para registrar o próximo ciclo;
- corrigir em ciclo separado as referências de porta e o conteúdo institucional desatualizado.

## Decisões aprovadas

- começar pelo Painel 2.0 antes de ampliar o catálogo de missões;
- adotar o redesenho sistemático, não um facelift isolado;
- preservar backend e contratos atuais;
- criar fundação visual compartilhada;
- simplificar a sidebar para destinos funcionais;
- reorganizar a Home como bancada de trabalho;
- manter a criação mais atmosférica e o workspace mais produtivo;
- validar com testes e inspeção visual real antes de declarar o ciclo concluído.
