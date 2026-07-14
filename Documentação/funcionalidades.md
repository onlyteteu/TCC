# Funcionalidades

## Estado atual

Em 2026-07-14, a plataforma possui um workspace principal funcional: autenticacao, criacao e
gerenciamento de startups, Home guiada por missao, Jornada mestre-detalhe e gamificacao ligada a
atividades reais.

## Escopo da gamificacao

### Global da conta

- XP total e nivel combinam as etapas concluidas em todas as startups com eventos operacionais;
- a sequencia de dias usa atividades significativas, nunca apenas o login;
- conquistas globais derivam de marcos reais, como fundacao, entrevistas, aprendizado e missao;
- a topbar preserva nivel e sequencia ao trocar de startup.

### Local da startup

- a Home mostra a missao principal, seu progresso, recompensa e desbloqueio;
- evidencias, aprendizado, etapa da jornada e atividade recente pertencem a startup ativa;
- fase e progresso da Jornada refletem somente o percurso daquela startup;
- concluir entrevistas, aprendizado e missao gera eventos deduplicados e evita XP repetido.

A gamificacao informa e reforca o trabalho empreendedor. Ela nao substitui os criterios reais de
conclusao, nao premia login isolado e nao cria progresso apenas visual.

## Workspace principal implementado em 2026-07-14

- shell compartilhado com marca, navegacao, seletor, nivel, sequencia e menu de conta;
- entrada automatica pela startup usada por ultimo;
- Home orientada pela primeira missao operacional;
- Jornada com oito etapas, bloqueios honestos e Mapa inicial editavel;
- gerenciador com abertura, renomeacao, exclusao confirmada e fallback;
- estados de carregamento, erro, sessao e conteudo ausente nas rotas principais.

## Implementado neste ciclo

### 1. Homepage inicial no frontend

Foi implementada uma tela inicial com:

- apresentacao da proposta da plataforma
- resumo do escopo inicial
- destaque para jornada guiada, progresso e engajamento

### Problema que resolve

Evita que o frontend comece vazio e sem identidade de produto.

### Relacao com o objetivo do projeto

Ajuda a consolidar a comunicacao do produto e o posicionamento da plataforma desde o primeiro
acesso.

### 2. Login e cadastro reais no frontend

Foi implementada uma tela real de autenticacao com:

- aba de `Entrar`
- aba de `Criar conta`
- campos de nome, e-mail, senha e confirmar senha no cadastro
- campos de e-mail e senha no login
- animacao sutil de respiracao na logo central
- redirecionamento para um painel autenticado inicial apos sucesso

### Problema que resolve

Substitui o mockup estatico por uma interface funcional, pronta para receber usuarios reais.

### Relacao com o objetivo do projeto

Entrega a primeira porta de entrada concreta da plataforma e prepara a base para os fluxos
internos.

### 3. Endpoint de saude no backend

Foi implementado o endpoint:

- `/api/health/`

### Problema que resolve

Cria um ponto minimo de verificacao tecnica do backend.

### Relacao com o objetivo do projeto

Nao entrega valor direto ao usuario final, mas sustenta a evolucao segura da plataforma.

### 4. API de autenticacao no backend

Foi implementada a autenticacao com os endpoints:

- `/api/auth/register/`
- `/api/auth/login/`
- `/api/auth/me/`
- `/api/auth/logout/`

### Problema que resolve

Cria um fluxo real de criacao de conta, entrada na plataforma e validacao de sessao.

### Relacao com o objetivo do projeto

Permite evoluir o produto em cima de usuarios autenticados, o que sustenta a continuidade da
jornada empreendedora de cada pessoa.

### 5. Modelo inicial de startup

Foi implementada a entidade `Startup` com campos iniciais de cadastro.

### Problema que resolve

Estabelece o primeiro objeto central do dominio.

### Relacao com o objetivo do projeto

Conecta diretamente o backend ao principal objetivo do sistema: permitir que o usuario cadastre e
estruture sua startup.

### 6. Integracao frontend-backend no fluxo de autenticacao

O frontend passou a conversar com o backend Django por meio de rotas internas do Next.js, que
recebem os dados do formulario, chamam a API Django e mantem a sessao em cookie HTTP-only.

### Problema que resolve

Evita depender de um frontend isolado ou de um backend sem interface real.

### Relacao com o objetivo do projeto

Estabelece a primeira integracao completa entre interface, regra de negocio e persistencia.

### 7. Fluxo real de criacao da startup

Foi implementado o primeiro fluxo interno apos o login:

- tela real de criacao da startup em `/painel` para contas sem startup
- opcao para criar a startup mesmo sem definir o nome ainda
- persistencia da startup vinculada ao usuario autenticado
- visao interna inicial das startups criadas para contas que ja passaram dessa etapa

### Problema que resolve

Tira o produto do estado de painel placeholder e transforma o pos-login em uma etapa concreta da
jornada.

### Relacao com o objetivo do projeto

Entrega o primeiro ponto em que o usuario autenticado realmente inicia a estruturacao da startup
dentro da plataforma.

### 8. Edicao e renomeacao da startup

