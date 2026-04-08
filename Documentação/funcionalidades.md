# Funcionalidades

## Estado atual

Na data de 2026-04-08, o projeto ja possui uma base funcional inicial implementada, mas ainda nao
entregou o fluxo completo do produto.

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

### 2. Endpoint de saude no backend

Foi implementado o endpoint:

- `/api/health/`

### Problema que resolve

Cria um ponto minimo de verificacao tecnica do backend.

### Relacao com o objetivo do projeto

Nao entrega valor direto ao usuario final, mas sustenta a evolucao segura da plataforma.

### 3. Modelo inicial de startup

Foi implementada a entidade `Startup` com campos iniciais de cadastro.

### Problema que resolve

Estabelece o primeiro objeto central do dominio.

### Relacao com o objetivo do projeto

Conecta diretamente o backend ao principal objetivo do sistema: permitir que o usuario cadastre e
estruture sua startup.

## Funcionalidades em construcao conceitual

- cadastro da startup
- jornada guiada por etapas
- dashboard com visao de progresso
- recomendacao de proximos passos
- tarefas por etapa
- gamificacao leve com niveis, badges e missoes

## Funcionalidades previstas para o MVP

### 1. Cadastro da startup

Permitir o registro de informacoes iniciais, como:

- nome
- descricao resumida
- segmento
- estagio atual
- objetivo inicial

### 2. Jornada guiada

Estruturar a experiencia em etapas de evolucao, como:

1. problema
2. publico-alvo
3. proposta de valor
4. diferenciais
5. validacao inicial
6. modelo de negocio
7. MVP
8. metas iniciais

### 3. Dashboard de progresso

Exibir:

- progresso geral
- etapa atual
- etapas concluidas
- tarefas pendentes
- proximo passo sugerido

### 4. Gamificacao

Aplicar elementos de engajamento sem descaracterizar o objetivo do produto:

- niveis
- badges
- missoes
- barras de progresso

## O que foi deixado de fora neste ciclo

- autenticacao
- CRUD completo de startups
- API de jornada
- dashboard funcional
- gamificacao implementada
- integracao frontend-backend

## Fora do escopo funcional atual

- CRM
- financeiro avancado
- contabilidade
- operacao completa da empresa
- automacoes empresariais complexas
