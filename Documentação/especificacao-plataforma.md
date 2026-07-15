# Especificação da plataforma Startup Quest

## Controle do documento

- Status: direção de produto aprovada; implementação em andamento
- Data da consolidação: 2026-07-13
- Escopo: criação e evolução da plataforma, não redação do TCC
- Prioridade de interface: computador; celular recebe apenas uma base funcional neste ciclo

Este documento registra as decisões funcionais e visuais da plataforma para preservar a
rastreabilidade do desenvolvimento. O `progresso.md` registra o que foi efetivamente implementado
e validado em cada ciclo; este arquivo descreve o produto que está sendo construído.

## Visão do produto

A Startup Quest deve funcionar como um gerenciador guiado de startups. Seu papel principal é
transformar a dúvida `o que eu faço agora?` em uma próxima ação concreta, explicada e verificável.

A plataforma não deve terminar quando o empreendedor preenche os dados iniciais da startup. Ela
deve continuar útil durante validação, construção do MVP, tração inicial e gestão contínua,
organizando missões, tarefas, entrevistas, experimentos, aprendizados, decisões, metas,
documentos, recursos e métricas.

## Princípio de condução

Cada momento da experiência deve responder cinco perguntas:

1. O que devo fazer agora?
2. Por que isso é importante para a startup?
3. Como executar a atividade?
4. Qual evidência demonstra que ela foi realizada?
5. O que será desbloqueado depois?

O fluxo principal aprovado é:

`Hoje -> Jornada -> Missão -> Evidência e aprendizado -> XP, sequência e conquista -> Próxima missão`

## Arquitetura de informação

### Navegação principal

- Hoje
- Jornada
- Missões
- Experimentos
- Aprendizados
- Métricas
- Documentos e recursos
- Conquistas
- Configurações

O topo da aplicação deve manter visíveis a startup ativa, a sequência de atividade, o XP, o
nível e as notificações de desbloqueio. Esses elementos informam progresso, mas não podem
competir com a próxima ação.

### Página Hoje

A página Hoje é a entrada operacional da startup. A missão atual ocupa a maior parte da
hierarquia, enquanto sequência, nível e saúde da startup aparecem em uma coluna lateral compacta.
Atalhos e indicadores devem sempre levar a trabalho concreto.

### Página Jornada

A Jornada apresenta o mapa completo de evolução da startup, com fases, progresso, dependências,
missões concluídas, missões disponíveis e próximos desbloqueios. Ela explica onde a startup está e
por que a próxima missão foi recomendada.

### Página Missão

A página de missão é o espaço de execução. Ela deve conter objetivo, explicação, motivo,
passos, exemplo, critério de conclusão, evidências exigidas, recompensa e desbloqueios.

## Como os módulos operacionais funcionam

Os módulos não são áreas isoladas. Eles formam um ciclo de trabalho:

`Hipótese -> Experimento -> Evidência -> Aprendizado -> Decisão -> Métrica -> Próxima missão`

Os documentos consolidam os resultados desse ciclo em entregáveis que podem ser consultados,
atualizados e apresentados.

### Experimentos

Experimentos servem para testar uma hipótese antes de investir mais tempo ou dinheiro. Cada
experimento deve possuir:

- hipótese que está sendo testada
- método escolhido
- público ou amostra
- prazo
- critério de sucesso definido antes da execução
- evidências coletadas
- resultado
- decisão: continuar, ajustar ou descartar a hipótese

Exemplos: entrevista de problema, teste de protótipo, página de interesse, teste de preço e
oferta manual. Missões podem criar um experimento automaticamente e usar sua conclusão como
evidência.

### Aprendizados

Aprendizados são conclusões sustentadas por entrevistas, experimentos, tarefas ou dados. Eles
não devem funcionar como um bloco de notas sem contexto. Cada aprendizado registra:

- o que foi descoberto
- fonte da descoberta
- evidência relacionada
- grau de confiança
- impacto sobre a startup
- ação ou decisão recomendada