Foi implementada a atualizacao da startup depois da criacao:

- endpoint `PATCH /api/startups/<id>/` com atualizacao parcial de nome, ideia, segmento, problema e publico
- renomeacao inline no painel `Suas startups`
- chamada `Dar nome agora` em destaque para startups criadas sem nome
- modal proprio de confirmacao de exclusao no estilo do produto

### Problema que resolve

Cumpre a promessa `Ainda nao sei o nome / posso definir isso depois`, que antes nao tinha caminho
de conclusao, e remove o dialogo nativo do navegador do fluxo de exclusao.

### Relacao com o objetivo do projeto

Fecha o ciclo basico de CRUD da startup e prepara o painel para a proxima etapa: entrar na startup
e acompanhar a jornada.

### 9. Pagina de detalhe da startup

Foi implementada a primeira visao interna de uma startup especifica em `/painel/startup/[id]`:

- endpoint `GET /api/startups/<id>/` restrito ao dono da startup
- card do painel virou porta de entrada (titulo clicavel e botao `Entrar na startup`)
- mapa inicial com edicao inline de ideia, segmento, problema e publico
- bloco `Proximo passo` derivado do estado real da startup
- mapa da jornada com as 8 etapas do TCC e status honesto de progresso

### Problema que resolve

Elimina o beco sem saida do pos-criacao: antes, criar uma startup nao levava a lugar nenhum.
Agora o card abre um espaco proprio da startup, onde a jornada guiada vai morar.

### Relacao com o objetivo do projeto

E o elo entre o funil de criacao e o fluxo central do produto (jornada guiada por etapas),
alem de dar visibilidade de progresso desde ja.

### 10. Jornada guiada por etapas (nucleo do produto)

Foi implementada a jornada guiada real, com as 8 etapas do TCC:

1. definicao do problema
2. publico-alvo
3. proposta de valor
4. diferenciais
5. validacao inicial
6. modelo de negocio
7. planejamento do MVP
8. metas iniciais

Comportamento:

- cada startup recebe a jornada automaticamente na criacao
- problema e publico ja nascem concluidos, porque foram respondidos na fundacao
- uma porta de cada vez: so a etapa atual aceita resposta; as futuras ficam travadas
- concluir uma etapa abre a proxima e avanca a etapa atual da startup
- etapas concluidas podem ser refinadas a qualquer momento
- progresso calculado e exibido na pagina de detalhe
- cada etapa tem pergunta, dica e exemplo para orientar a resposta

### Problema que resolve

Era a maior lacuna entre a proposta do TCC e o codigo: o fluxo central da plataforma
(fluxo 3 da documentacao) nao existia. Agora o usuario estrutura a startup passo a passo.

### Relacao com o objetivo do projeto

E o coracao do produto: transforma uma ideia ampla em passos organizados com progresso visivel.

### 11. Gamificacao leve

Foi implementada a primeira camada de gamificacao, calculada do estado real da jornada:

- 100 XP por etapa concluida; um nivel a cada 300 XP
- cinco conquistas: Fundacao, Batismo, Primeira porta, Meio caminho e Jornada completa
- exibicao no painel: metrica de nivel com XP e fileira de conquistas

### Problema que resolve

Da retorno visivel a cada avanco sem inflar o escopo: nenhuma tabela nova, nenhum sistema
paralelo — as recompensas derivam dos mesmos dados da jornada.

### Relacao com o objetivo do projeto

Fecha o fluxo 5 da documentacao (retorno de gamificacao) de forma coerente com o principio de
que a gamificacao apoia a jornada, nao vira o produto.

## Funcionalidades em construcao conceitual

- dashboard com visao de progresso aprofundada no painel
- recomendacao de proximos passos mais inteligente
- tarefas por etapa
- missoes e niveis mais profundos de gamificacao

## Funcionalidades previstas para o MVP

### 1. Autenticacao

Permitir que o usuario:

- crie uma conta
- entre na plataforma
- mantenha uma sessao valida

### 2. Cadastro da startup

Permitir o registro e aprofundamento das informacoes iniciais, como:

- nome
- descricao resumida
- segmento
- estagio atual
- objetivo inicial

### 3. Jornada guiada

Estruturar a experiencia em etapas de evolucao, como:

1. problema
2. publico-alvo
3. proposta de valor
4. diferenciais
5. validacao inicial
6. modelo de negocio
7. MVP
8. metas iniciais

### 4. Dashboard de progresso

Exibir:

- progresso geral
- etapa atual
- etapas concluidas
- tarefas pendentes
- proximo passo sugerido

### 5. Gamificacao

Aplicar elementos de engajamento sem descaracterizar o objetivo do produto:

- niveis
- badges
- missoes
- barras de progresso

## O que foi deixado de fora neste ciclo

- CRUD completo de startups
- renomeacao e edicao detalhada da startup
- API de jornada
- dashboard funcional completo
- gamificacao implementada
- recomendacoes inteligentes de proximos passos

## Fora do escopo funcional atual

- CRM
- financeiro avancado
- contabilidade
- operacao completa da empresa
- automacoes empresariais complexas
