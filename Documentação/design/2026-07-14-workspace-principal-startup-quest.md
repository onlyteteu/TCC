# Workspace principal da Startup Quest

Data: 14 de julho de 2026

Status: direção aprovada; especificação consolidada para revisão antes da implementação

## Resumo da decisão

A tela `Hoje` passa a ser o painel principal da Startup Quest. Depois da autenticação, a plataforma
abre a última startup usada pelo usuário e o coloca diretamente no trabalho mais importante daquele
momento. O painel genérico provisório e a página longa de detalhes deixam de ser destinos principais.

A área autenticada será organizada como um workspace com:

- shell fixo compartilhado;
- marca compacta e estável no topo da barra lateral;
- Home orientada pela missão principal;
- Jornada guiada e sequencial;
- seletor e gerenciador de startups;
- gamificação ligada a trabalho real;
- módulos futuros visíveis, porém indisponíveis enquanto não tiverem função completa.

Esta mudança substitui decisões visuais provisórias anteriores sempre que houver conflito. O
propósito continua sendo responder com clareza à pergunta `o que eu faço agora?`.

## Problema que esta versão resolve

As telas provisórias atuais apresentam três problemas principais:

1. o painel mostra números e conquistas, mas não conduz o usuário a uma ação concreta;
2. a página da startup empilha muitas informações e formulários em uma única rolagem;
3. a navegação, a marca e os estados de progresso ainda não formam um sistema visual consistente.

O resultado esperado não é apenas um dashboard mais bonito. A plataforma deve funcionar como um
gerenciador guiado: orientar, permitir executar, registrar evidências, revelar o próximo passo e
recompensar progresso verdadeiro.

## Objetivos

- abrir a startup correta sem exigir uma tela intermediária;
- destacar uma única missão principal e sua próxima ação;
- permitir que o usuário entenda o percurso completo sem perder o foco atual;
- separar o que pertence à conta do que pertence a cada startup;
- manter múltiplas startups fáceis de alternar e administrar;
- padronizar a identidade, o layout e os estados entre as telas autenticadas;
- manter o workspace utilizável nas resoluções desktop mais comuns;
- criar uma base estrutural para Missões, Experimentos, Aprendizados, Métricas, Documentos e
  Conquistas crescerem depois.

## Fora do escopo imediato

- implementar por completo todos os módulos futuros;
- otimizar a experiência para celular;
- criar inteligência artificial autônoma que tome decisões pelo fundador;
- transformar recompensas em economia, loja ou moeda virtual;
- redesenhar o símbolo principal da Startup Quest;
- migrar a aplicação para outro provedor de banco nesta etapa.

## Pesquisa de referência

As decisões foram confrontadas com padrões de sistemas de design maduros:

