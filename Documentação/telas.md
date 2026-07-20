# Telas

## Estado atual

Em 2026-07-20, o workspace principal inclui Home, Central de missão, detalhe de missão, Jornada
e gerenciamento. Depois da autenticação, o produto resolve a startup mais recente e abre uma
experiência única com sidebar fixa, topbar, seletor e somente a área de conteúdo rolável. A
prioridade desta versão é desktop.

## Workspace principal implementado

### Home da startup

- rota `/painel/startup/<id>`;
- concentra a missao principal, seus passos e o proximo gesto esperado;
- registra entrevistas como evidencias e libera a sintese dos aprendizados no momento correto;
- mostra XP, nivel global, sequencia de dias, fase, atividade recente e proximo desbloqueio;
- usa estados explicitos de carregamento, erro, bloqueio, envio e celebracao.
- distingue o arco concluído de uma recomendação temporariamente indisponível.

### Central de missão

- rota `/painel/startup/<id>/missoes`;
- mostra uma missão em foco com motivo da recomendação e recompensa;
- exibe `Também disponível` apenas quando existe outra missão realmente liberada;
- organiza a trilha por estados e deixa bloqueios compreensíveis por texto, não apenas por cor;
- permite abrir linhas disponíveis/concluídas por teclado e mantém as bloqueadas sem ação falsa;
- trata carregamento, sessão inválida, startup ausente, erro de rede e arco concluído.

### Detalhe e execução da missão

- rota `/painel/startup/<id>/missoes/<missionKey>`;
- apresenta orientações, motivo, critério, progresso e recompensa;
- oferece formulários explícitos para problema, público, proposta de valor e alternativas;
- associa dicas e erros aos campos e congela controles durante o envio;
- explica todos os pré-requisitos quando bloqueada;
- apresenta evidências em modo leitura quando concluída;
- encaminha entrevistas à Home, preservando um único fluxo para essa missão.

### Jornada

- rota `/painel/startup/<id>/jornada`;
- usa composicao mestre-detalhe: lista as oito etapas e abre uma por vez;
- a etapa atual abre por padrao, etapas concluidas podem ser revisitadas e etapas futuras explicam
  o pre-requisito sem oferecer uma acao falsa;
- as abas `Etapa` e `Mapa inicial` preservam a mesma rota e possuem navegacao por teclado;
- o Mapa inicial edita uma secao por vez: nome, ideia, segmento, problema, publico e objetivo.

### Gerenciamento de startups

- rota `/painel/startups`;
- lista as startups com fase, progresso, ultima atividade e identificacao da startup ativa;
- permite abrir, renomear e excluir uma startup;
- a exclusao exige digitacao do nome e escolhe um fallback seguro quando a startup ativa e removida;
- a criacao dedicada permanece em `/painel/startups/nova`.

### Modulos visiveis, mas desabilitados

Experimentos, Aprendizados, Metricas, Documentos, Conquistas e Configuracoes continuam na
navegacao como arquitetura futura. Eles aparecem como `em breve`, sem links falsos ou conteudo de
demonstracao apresentado como funcional. Missoes deixou esse grupo: a Central e o detalhe do
Incremento 1 estao ativos.

### Validação de interface do Incremento 1

Os componentes possuem testes de semântica, foco, navegação, loading, erro, bloqueio, envio e
leitura. O CSS foi construído para desktop com contenção de largura, `min-width: 0`, truncamento e
breakpoint estrutural. A inspeção visual manual final nos quatro viewports-alvo permanece uma
checagem de aceitação separada; ela não é inferida apenas da suíte automatizada.

## Referencias historicas de design

Os mockups e relatos desta secao registram a evolucao do projeto. Quando citam `painel`, `Suas
startups` ou `pagina de detalhe`, descrevem interfaces anteriores a 2026-07-14, nao as rotas e
componentes vigentes do workspace.

Foram criados mockups visuais que orientaram a tela de login/cadastro implementada:

- `Documentação/mockups/login-cadastro-v1.svg`
- `Documentação/mockups/login-cadastro-v1.png`
- `Documentação/mockups/login-cadastro-v2.svg`
- `Documentação/mockups/login-cadastro-v2.png`
- `Documentação/mockups/login-cadastro-v3.svg`
- `Documentação/mockups/login-cadastro-v3.png`
- `Documentação/mockups/login-cadastro-v5.svg`
- `Documentação/mockups/login-cadastro-v5.png`
- `Documentação/mockups/login-cadastro-v6.svg`
- `Documentação/mockups/login-cadastro-v6.png`
- `Documentação/mockups/login-cadastro-v7.svg`
- `Documentação/mockups/login-cadastro-v7.png`
- `Documentação/mockups/login-cadastro-v8.svg`
- `Documentação/mockups/login-cadastro-v8.png`
- `Documentação/mockups/login-cadastro-v9.svg`
- `Documentação/mockups/login-cadastro-v9.png`
- `Documentação/mockups/login-cadastro-v10.svg`
- `Documentação/mockups/login-cadastro-v10.png`

Tambem foi criado um mockup visual de referencia para a tela inicial do painel de startups em:

- `Documentação/mockups/painel-startups-v1.svg`
- `Documentação/mockups/painel-startups-v1.png`

Tambem foi criado um mockup visual de referencia para a home geral da conta em:

- `Documentação/mockups/hub-inicial-v1.svg`
- `Documentação/mockups/hub-inicial-v1.png`
- `Documentação/mockups/hub-inicial-v2.svg`

Tambem foi criado um mockup visual de referencia para a tela vazia de criacao da startup em:

- `Documentação/mockups/criar-startup-v1.svg`
- `Documentação/mockups/criar-startup-v1.png`

Tambem foi criado um mockup visual de referencia para a segunda etapa de criacao da startup em:

- `Documentação/mockups/ideia-startup-v1.svg`

Tambem foi criado um mockup visual de referencia para a etapa de segmento em:

- `Documentação/mockups/segmento-startup-v1.svg`

Tambem foi criado um mockup visual de referencia para a etapa de problema em:

- `Documentação/mockups/problema-startup-v1.svg`

Tambem foi criado um mockup visual de referencia para a etapa de publico inicial em:

- `Documentação/mockups/publico-startup-v1.svg`

## 1. Tela principal de login/cadastro implementada

### Funcao

Permitir entrada real na plataforma, com alternancia entre login e criacao de conta.

### Elementos implementados

- card central unico
- alternancia entre `Entrar` e `Criar conta`
- campos reais de autenticacao
- logo central com respiracao sutil
- transicao mais fluida entre login e cadastro
- logo que reduz e sobe no modo de cadastro
- reorganizacao compacta do formulario no cadastro para caber melhor sem rolagem
- botao principal com base escura translcida e contorno laranja neon sutilmente animado
- fundo com atmosfera quente, escura e futurista
- validacao visual de erros
- redirecionamento para `/painel`, que resolve a criacao ou a Home da startup mais recente
- portal curto de transicao apos login/cadastro bem-sucedido, antes de abrir a area interna

### Problema que resolve

Substitui o mockup aprovado por uma experiencia funcional alinhada ao estilo desejado.

### Relacao com o objetivo do projeto

Cria a primeira interacao concreta do usuario com o produto.

## 1A. Pagina institucional em `/sobre`

### Funcao

Preservar a apresentacao da proposta da plataforma, do recorte do TCC e dos pilares iniciais.

### Papel no projeto

Mantem a camada institucional acessivel sem competir com a tela principal de autenticacao.

## 2. Tela de cadastro da startup

### Funcao

Coletar os dados iniciais da startup.

### Papel no projeto

Define o contexto da jornada e evita que o sistema comece sem informacoes basicas.

### Estado atual implementado

