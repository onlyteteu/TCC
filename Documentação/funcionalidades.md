# Funcionalidades

## Estado atual

Na data de 2026-04-09, o projeto ja possui uma base funcional mais completa e ja entrega os
primeiros fluxos reais de autenticacao e criacao da startup.

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

## Funcionalidades em construcao conceitual

- jornada guiada por etapas
- dashboard com visao de progresso aprofundada
- recomendacao de proximos passos
- tarefas por etapa
- gamificacao leve com niveis, badges e missoes

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
