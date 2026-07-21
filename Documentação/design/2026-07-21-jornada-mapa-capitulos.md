# Jornada — Mapa de Capítulos

Data: 21 de julho de 2026
Status: design aprovado; implementação pendente

## Resumo da decisão

A Jornada será redesenhada como um `Mapa de Capítulos`. Ela deixará de apresentar uma lista lateral
com um editor de resposta como conteúdo principal e passará a explicar a evolução estratégica da
startup: onde ela está, o que já foi construído, qual marco está ativo e o que será liberado depois.

A execução continuará pertencendo a Missões. O CTA principal da etapa atual será
`Continuar missão`; `Revisar registro` será uma ação secundária para corrigir a síntese estratégica.
Concluir uma etapa continuará dependendo de trabalho real validado pelo backend, sem progresso por
clique ou por abertura de tela.

Esta especificação registra uma decisão de produto e de design. Ela não declara o redesenho como
implementado.

## Contexto

A Jornada atual possui oito etapas, estados reais, bloqueios, edição de respostas e uma visão de
Mapa inicial. A tela é funcional, mas seu layout mestre-detalhe reproduz a estrutura mental de uma
lista de tarefas com formulário. Isso cria três problemas:

1. pouca identidade visual de percurso;
2. competição conceitual com Home e Missões;
3. utilidade insuficientemente clara para uma visita recorrente.

O Motor de Missões 2.0 tornou essa sobreposição mais visível. Home já responde qual é a próxima
ação, e a Central de missão já apresenta recomendação, alternativas, dependências e histórico. A
Jornada precisa assumir o papel que falta: explicar a transformação acumulada da startup.

## Referências de pesquisa

O desenho foi orientado por quatro ideias:

- listas de tarefas servem à execução, enquanto rastreadores de progresso oferecem uma visão de
  percurso e resultados;
- caminhos guiados reduzem a dúvida sobre a ordem e o próximo marco;
- distância visível até uma meta pode reforçar a motivação conforme o usuário se aproxima dela;
- gamificação isolada tem efeito limitado; autonomia, competência e significado precisam vir do
  trabalho real.

Referências consultadas:

- [GOV.UK — Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/);
- [MOJ Design System — Progress tracker](https://design-patterns.service.justice.gov.uk/components/progress-tracker/);
- [Duolingo — The Science Behind the Home Screen Redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/);
- [Kivetz, Urminsky e Zheng — Goal-Gradient Hypothesis](https://journals.sagepub.com/doi/10.1509/jmkr.43.1.39);
- [Li, Hew e Du — meta-análise sobre gamificação](https://link.springer.com/article/10.1007/s11423-023-10337-7).

As referências inspiram princípios, não uma cópia visual de outro produto.

## Responsabilidades das áreas

### Home

Responde `o que eu faço agora?` com uma única recomendação prioritária e continuidade imediata.

### Missões

Responde `como eu executo e quais opções reais tenho?` com foco, passos, evidências, critérios,
alternativas, dependências e histórico.

### Jornada

Responde `onde minha startup está e o que estamos construindo?` com capítulos, marcos,
transformações acumuladas, próximo desbloqueio e conexão com a missão correspondente.

Essa separação é requisito do redesenho. A Jornada não terá outro quadro de tarefas nem outro fluxo
de conclusão paralelo ao Motor de Missões.

## Objetivos

- dar identidade própria e memorável à Jornada;
- tornar posição, progresso e próximo marco compreensíveis em poucos segundos;
- conectar cada marco ao trabalho real executado em Missões;
- valorizar respostas e evidências já construídas;
- mostrar bloqueios e ausência de conteúdo futuro de forma honesta;
- manter compatibilidade com startups e etapas existentes;
- preservar acessibilidade, teclado e responsividade.

## Fora de escopo

- criar novas etapas da Jornada;
- implementar os Incrementos 2 e 3 do Motor de Missões;
- gerar missões por inteligência artificial;
- conceder XP adicional por visitar ou navegar na Jornada;
- criar um jogo separado da atividade empreendedora;
- alterar o modelo de conta, startup ou propriedade dos dados;
- transformar o Mapa da startup em um canvas empresarial completo.

## Organização em quatro capítulos

As oito etapas existentes serão agrupadas sem criar uma segunda fonte de progresso.

| Capítulo | Etapas existentes | Pergunta orientadora |
| --- | --- | --- |
| Fundamento | Problema e Público | Para quem e para qual dor esta startup existe? |
| Proposta | Proposta de valor e Diferenciais | Por que essa startup merece existir? |
| Validação | Validação e Modelo de negócio | O que prova que a proposta é desejável e viável? |
| Construção | MVP e Metas | Qual é a menor entrega e como medir o avanço? |

O capítulo é uma camada de apresentação derivada das etapas. Não haverá tabela de progresso de
capítulos no banco.

O estado também é derivado sem ambiguidade: um capítulo é `done` quando suas duas etapas estão
concluídas, `current` quando contém a etapa atual e `locked` nos demais casos. Apenas um capítulo
pode estar `current`.

## Composição da tela

### 1. Cabeçalho da Jornada

Mostra:

- rótulo `Jornada da startup`;
- título `Visão estratégica`;
- frase curta explicando a utilidade da tela;
- ação secundária `Abrir Mapa da startup`.

O Mapa da startup substitui o nome `Mapa inicial` na interface. Ele continua sendo uma síntese viva
dos campos já existentes, não um novo domínio.

### 2. Destaque do capítulo atual

Apresenta:

- posição, como `Capítulo 2 de 4`;
- nome do capítulo;
- pergunta orientadora;
- explicação curta da transformação esperada;
- percentual geral e nome do próximo capítulo.

O percentual continua sendo calculado por etapas concluídas sobre o total de oito etapas.

### 3. Mapa da evolução

Exibe os quatro capítulos conectados por uma rota horizontal no desktop. Cada capítulo mostra nome,
duas etapas e estado derivado.

- concluído: teal, ícone de confirmação e contagem completa;
- atual: âmbar, marcador destacado e texto `Marco atual`;
- futuro: neutro, bloqueado e sem aparência de CTA;
- erro: mensagem textual explícita, sem depender apenas de cor.

Selecionar um capítulo ou uma etapa consultável atualiza o painel de contexto na mesma página. Etapas
futuras não são clicáveis quando os pré-requisitos ainda não foram atendidos.

### 4. Painel do marco

Para o marco atual, mostra:

- título e objetivo;
- o que já foi construído;
- o que será liberado ao concluir;
- missão relacionada, duração estimada e recompensa real;
- CTA `Continuar missão`.

A recompensa exibida vem da missão. A Jornada não soma outra recompensa nem duplica XP.

Para um marco concluído, o painel troca ação por consulta: resultado, resposta consolidada,
evidências e data da última atualização. `Revisar registro` permanece secundário.

### 5. Registro estratégico

Resume campos relevantes já construídos, como problema, público e proposta. O usuário pode revisar
um registro sem marcar a etapa como concluída. A revisão abre o Mapa da startup no campo
correspondente.

## Mapa da startup

O botão `Abrir Mapa da startup` ativa a visão secundária na mesma rota por meio de
`?view=map`. A visão padrão permanece `?view=journey`, com ausência do parâmetro tratada como
Jornada.

`Revisar registro` abre `?view=map&field=<campo>`, posicionando foco e contexto no campo relevante.
Voltar à Jornada preserva a startup ativa e o capítulo consultado sempre que possível.

Essa mudança remove as abas como elemento principal, mas preserva as funcionalidades existentes do
Mapa.

## Estados e regras de progresso

### Etapa concluída

- permanece consultável;
- pode ter seu registro revisado;
- exibe resultado e evidências, quando existirem;
- não concede recompensa novamente.

### Etapa atual

- recebe o maior contraste visual;
- aponta para a missão relacionada;
- não oferece `Concluir etapa` na Jornada;
- só avança pelo fluxo transacional do backend.

### Etapa futura

- apresenta requisito de desbloqueio explícito;
- não possui CTA falso;
- permanece bloqueada enquanto o Motor não a liberar.

### Missão relacionada indisponível

Se o catálogo ainda não possuir uma missão operacional para a etapa atual, a Jornada informa
`A missão deste marco ainda não foi liberada.` e não apresenta CTA nem recompensa. O usuário pode
consultar o que já foi construído, mas não avançar artificialmente.

### Capítulo concluído

Quando todas as suas etapas estiverem concluídas, o capítulo recebe estado concluído. Uma celebração
curta pode aparecer depois da resposta confirmada pelo backend. Ela respeita
`prefers-reduced-motion` e nunca ocorre apenas por navegação.

## Arquitetura e fluxo de dados

### Fonte de verdade

- `JourneyStep` continua sendo a fonte das oito etapas e de seus estados;
- o catálogo e as instâncias de missão continuam sendo a fonte de dependências, conclusão e XP;
- o backend calcula capítulos, progresso, missão relacionada e próximo desbloqueio;
- o frontend apenas apresenta o payload e controla seleção visual.

### Contrato aditivo da Jornada

O payload de `GET /api/startups/<id>/journey/` será ampliado sem remover imediatamente os campos
atuais. Além de `startup`, `journey` e `progress`, deverá expor:

- `chapters`: quatro capítulos derivados, com estado e contagem;
- `currentMilestone`: etapa atual, explicação, desbloqueio e missão relacionada com `key`, `title`,
  `href`, `estimatedMinutes` e `rewardXp`;
- `strategicSummary`: registros existentes relevantes ao marco selecionado;
- `message`: estado honesto quando não houver missão operacional disponível.

`estimatedMinutes` pertence aos metadados do catálogo versionado. Se duração ou recompensa não
existirem para uma missão, a interface omite o dado em vez de estimá-lo no cliente.

Home, Central e Jornada devem usar o mesmo avaliador do backend para recomendação, bloqueios e
conclusão.

### Atualização

1. o usuário abre a Jornada;
2. o frontend carrega o payload derivado pelo backend;
3. o usuário seleciona um marco consultável;
4. o CTA abre o detalhe da missão existente;
5. a submissão válida conclui ou atualiza a missão de forma transacional;
6. o backend sincroniza a etapa equivalente quando a regra permitir;
7. ao retornar, a Jornada recarrega e apresenta o novo estado;
8. shell, XP e startup ativa são reconciliados pelo mecanismo existente do workspace.

O frontend da Jornada não enviará mais `complete: true`. O endpoint de etapa aceitará revisão de
resposta, mas tentativas de concluir diretamente deverão ser rejeitadas. Etapas concluídas antes da
mudança serão preservadas.

## Carregamento, vazio e erro

### Carregamento

O shell permanece visível. Cabeçalho, capítulo, rota e painel usam skeletons estáveis para evitar
mudança brusca de layout.

### Erro de carregamento

A área de conteúdo mostra motivo compreensível e `Tentar novamente`. Sidebar, topbar e startup ativa
permanecem disponíveis.

### Startup sem Jornada preparada

O backend continua garantindo a criação das etapas. Se o estado ainda assim vier vazio, a interface
mostra `A Jornada desta startup está sendo preparada` e oferece nova tentativa, sem inventar
progresso.

### Erro ao revisar registro

O texto digitado permanece no formulário, o erro aparece junto ao campo e a Jornada não altera
progresso, capítulo ou XP.

## Responsividade

### Desktop

- rota horizontal de quatro capítulos;
- painel do marco e registro estratégico lado a lado;
- conteúdo dentro do shell compartilhado;
- validação visual em `1280 x 720`, `1366 x 768`, `1536 x 720` e `1920 x 900`.

### Tablet e celular

- rota convertida em trilha vertical compacta;
- painel do marco abaixo do capítulo atual;
- registro estratégico abaixo do CTA;
- ausência de rolagem horizontal;
- alvos interativos de pelo menos 44 pixels;
- retorno ao marco atual sem exigir rolagem longa.

## Acessibilidade

- estrutura do mapa exposta como lista ordenada;
- capítulo ou etapa atual com `aria-current="step"`;
- estados escritos em texto, não comunicados apenas por cor;
- bloqueios reais expostos como indisponíveis e com motivo;
- capítulos concluídos consultáveis pelo teclado;
- foco movido de forma previsível ao trocar de visão ou abrir um registro;
- progresso com nome, valor atual, mínimo e máximo;
- celebração anunciada por região de status sem interromper o usuário;
- animações desativadas ou reduzidas conforme `prefers-reduced-motion`.

## Linguagem visual

- fundos e superfícies continuam azul-marinho;
- âmbar identifica ação e marco atual;
- teal identifica conclusão;
- cinza-azulado identifica futuro ou bloqueio;
- a rota usa conexão e profundidade sutis, sem virar uma ilustração infantil;
- XP e celebração aparecem como consequência do trabalho, não como decoração permanente;
- o visual deve permanecer consistente com Home, Central e o shell aprovado.

## Critérios de aceitação

- a tela comunica capítulo atual, progresso e próximo marco sem abrir outro painel;
- os quatro capítulos agrupam exatamente as oito etapas existentes;
- Home, Central e Jornada apresentam estados compatíveis para a mesma startup;
- não existe ação de conclusão direta na Jornada;
- o CTA da etapa atual abre a missão correta quando ela existir;
- a ausência de missão futura não produz CTA falso;
- `Revisar registro` não conclui etapa nem concede XP;
- conclusão de missão atualiza a Jornada após reconciliação;
- startups com progresso anterior mantêm seus estados;
- o Mapa da startup continua editável;
- desktop, tablet, celular, teclado, leitor de tela, loading, vazio e erro possuem cobertura.

## Estratégia de testes

### Backend

- derivação dos quatro capítulos a partir das oito etapas;
- capítulo concluído, atual e bloqueado;
- missão relacionada, requisito e próximo desbloqueio;
- rejeição de conclusão direta pela rota da Jornada;
- preservação de etapas legadas;
- conclusão transacional da missão sincronizando a etapa equivalente;
- ausência de recompensa duplicada.

### Frontend

- renderização de capítulos, estados e percentual;
- seleção de capítulos e etapas consultáveis;
- CTA correto e estado sem missão;
- navegação para `?view=map` e foco em `field`;
- loading, vazio, erro e retry;
- acessibilidade sem dependência exclusiva de cor;
- layout horizontal e vertical nos breakpoints definidos.

### Validação visual

- conferir a composição aprovada nos quatro viewports desktop do projeto;
- conferir celular sem rolagem horizontal;
- comparar Home, Jornada e Central para garantir responsabilidades visuais distintas;
- confirmar que o marco atual domina a hierarquia sem apagar o percurso completo.

## Resultado esperado

A Jornada deixa de ser um formulário em etapas e passa a ser a memória estratégica do percurso. O
usuário entende onde está, reconhece o que já construiu e segue para a missão correta sem confundir
consulta, execução e progresso.