- exibida em `/painel/startups/nova`; `/painel` apenas resolve o destino correto
- campo principal para nome da startup
- opcao para continuar sem definir o nome ainda
- fluxo em etapas para nome, ideia curta, segmento, problema e publico inicial
- criacao real persistida no backend apenas no fim da jornada inicial
- transicao automatica para a Home da startup criada apos sucesso
- entrada visual por camadas, com flare inicial, marca, logo, card e formulario aparecendo em sequencia
- troca de etapas refinada com titulo entrando letra por letra e bloco da pergunta aparecendo com fade/blur curto
- paginas internas da jornada devem conter a largura do card dentro da viewport, sem exigir rolagem lateral
- a primeira porta de nome deve manter uma composicao mais ritualistica/espacada
- as portas seguintes devem evitar fundo excedente abaixo do card e manter a decisao principal proxima da primeira dobra

### Direcao visual do mockup mais recente

- pagina quase vazia, com foco em um unico gesto principal
- fundo premium com atmosfera forte e pouca poluicao
- bloco central chamando o usuario para comecar
- campo unico para nomear a startup
- opcao discreta para continuar mesmo sem definir o nome ainda
- CTA principal `Criar startup`
- composicao mais marcante e levemente punk, sem pesar

## 2A. Tela de login/cadastro

### Funcao

Permitir que o usuario entre na plataforma ou crie uma nova conta a partir de um unico bloco
central.

### Direcao visual definida

- fundo escuro com atmosfera futurista
- fundo em atmosfera de galaxia com tons quentes
- referencia leve a universo gamer e RPG
- card central unico para autenticacao
- alternancia entre login e cadastro no mesmo componente
- interface com brilho, profundidade e identidade mais forte
- bloco mais limpo, com menos repeticao de chamadas
- linguagem visual mais proxima de produto gamificado do que de sistema corporativo

### Campos previstos no mockup mais recente de cadastro

- nome
- e-mail
- senha
- confirmar senha

### Problema que resolve

Evita uma primeira impressao corporativa demais e aproxima a interface da proposta gamificada da
plataforma.

### Relacao com o objetivo do projeto

Fortalece a percepcao de confianca e organizacao desde o primeiro contato com a plataforma.

## 2B. Segunda etapa da criacao da startup

### Funcao

Coletar uma descricao curta da ideia antes de perguntar classificacoes como segmento ou mercado.

### Direcao de fluxo

- uma pergunta principal por tela
- depois do nome, perguntar primeiro `Conte a ideia em uma frase`
- usar campo aberto grande, com dica curta e exemplo de frase
- mostrar o progresso da jornada no topo sem transformar em menu complexo
- deixar `Segmento` como proxima etapa, abrindo apenas depois que a ideia for salva
- na tela de segmento, escolher um territorio principal por vez em cards/chips grandes
- tratar segmento como ponto de partida editavel, nao como classificacao definitiva
- depois do segmento, perguntar a dor/problema em campo aberto unico
- orientar a pessoa a descrever custo, incomodo, atraso, medo ou desperdicio, antes de vender a solucao
- depois do problema, perguntar quem sente essa dor primeiro
- orientar publico inicial por pessoa, contexto e sinal da dor, evitando respostas amplas como `todo mundo`
- ao finalizar esta etapa, gerar o primeiro mapa/resumo inicial da startup
- manter a sensacao de portal/jornada, nao de formulario administrativo

### Problema que resolve

Ajuda o usuario a sentir avanco constante e evita uma tela inicial pesada com muitas perguntas.

## 3. Historico: dashboard provisorio removido em 2026-07-14

O antigo `DashboardScreen` e a tela `Suas startups` foram substituidos pelo workspace atual. A Home
guia o trabalho da startup, a Jornada concentra etapas e Mapa inicial, e `/painel/startups`
concentra o gerenciamento. Os itens abaixo registram apenas a versao anterior.

### Funcao

Exibir uma visao geral da evolucao da startup.

### Elementos esperados

- progresso geral
- etapa atual
- tarefas pendentes
- proximos passos
- resumo de recompensas

### Estado historico da interface removida

- visao inicial das startups ja criadas para o usuario autenticado
- contagem simples de startups com nome definido e pendente
- CTA para criar outra startup
- botao de saida da conta
- renomeacao inline no card, com chamada `Dar nome agora` para startups sem nome
- modal proprio de confirmacao de exclusao (substituiu o dialogo nativo do navegador)
- titulo do card clicavel e botao `Entrar na startup` levando a pagina de detalhe
- barra fina de progresso da jornada e proxima etapa em cada card (2026-07-08)
- metrica `Progresso medio` da conta no lugar de `A definir depois`
- metrica `Nivel` com XP da conta e fileira de conquistas (2026-07-08)