- O [Fluent 2](https://fluent2.microsoft.design/components/web/react/core/nav/usage) recomenda que a
  navegação contenha destinos de alto nível, use linguagem breve e deixe ações de edição fora do
  menu. Por isso, renomear, excluir e criar startups ficam no gerenciador, não na barra lateral.
- O [GOV.UK Design System](https://design-system.service.gov.uk/components/task-list/) distingue
  tarefas disponíveis de tarefas bloqueadas por meio de texto, cor e capacidade de interação. Os
  passos bloqueados da missão serão cinza, não clicáveis e explicarão o requisito necessário.
- O padrão de
  [conclusão de várias tarefas do GOV.UK](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)
  usa estados simples como não iniciado, em andamento e concluído. A Startup Quest adotará estados
  equivalentes, com linguagem em português e sem excesso de chips decorativos.
- O [Progress tracker da Atlassian](https://atlassian.design/components/progress-tracker) é adequado
  para mostrar avanço em uma jornada. Por isso, a sequência rígida da criação e evolução da startup
  será representada na tela Jornada, não como uma lista genérica na Home.
- As [abas da Atlassian](https://atlassian.design/components/tabs/) agrupam informações relacionadas
  na mesma página. `Jornada` e `Mapa inicial` serão duas visões do mesmo contexto da startup.

Essas referências orientam a estrutura e os estados, mas a interface mantém a identidade própria da
Startup Quest.

## Arquitetura escolhida: workspace primeiro

### Entrada após autenticação

O destino `/painel` funciona como resolvedor:

1. busca as startups pertencentes ao usuário;
2. se não houver nenhuma, abre o fluxo de criação;
3. se houver, escolhe a startup com uso mais recente;
4. redireciona para a Home dessa startup.

O usuário não precisa passar por uma tela de resumo toda vez que entra. A lista completa continua
acessível pelo seletor no topo.

### Rotas canônicas

| Rota | Responsabilidade |
| --- | --- |
| `/painel` | Resolver a startup que deve ser aberta |
| `/painel/startup/[startupId]` | Home da startup ativa |
| `/painel/startup/[startupId]/jornada` | Jornada e mapa inicial |
| `/painel/startups` | Gerenciar startups |
| `/painel/startups/nova` | Fluxo de criação em cinco etapas |

As rotas dos módulos futuros só devem ser habilitadas quando houver uma experiência mínima real.
Até lá, os itens aparecem como `Em breve` e não simulam páginas vazias.

### Startup usada por último

Adicionar a `Startup` o campo opcional `last_opened_at`.

- a criação conclui com `last_opened_at` preenchido;
- abrir uma startup pelo seletor atualiza o campo;
- o resolvedor ordena primeiro por `last_opened_at` e usa `updated_at`/`created_at` como desempate;
- o backend sempre valida que a startup pertence ao usuário autenticado;
- se a startup mais recente for excluída, a próxima mais recente se torna a ativa;
- se a última startup for excluída, o usuário volta ao estado vazio e pode criar outra.

O campo registra preferência de navegação, não progresso de negócio.

## Estrutura visual compartilhada

### Shell do workspace

Todas as páginas autenticadas usam o mesmo shell:

- barra lateral fixa à esquerda;
- barra superior fixa dentro da área de trabalho;
- área principal centralizada e com largura controlada;
- rolagem apenas no painel de conteúdo, não no `body` da página;
- fundos decorativos discretos e restritos, sem competir com a informação.

Dimensões de referência:

- sidebar: `272px` em desktop amplo e `240px` em notebook compacto;
- topbar: `72px`;
- conteúdo: largura máxima de `1540px`, centralizado;
- espaçamento externo do conteúdo: `32px`, reduzido para `24px` em notebooks;
- distância entre colunas: `24px`;
- coluna lateral da Home: entre `320px` e `360px`.

O navegador não deve ganhar uma segunda barra de rolagem. A sidebar e a topbar permanecem estáveis;
somente o conteúdo abaixo da topbar pode rolar quando necessário.

### Marca na barra lateral

O problema visto na logo vem de uma composição estreita e sobreposta: o texto quebra fora do bloco
e invade o símbolo. A solução é um lockup horizontal estrutural, sem posicionamento absoluto entre
suas partes.

- região da marca com altura mínima de `76px`;
- símbolo em caixa real de `52 x 52px`;
- nome à direita do símbolo;
- `Startup` na primeira linha e `Quest` na segunda;
- cada linha usa `white-space: nowrap`;
- `12px` de distância entre símbolo e texto;
- alinhamento vertical central;
- anéis e brilho do símbolo limitados à própria região, sem invadir o primeiro item do menu;
- nenhuma correção de tamanho por `transform: scale(...)`;
- o menu começa somente depois da região da marca.

O componente deve reutilizar as proporções da assinatura compacta já definida para a criação da
startup, com variante própria de contraste para o fundo azul-marinho do workspace.

## Navegação lateral

Ordem fixa:

1. Home;
2. Jornada;
3. Missões;
4. Experimentos;
5. Aprendizados;
6. Métricas;
7. Documentos;
8. Conquistas.

Regras:

- somente um destino fica ativo por vez;
- Home e Jornada são funcionais neste ciclo;
- módulos incompletos ficam visualmente atenuados, sem navegação, acompanhados por `Em breve`;
- `Configurações` não ocupa a lista principal enquanto não houver conteúdo suficiente;
- alternar ou gerenciar startups acontece no seletor da topbar;
- sair e acessar perfil acontecem no menu do avatar;
- ícone, texto e área ativa formam uma única linha clicável;
- a cor âmbar é reservada ao destino ativo, à progressão atual e às ações principais.

## Topbar

A barra superior contém:

- seletor da startup ativa à esquerda;
- sequência de dias (`fogo`) da conta;
- nível global e XP;
- avatar com perfil e saída.

O seletor mostra o nome atual e abre um popover curto com:

- startups recentes;
- ação `Ver todas as startups`;
- ação `Criar nova startup`.

O popover serve para alternância rápida. Renomear e excluir ficam na tela de gerenciamento.

## Home: painel principal

### Cabeçalho

- saudação com o nome do usuário;
- uma frase curta que contextualiza o foco atual;
- nada de hero decorativo ou estatísticas gigantes.

### Missão principal

A missão ocupa a maior área da tela e contém:

- rótulo `Missão principal`;
- recompensa em XP;
- título orientado à ação;
- explicação curta do motivo;
- contador e barra de progresso;
- passos da missão;
- dica contextual;
- ação principal coerente com o próximo passo.

Exemplo aprovado: `Converse com 5 potenciais clientes`.

Estados dos passos:

| Estado | Aparência | Interação |
| --- | --- | --- |
| Em andamento | número/ícone âmbar e texto normal | linha e ação disponíveis |
| Disponível | texto normal e indicador discreto | linha e ação disponíveis |
| Concluído | confirmação em verde/teal | abre evidência ou resumo |
| Bloqueado | cinza e cadeado | sem clique; informa o pré-requisito |

Os nomes são curtos, em frase normal, e a linha inteira pode abrir a atividade quando ela estiver
disponível. O estado é texto informativo, não uma coleção de botões em formato de etiqueta.

### Coluna de contexto

Três cartões compactos:

1. sequência diária: situação do fogo e ação necessária para mantê-lo;
2. nível: XP atual, próximo nível e barra de progresso;
3. fase da startup: nome, percentual e explicação de como melhorar sua saúde.

A sequência e o nível pertencem à conta. A fase e a missão pertencem à startup ativa.

### Conteúdo inferior

Depois da missão principal:

- atividade recente da startup;
- próximo desbloqueio relevante;
- no máximo um resumo secundário por coluna.

Não retornarão os três cartões gigantes de números nem a fileira de chips de conquistas. Conquistas
terão tela própria quando implementadas; na Home aparecem apenas como evento quando forem obtidas.

## Jornada

### Propósito

Mostrar onde a startup está no percurso completo e permitir continuar a etapa atual sem transformar
a tela em um formulário longo.

### Cabeçalho compacto

- nome da fase atual;
- quantidade de etapas concluídas;
- barra geral de progresso;
- ação `Continuar etapa atual`.

### Abas

- `Jornada`: sequência operacional;
- `Mapa inicial`: síntese editável das respostas da fundação.

As abas trocam somente o conteúdo central e preservam shell, startup e contexto.

### Visão Jornada

Layout mestre-detalhe:

- coluna esquerda com a lista ordenada de etapas;
- coluna direita com conteúdo, explicação, evidências e ação da etapa selecionada;
- a etapa atual abre por padrão;
- etapas concluídas podem ser revisitadas;
- etapas futuras mostram o requisito de desbloqueio e não aceitam edição.

Estados:

- concluída: ícone teal e resumo disponível;
- atual: realce âmbar e ação principal;
- disponível: neutra e clicável;
- bloqueada: cinza, cadeado e motivo explícito.

A sequência é rígida onde houver dependência real. O usuário sempre pode retornar a uma etapa
concluída para consultar evidências, mas a alteração de respostas críticas deve informar possíveis
efeitos em etapas posteriores.

### Visão Mapa inicial

Organiza nome, ideia, território, problema, público e objetivo inicial como seções de resumo. Cada
seção tem uma ação `Editar` localizada. A tela não abre todos os campos simultaneamente e não usa
cartões aninhados desnecessários.

## Gerenciador de startups

A tela `/painel/startups` substitui o painel antigo como local de administração. Ela utiliza uma
lista compacta, não cartões enormes.

Cada linha apresenta:

- nome;
- fase atual;
- progresso;
- última atividade;
- indicação da startup aberta atualmente;
- menu de ações.

Ações:

- abrir;
- renomear;
- excluir;
- criar nova startup.

Excluir exige confirmação com o nome da startup e deixa claro que jornada, missões e evidências
associadas serão removidas. O botão principal da página é `Criar nova startup`.

## Gamificação

### Escopo global da conta

- sequência diária;
- nível;
- XP acumulado;
- perfil;
- histórico geral de conquistas.

### Escopo da startup

- fase;
- progresso da jornada;
- missão ativa;
- evidências;
- aprendizados;
- eventos de atividade.

### Regras de produto

- XP é concedido por trabalho verificável, não por abrir páginas;
- a missão só conclui quando todos os requisitos e evidências obrigatórios forem atendidos;
- o fogo avança quando houver pelo menos uma atividade válida no dia;
- registrar várias ações artificiais no mesmo dia não multiplica a sequência;
- recompensas devem explicar qual comportamento útil foi reconhecido;
- animações de conquista são curtas e não interrompem o fluxo.

## Sistema visual do workspace

### Cores funcionais

- fundo principal: azul-marinho quase preto;
- superfícies: azul-marinho um nível acima do fundo;
- bordas: azul acinzentado discreto;
- texto principal: creme quase branco;
- texto secundário: azul acinzentado claro;
- âmbar: ação principal, estado atual e XP;
- teal: conclusão, confirmação e informação saudável;
- laranja: fogo/sequência;
- cinza: indisponível e bloqueado.

O fundo orbital/quadriculado da autenticação e criação não domina o workspace. A área autenticada é
uma ferramenta de trabalho e deve priorizar legibilidade e densidade controlada.

### Tipografia e densidade

- títulos claros, sem tamanhos de landing page;
- corpo mínimo equivalente a `16px` nas áreas principais;
- rótulos curtos e consistentes;
- cantos entre `12px` e `16px` nos painéis;
- sombras raras; separação feita principalmente por superfície e borda;
- sem gradientes em texto;
- sem excesso de cápsulas, brilhos ou bordas douradas.

### Movimento

- transições de estado entre `150ms` e `250ms`;
- animação apenas para orientar mudança, progresso ou recompensa;
- respeitar `prefers-reduced-motion`;
- nenhum movimento contínuo que distraia durante o trabalho.

## Comportamento por resolução

Prioridade: desktop e notebook.

- `1920 x 900` e `1536 x 864`: layout completo com coluna lateral de até `360px`;
- `1366 x 768` e `1280 x 720`: sidebar de `240px`, espaçamentos menores e coluna lateral de
  `300–320px`;
- abaixo do espaço necessário para duas colunas, os cartões de contexto passam para baixo da missão;
- a aplicação preserva funcionalidade básica em telas menores, mas não haverá otimização móvel
  detalhada neste ciclo.

Não se reduz toda a interface com `transform: scale`. A adaptação acontece por grid, limites de
largura, espaçamento e tipografia responsiva controlada.

## Estados obrigatórios

### Carregamento

- shell estável;
- skeletons com as mesmas dimensões do conteúdo;
- nenhuma troca brusca de fundo ou logo.

### Erro

- mensagem localizada na região que falhou;
- ação de tentar novamente;
- sessão expirada redireciona para login preservando, quando seguro, o destino pretendido.

### Sem startup

- explicação curta;
- ação principal `Criar minha startup`;
- fluxo de criação existente reutilizado.

### Missão indisponível

- explicar por que ainda não há missão;
- oferecer a ação da Jornada que desbloqueia a próxima missão;
- nunca deixar um painel vazio sem direção.

### Exclusão da startup ativa

- fechar menus e modais;
- escolher a próxima startup recente;
- se não houver outra, abrir o estado sem startup.

## Acessibilidade

- navegação completa por teclado;
- foco visível em todos os controles;
- estado ativo não depende apenas de cor;
- ícones decorativos usam `aria-hidden`;
- botões com ícone isolado recebem nome acessível;
- barras de progresso expõem valor, mínimo e máximo;
- conteúdos bloqueados explicam textualmente o motivo;
- contraste mínimo adequado em textos, bordas funcionais e estados;
- popover do seletor devolve o foco ao controle que o abriu;
- modal de exclusão controla foco e fecha com `Escape`.

## Organização de componentes

Estrutura sugerida para evitar páginas monolíticas:

- `WorkspaceShell` — sidebar, topbar e área rolável;
- `WorkspaceBrand` — lockup horizontal da marca;
- `WorkspaceSidebar` — destinos e estados;
- `WorkspaceTopbar` — seletor, fogo, nível e perfil;
- `StartupSwitcher` — alternância rápida;
- `MissionFocusPanel` — missão e passos;
- `FounderProgressRail` — sequência e nível globais;
- `StartupPhaseCard` — fase local;
- `JourneyWorkspace` — abas e layout mestre-detalhe;
- `StartupManager` — lista e operações administrativas.

Os componentes de negócio recebem dados; a resolução de startup, autenticação e chamadas de API
ficam nas rotas e camadas de serviço. Home e Jornada compartilham o mesmo shell real, não cópias de
markup e CSS.

## Escopo da primeira implementação

1. corrigir e componentizar a marca do workspace;
2. criar o shell compartilhado;
3. transformar a tela `Hoje` em Home canônica;
4. fazer `/painel` abrir a última startup usada;
5. criar o seletor e o gerenciador de startups;
6. reorganizar a Jornada no layout mestre-detalhe com as duas abas;
7. retirar o painel provisório e a página longa do caminho principal;
8. manter os módulos futuros desabilitados e identificados como `Em breve`;
9. atualizar documentação, rotas e testes.

## Critérios de aceitação

### Navegação e dados

- login com startups abre a última utilizada;
- login sem startups abre a criação;
- alternar startup atualiza Home, Jornada e `last_opened_at`;
- nenhuma startup de outro usuário pode ser consultada ou marcada como ativa;
- excluir a startup ativa aplica o fallback definido;
- Home e Jornada preservam a startup selecionada.

### Interface

- a marca mostra `Startup` e `Quest` em duas linhas, sem sobreposição, em todas as resoluções-alvo;
- sidebar e topbar ficam fixas;
- somente o conteúdo principal rola;
- Home mantém a missão como elemento dominante;
- não existem cartões gigantes de métricas nem fileira de chips de conquistas;
- passos bloqueados são não interativos e explicam o requisito;
- Jornada abre a etapa atual e distingue concluída, atual, disponível e bloqueada;
- os módulos futuros não abrem telas vazias.

### Verificação técnica

- testes do backend para ordenação, propriedade, atualização e exclusão da startup recente;
- testes dos endpoints de Home, Jornada e missões existentes;
- lint do frontend;
- verificação TypeScript sem emissão;
- build de produção;
- inspeção visual em `1920 x 900`, `1536 x 864`, `1366 x 768` e `1280 x 720`;
- navegação por teclado nos destinos, seletor, missão, abas e modal de exclusão;
- ausência de rolagem dupla e de regressão nas telas de login e criação.

## Documentação que deverá acompanhar a implementação

- `Documentação/telas.md`: novas responsabilidades de Home, Jornada e Gerenciamento;
- `Documentação/fluxos.md`: entrada, troca, criação e exclusão de startup;
- `Documentação/funcionalidades.md`: escopo global e local da gamificação;
- `Documentação/arquitetura-missoes.md`: relação entre missão, passos, evidências e XP;
- `Documentação/progresso.md`: componentes concluídos e validações executadas;
- `Documentação/proximos-passos.md`: módulos adiados e ordem sugerida.

## Decisões aprovadas pelo usuário

- usar a tela `Hoje` como base do painel;
- aplicar arquitetura de workspace;
- abrir a última startup utilizada;
- criar gerenciador para múltiplas startups;
- compartilhar shell entre Home e Jornada;
- mover a logo para uma composição horizontal compacta no topo da sidebar;
- manter o nome da marca em duas linhas;
- separar progresso global da conta e progresso local da startup;
- priorizar computador;
- pesquisar padrões externos antes de consolidar a solução.