Um aprendizado pode gerar uma nova missão, alterar uma hipótese ou justificar uma decisão. A
plataforma também pode sugerir aprendizados a partir de padrões de entrevistas, mas o usuário deve
confirmá-los.

### Métricas

Métricas mostram se a startup está progredindo e se um experimento atingiu seu critério de
sucesso. A plataforma deve recomendar métricas adequadas à fase atual, evitando um painel genérico:

- descoberta: entrevistas realizadas, problemas recorrentes e força das evidências
- validação: interesse, conversão, respostas a ofertas e disposição a pagar
- MVP: ativação, uso, conclusão da tarefa principal e retorno dos primeiros usuários
- tração: aquisição, retenção, receita e custos relevantes

No primeiro ciclo, os valores podem ser informados manualmente. Cada métrica deve possuir nome,
definição, valor atual, meta, periodicidade, fonte e histórico. Uma variação importante pode gerar
uma missão de investigação.

### Documentos

Documentos não serão apenas um armazenamento de arquivos. A área reunirá entregáveis vivos
gerados ou preenchidos com o trabalho realizado na plataforma, por exemplo:

- resumo da startup
- roteiro e registros de entrevistas
- proposta de valor
- mapa de hipóteses
- relatório de experimento
- modelo de negócio
- escopo do MVP
- registro de decisões
- relatório de progresso

Os documentos devem aproveitar informações já registradas, permitir refinamento, manter versões e
futuramente oferecer exportação. Links e arquivos externos podem complementar a área, mas não
são sua finalidade principal.

### Exemplo de integração entre os módulos

1. A missão pede cinco entrevistas.
2. A plataforma cria ou associa um experimento de entrevista de problema.
3. Cada entrevista fica registrada como evidência.
4. O usuário consolida os padrões em um aprendizado.
5. A métrica de entrevistas e recorrência do problema é atualizada.
6. O roteiro, os registros e a síntese aparecem em Documentos.
7. A plataforma desbloqueia a missão de refinar a proposta de valor.

## Fases da evolução da startup

### 1. Descoberta

- problema inicial
- público inicial
- contexto, frequência e intensidade da dor
- primeiras entrevistas

### 2. Problema e solução

- proposta de valor
- hipótese de solução
- alternativas existentes
- diferenciais

### 3. Validação

- plano de entrevistas
- experimentos
- registro de evidências
- interesse e disposição a pagar
- decisão de continuar, ajustar ou pivotar

### 4. Modelo de negócio

- clientes
- canais
- fontes de receita
- custos
- parceiros e recursos

### 5. MVP

- escopo
- funcionalidades essenciais
- backlog
- critérios de sucesso
- preparação do lançamento

### 6. Tração inicial

- primeiros usuários
- aquisição
- feedback
- métricas iniciais
- ciclos de melhoria

### 7. Gestão contínua

- metas semanais
- tarefas
- decisões
- experimentos
- aprendizados
- acompanhamento da saúde da startup

## Modelo de missão

Toda missão deve possuir:

- objetivo
- explicação curta
- motivo
- passo a passo
- exemplo contextual
- critério de conclusão
- evidência obrigatória
- recompensa
- desbloqueios produzidos

Tipos previstos:

- missão principal
- missão semanal
- tarefa rápida
- experimento
- aprendizado
- atividade recorrente de gestão

### Exemplo aprovado

Missão: realizar cinco entrevistas com pessoas do público inicial.

- Execução: entrevistar cinco pessoas e registrar o que foi relatado
- Evidência: cinco registros de entrevista e uma síntese dos padrões observados
- Recompensa inicial de referência: 150 XP e progresso em conquista de entrevistas
- Desbloqueio: missão de refinamento da proposta de valor

O primeiro balanceamento implementado concede 10 XP por entrevista válida, 25 XP pela primeira
síntese e 150 XP pela conclusão. Esses valores são parâmetros iniciais e podem ser balanceados
após testes de uso sem alterar o modelo funcional.

## Gamificação

A gamificação deve estimular trabalho real e consistência, sem transformar a plataforma em um
RPG infantil. O sistema inclui:

- XP por tarefas e missões concluídas
- nível da conta
- nível ou progresso da startup
- conquistas progressivas
- sequência de dias com atividade significativa
- desbloqueios
- celebrações breves
- histórico de progresso

### Regra da sequência

A sequência, representada pelo fogo, não deve aumentar com simples login. Um dia conta quando o
usuário realiza pelo menos uma atividade significativa, como:

- concluir uma missão ou tarefa
- registrar uma entrevista
- executar ou atualizar um experimento
- registrar um aprendizado
- concluir uma meta
- registrar uma decisão relevante

Estados previstos: sequência mantida, sequência em risco e sequência interrompida.

### Categorias de conquistas

- fundação
- conhecimento do cliente
- validação
- construção
- tração
- consistência
- gestão

As conquistas podem possuir faixas progressivas. Exemplo: 1, 5, 20 e 50 entrevistas registradas.

## Estados funcionais que a interface deve cobrir

- conta sem startup
- startup recém-criada
- missão atual disponível
- evidência insuficiente
- missão concluída
- nova fase desbloqueada
- sequência mantida
- sequência em risco
- usuário inativo
- jornada inicial concluída
- gestão contínua ativa
- carregamento
- erro recuperável

## Direção visual aprovada

Prancha de referência: [`design/paleta-startup-quest-v1.png`](design/paleta-startup-quest-v1.png).

Tela-modelo aprovada para a página Hoje:
[`design/mockup-hoje-v1.png`](design/mockup-hoje-v1.png).

- atmosfera escura, premium, futurista, motivadora e profissional
- fundo grafite quase preto
- superfícies em azul-ardósia profundo
- âmbar e laranja como cor principal de ação, fogo e progresso
- clareza e densidade profissional inspiradas em ferramentas como Linear
- energia de gamificação concentrada em progresso, sequência, conquistas e celebrações
- missão atual dominante na página Hoje
- sequência, nível e saúde da startup em uma coluna lateral compacta
- animações curtas ligadas a mudanças de estado
- interface desktop-first

### Tokens de cor aprovados

- fundo grafite: `#090B10`
- superfície azul-ardósia: `#121824`
- superfície elevada: `#192233`
- texto principal: `#F4F7FB`
- texto secundário: `#AAB4C5`
- ação e progresso: `#FFB23E`
- fogo e celebração: `#FF6B2C`
- sucesso e evidência concluída: `#2DD4A8`
- informação: `#6EA8FF`
- erro: `#FF6474`

A tipografia de referência é Inter, usando uma única família e uma escala compacta adequada
a produto. O motivo geométrico de chama e trajetória representa progresso, mas deve aparecer
somente em pontos ligados à jornada, à sequência ou a conquistas.

A arquitetura visual combina três superfícies aprovadas: Hoje como espaço de trabalho do
fundador, Jornada como mapa de fases e Missão como detalhe focado de execução.

## Critérios de implementação e validação

Cada ciclo implementado deve registrar no `progresso.md`:

- problema ou capacidade trabalhada
- decisões relevantes
- arquivos e estruturas principais alterados
- migrações de banco, quando houver
- testes automatizados executados
- validação visual e funcional realizada
- limitações ou riscos que permaneceram

Requisitos permanentes:

- sem controles falsos ou dados decorativos apresentados como reais
- estados de erro, carregamento, vazio e sucesso
- navegação por teclado e foco visível
- contraste legível
- alternativa para `prefers-reduced-motion`
- consistência entre frontend, API e regras do banco
- testes proporcionais ao risco da alteração

## Sequência de implementação planejada

1. Formalizar modelos de missão, tarefa, evidência e atividade significativa.
2. Formalizar o mecanismo de XP, nível, sequência e conquistas.
3. Implementar APIs e regras de progressão.
4. Implementar a página Hoje.
5. Reestruturar a Jornada para fases e desbloqueios reais.
6. Implementar a página de Missão com envio de evidências.
7. Expandir experimentos, aprendizados, metas, tarefas e gestão contínua.
8. Validar o fluxo completo e registrar resultados.