### Nota historica de direcao (2026-07-08, superada em 2026-07-14)

A composicao implementada nessa data foi preferida em relacao aos mockups do hub. A decisao deixou
de representar o produto vigente quando a tela foi removida em favor do workspace principal.

### Direcao visual do mockup mais recente

- saudacao discreta no topo esquerdo com o nome do usuario
- painel central amplo e pouco poluido
- bloco principal focado em `Suas startups`
- cards enxutos com nome, etapa e resumo rapido
- indicador visual de saude com coracoes e barra de vida
- proximo passo resumido para leitura imediata

### Direcao visual da home geral da conta

- barra superior com navegacao para areas amplas da plataforma
- saudacao principal com mais destaque
- area geral da conta antes de entrar em uma startup especifica
- resumo rapido com startups, conquistas, jornada e saude media
- cards de startups com pouco texto e leitura visual imediata
- acesso visivel para perfil, conta e saida

### Refinamento proposto na v2 do hub inicial

- transformar a home em uma especie de cabine de comando, e nao apenas uma grade de indicadores
- destacar uma startup principal no topo, deixando claro onde a energia do dia deve entrar
- adicionar um radar lateral de conta e jornada, com saude, recompensa proxima e decisao pendente
- criar uma doca de acoes rapidas entre hero e lista de startups
- quebrar a grade simetrica com uma composicao mais intencional: startup principal, fila secundaria e painel de radar
- manter a linguagem quente, premium e levemente gamer, sem parecer dashboard corporativo

## 3A. Historico: pagina de detalhe removida em 2026-07-14

O antigo `StartupDetailScreen` ocupava `/painel/startup/[id]`. Essa rota agora renderiza a Home;
a Jornada e o Mapa inicial foram movidos para `/painel/startup/[id]/jornada`. A lista abaixo e um
registro da interface de 2026-07-08, nao do estado atual.

### Funcao

Ser o espaco proprio de uma startup especifica: ver e refinar o mapa inicial e acompanhar a
jornada.

### Estado historico da interface removida

- rota `/painel/startup/[id]` restrita ao dono
- topo com retorno ao painel e marca
- chips de etapa atual e data de fundacao
- nome com renomeacao inline (mesmo padrao do painel)
- bloco `Proximo passo` derivado do estado real (dar nome ou proposta de valor)
- mapa inicial em quatro cards editaveis: ideia, segmento, problema e publico
- mapa da jornada com as 8 etapas do TCC, barra de progresso e marcacao `Voce esta aqui`
- jornada jogavel (2026-07-08): etapa atual abre editor com pergunta, dica e exemplo;
  concluir abre a proxima porta; etapas concluidas podem ser refinadas
- celebracao curta ao concluir etapa (2026-07-09): anel e faiscas no marcador, glow no card
- estados de carregamento, erro e startup nao encontrada

## 4. Jornada vigente

### Funcao

Apresentar as oito etapas em `/painel/startup/[id]/jornada`, com lista mestre-detalhe, etapa atual
aberta, concluidas revisitaveis e futuras bloqueadas com pre-requisito explicito.

### Papel no projeto

Concentrar a experiencia principal da plataforma.

## 5. Detalhe da etapa integrado a Jornada

### Funcao

Permitir preenchimento, leitura de orientacoes e conclusao dentro do painel de detalhe da Jornada,
sem criar uma rota ou tela independente.

### Papel no projeto

Traduzir cada etapa em acao concreta para o usuario.

## 6. Progresso e recompensas distribuidos no workspace

### Funcao

Exibir nivel e sequencia globais na topbar e, na Home, XP, progresso da missao, fase, atividade e
proximo desbloqueio. Conquistas completas continuam como modulo futuro desabilitado.

### Papel no projeto

Reforcar o engajamento e a sensacao de evolucao.
