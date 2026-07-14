# Fluxos

## Estado atual

O fluxo de entrada deixou de ser apenas conceitual e agora possui autenticacao real com cadastro,
login e acesso a um painel autenticado inicial. Os demais fluxos continuam definidos em nivel de
produto e orientam as proximas implementacoes.

## Fluxo 1. Entrada e autenticacao na plataforma

1. O usuario acessa a tela inicial.
2. Escolhe entre entrar ou criar conta.
3. Preenche os dados de autenticacao.
4. O sistema valida as credenciais.
5. O usuario entra em um painel autenticado inicial.

### Problema que resolve

Evita uma tela inicial apenas decorativa e cria uma porta de entrada real para o produto.

### Relacao com o objetivo do projeto

Cria a base para acompanhar a jornada de cada usuario de forma individual.

## Fluxo 2. Cadastro inicial da startup

1. O usuario entra em `/painel` sem ter startup criada.
2. Informa ou adia o nome da startup.
3. Conta a ideia da startup em uma frase.
4. Escolhe um segmento/territorio inicial.
5. Descreve a dor ou problema que quer resolver.
6. Recorta quem sente essa dor primeiro.
7. O sistema cria a startup e leva para a tela provisoria de `Suas startups`.

### Problema que resolve

Evita que o usuario entre em um sistema vazio e sem contexto.

### Relacao com o objetivo do projeto

Cria o ponto de partida da jornada guiada, organiza a startup desde o primeiro contato e evita
que o usuario comece em um dashboard vazio sem ter nomeado ideia, segmento, problema e publico.

## Fluxo 2A. Entrada na startup (implementado em 2026-07-08)

1. O usuario ve suas startups no painel.
2. Clica no titulo do card ou em `Entrar na startup`.
3. Abre a pagina de detalhe da startup.
4. Ve o proximo passo sugerido, o mapa inicial e a jornada.
5. Refina nome, ideia, segmento, problema ou publico quando quiser.

### Problema que resolve

Antes, o pos-criacao era um beco sem saida: o card nao abria e a unica acao era excluir.

### Relacao com o objetivo do projeto

Cria o espaco onde a jornada guiada (fluxo 3) vai acontecer.

## Fluxo 3. Jornada guiada por etapas (implementado em 2026-07-08)

1. O usuario visualiza as 8 etapas na pagina de detalhe da startup.
2. A etapa atual esta aberta; as futuras, travadas na sequencia.
3. Abre a etapa, le a pergunta, a dica e o exemplo, e escreve a resposta.
4. Conclui a etapa (ou salva rascunho para continuar depois).
5. A proxima porta abre, o progresso avanca e o proximo passo e atualizado.

### Problema que resolve

Reduz a incerteza sobre o que fazer primeiro e o que fazer depois.

### Relacao com o objetivo do projeto

Esse e o fluxo central da plataforma, porque transforma uma ideia ampla em passos organizados.

## Fluxo 4. Acompanhamento de progresso

1. O usuario acessa o dashboard.
2. Visualiza percentual de conclusao.
3. Entende em que etapa esta.
4. Identifica pendencias e proximas acoes.

### Problema que resolve

Torna o avancar visivel e reduz a sensacao de desorganizacao.

### Relacao com o objetivo do projeto

Ajuda o usuario a acompanhar a propria evolucao na estruturacao da startup.

## Fluxo 5. Retorno de gamificacao

1. O usuario conclui etapas ou tarefas.
2. O sistema atualiza progresso e recompensas.
3. O usuario visualiza nivel, badge ou missao concluida.

### Problema que resolve

Ajuda a manter engajamento sem depender apenas de preenchimento de formularios.

### Relacao com o objetivo do projeto

Fortalece constancia e percepcao de avancar dentro da jornada empreendedora.
