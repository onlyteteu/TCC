# Telas

## Estado atual

Na data de 2026-04-09, a tela principal de autenticacao, o fluxo real de criacao da startup e uma
visao inicial das startups ja criadas foram implementados. As demais telas do fluxo principal
continuam planejadas para os proximos ciclos.

Tambem foram criados mockups visuais de referencia para a futura tela de login/cadastro em:

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

Tambem foi criado um mockup visual de referencia para a tela vazia de criacao da startup em:

- `Documentação/mockups/criar-startup-v1.svg`
- `Documentação/mockups/criar-startup-v1.png`

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
- redirecionamento para painel autenticado inicial

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

- exibida em `/painel` quando a conta autenticada ainda nao tem startup
- campo principal para nome da startup
- opcao para continuar sem definir o nome ainda
- criacao real persistida no backend
- transicao automatica para a visao interna de startups apos sucesso

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

## 3. Dashboard principal

### Funcao

Exibir uma visao geral da evolucao da startup.

### Elementos esperados

- progresso geral
- etapa atual
- tarefas pendentes
- proximos passos
- resumo de recompensas

### Estado atual implementado

- visao inicial das startups ja criadas para o usuario autenticado
- contagem simples de startups com nome definido e pendente
- CTA para criar outra startup
- botao de saida da conta

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

## 4. Tela de jornada

### Funcao

Apresentar as etapas da estruturacao inicial de forma organizada e navegavel.

### Papel no projeto

Concentrar a experiencia principal da plataforma.

## 5. Tela de detalhe da etapa

### Funcao

Permitir preenchimento, leitura de orientacoes e conclusao de tarefas de uma etapa especifica.

### Papel no projeto

Traduzir cada etapa em acao concreta para o usuario.

## 6. Tela de progresso e recompensas

### Funcao

Exibir niveis, badges, missoes e indicadores de avancar.

### Papel no projeto

Reforcar o engajamento e a sensacao de evolucao.
