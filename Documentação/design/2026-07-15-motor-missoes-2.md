# Motor de Missões 2.0 e Central de missão

Data: 15 de julho de 2026

Status: arquitetura e direção visual aprovadas; especificação escrita aguardando revisão final antes
do plano de implementação

## Resumo da decisão

A próxima evolução da Startup Quest será o `Motor de Missões 2.0`. A plataforma deixará de possuir
somente uma missão isolada e passará a conduzir a startup por uma trilha inicial versionada, com
recomendação determinística, pré-requisitos verificáveis, evidências, aprendizados, recompensas e
desbloqueios reais.

A tela de Missões seguirá a opção visual aprovada `Central de missão`:

- uma missão recomendada ocupa o primeiro plano;
- poucas missões realmente disponíveis aparecem como alternativas;
- a trilha mostra progresso, dependências e próximos desbloqueios;
- missões semanais e opcionais só aparecem quando existirem de verdade;
- concluídas permanecem consultáveis como histórico de trabalho;
- estados bloqueados explicam o requisito que falta.

A Home continua respondendo `o que eu faço agora?`. A Central de missão responde `por que esta é a
prioridade, quais outras ações fazem sentido e como meu trabalho se encaixa na evolução da startup?`.

## Problema que este ciclo resolve

O workspace atual possui uma boa Home e uma primeira missão operacional, mas ainda não funciona
como um sistema completo de orientação porque:

1. existe somente a missão de cinco entrevistas;
2. o próximo desbloqueio é informativo e ainda não representa uma dependência completa;
3. não há catálogo por fase nem regras explícitas de recomendação;
4. Missões continua desabilitada na navegação;
5. a plataforma não conecta de forma contínua ação, evidência, aprendizado, decisão e próximo passo;
6. ainda não existe uma ponte clara entre estruturação inicial e gestão recorrente da startup.

O resultado esperado não é uma lista maior de tarefas. O produto deve escolher uma prioridade útil,
explicar o motivo, permitir executar, validar a conclusão e usar o resultado para recomendar a
próxima ação.

## Objetivos

- ativar a área de Missões com conteúdo e estados reais;
- oferecer uma trilha inicial de 10 missões, da descoberta ao recorte do MVP;
- manter uma única missão principal recomendada por vez;
- permitir missões opcionais e semanais sem retirar o foco principal;
- substituir desbloqueios visuais por pré-requisitos persistidos e verificáveis;
- exigir entregáveis, evidências ou decisões compatíveis com cada missão;
- preservar o vínculo entre missão, evidência, aprendizado e origem;
- recompensar trabalho real e impedir XP duplicado;
- preparar o domínio para missões recorrentes e dinâmicas em ciclos posteriores;
- continuar útil depois da trilha inicial por meio de gestão semanal e novas trilhas.

## Fora do escopo imediato

- geração autônoma de missões por inteligência artificial;
- editor administrativo completo de catálogo;
- mercado, loja ou moeda virtual;
- automação empresarial ampla, CRM ou financeiro completo;
- ativação prematura de Experimentos, Métricas, Documentos ou Conquistas sem seus modelos reais;
- otimização detalhada para celular;
- reestruturação visual da Home já aprovada.

## Fundamentos de produto e pesquisa

A trilha não copia um método único. Ela combina princípios complementares e os adapta ao domínio da
Startup Quest:

- A orientação da [Y Combinator sobre progresso real e metas semanais](https://www.ycombinator.com/blog/startup-school-week-8-recap-adora-cheung-on-prioritizing-your-time-and-kevin-hale-on-evaluating-startup-ideas)
  reforça que atividade deve produzir contato com usuários, produto ou crescimento, em vez de apenas
  sensação de ocupação.
- O [currículo da Startup School](https://www.ycombinator.com/blog/startup-school-videos) combina
  entendimento do usuário, MVP, métricas e execução; a plataforma deve tratar a criação como um ciclo
  de aprendizado, não como preenchimento linear de um plano.
- O [Test Card da Strategyzer](https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card)
  estrutura hipótese, teste, métrica e critério antes da execução.
- O [Learning Card da Strategyzer](https://www.strategyzer.com/library/capture-customer-insights-and-actions-with-the-learning-card)
  conecta observação, aprendizado e decisão posterior.
- A separação entre prática diária e meta mais longa é coerente com a experiência publicada pelo
  [Duolingo sobre evolução da sequência](https://blog.duolingo.com/improving-the-streak/): a atividade
  que mantém continuidade não precisa ser idêntica ao objetivo semanal mais exigente.
- A abordagem de [Disciplined Entrepreneurship](https://beta.disciplinedentrepreneurship.com/wp-content/uploads/2019/03/Disciplined_Entrepreneurship_-_Where_Do_I_Start.pdf)
  reforça segmentação, usuário, proposta de valor e experimentação como decisões encadeadas.

Essas referências justificam o encadeamento conceitual. Os textos, critérios, recompensas e regras
operacionais serão próprios da Startup Quest.

## Separação dos conceitos

| Conceito | Pergunta respondida | Responsabilidade |
| --- | --- | --- |
| Jornada | O que a startup já estruturou? | mapa de problema, público, proposta, solução e demais etapas |
| Missão | Qual trabalho concreto deve ser feito? | objetivo, passos, requisitos, recompensa e conclusão |
| Evidência | O que aconteceu no mundo real? | entrevistas, observações, documentos, números ou resultados |
| Aprendizado | O que foi descoberto? | síntese dos padrões e mudança de entendimento |
| Experimento | Como uma hipótese foi testada? | hipótese, método, métrica, critério e execução |
| Decisão | O que muda a partir do resultado? | manter, alterar, abandonar ou aprofundar uma direção |
| Gestão recorrente | O que precisa continuar acontecendo? | foco semanal, revisão, indicadores e próximos ciclos |

Uma missão pode produzir ou atualizar outros objetos, mas não substitui esses objetos. Exemplo: a
missão `Refine o problema com evidências` pode atualizar o problema no Mapa inicial e gerar um
aprendizado; ela não transforma o texto do problema na própria missão.

## Arquitetura escolhida

### Catálogo versionado e instâncias persistidas

O primeiro catálogo será curado no código e terá versão explícita. Cada definição conterá:

- chave estável;
- versão da definição;
- título, objetivo, motivo, instruções e dica contextual;
- fase e categoria;
- tipo: principal, opcional, semanal, experimento, aprendizado ou gestão;
- prioridade e ordem de apresentação;
- pré-requisitos por chave;
- tipo de ação e formulário necessário;
- entregável ou evidência exigida;
- critério de conclusão;
- recompensa;
- indicação de obrigatória ou opcional;
- origem `catalog` ou `dynamic`.

A tabela `Mission` continuará representando a missão atribuída a uma startup e receberá um retrato da
definição usada. O estado do usuário nunca dependerá somente do catálogo em memória.

Regras de versionamento:

1. uma nova definição cria missões ausentes para startups existentes;
2. missões concluídas não têm texto, recompensa ou critério alterados retroativamente;
3. uma missão iniciada preserva a versão com a qual começou;
4. correções de conteúdo sem impacto de regra podem ser migradas explicitamente;
5. mudanças de critério criam uma nova versão e uma migração consciente;
6. o processo de sincronização é idempotente.

Essa arquitetura evita o problema atual de sobrescrever automaticamente todo o conteúdo de uma
missão existente sempre que o blueprint muda.

### Evolução do modelo de evidência

`MissionEvidence` atualmente possui campos específicos de entrevista. Para suportar as novas
missões, a evidência deve admitir um núcleo genérico:

- tipo;
- título curto;
- resumo ou observação;
- data em que ocorreu;
- dados estruturados próprios do tipo;
- vínculo com missão e startup por meio da missão;
- timestamps e autor implícito pela propriedade da startup.

Os campos atuais de entrevista serão preservados durante a migração. Entrevistas continuarão com
identificação, perfil, contexto e anotações; outros tipos usarão dados compatíveis sem preencher
campos falsos.

### Avaliadores determinísticos

Cada tipo de missão terá um avaliador conhecido pelo backend. O catálogo declara o tipo de requisito,
mas não executa consultas arbitrárias. Os avaliadores verificam, por exemplo:

- quantidade mínima de entrevistas válidas;
- existência de aprendizado;
- atualização confirmada de um campo da Jornada;
- hipótese registrada;
- experimento com critério de sucesso;
- resultado e decisão registrados;
- definição de MVP e próximo ciclo.

Conclusão, XP, desbloqueio e eventos acontecem em transação. Repetir a mesma requisição não concede
recompensa novamente.

### Origem preparada para missões dinâmicas

Missões dinâmicas não serão geradas neste ciclo, mas usarão a mesma instância persistida. Uma missão
dinâmica futura deverá registrar:

- sinal que motivou sua criação;
- regra ou modelo responsável;
- versão da regra;
- explicação legível de `por que isto foi recomendado`;
- requisitos e recompensa limitados a tipos já suportados;
- origem `dynamic`.

Inteligência artificial poderá sugerir texto ou candidatos no futuro, mas regras de elegibilidade,
conclusão e recompensa continuarão validadas pelo backend.

## Motor de recomendação

O motor será baseado em regras e produzirá sempre uma recomendação explicável.

### Elegibilidade

Uma missão pode ser recomendada quando:

- pertence à startup ativa;
- não está concluída;
- todos os pré-requisitos obrigatórios foram concluídos;
- seus objetos de domínio necessários já existem ou podem ser criados naquele fluxo;
- não está fora da fase permitida;
- não foi encerrada, expirada ou substituída.

Estado bloqueado é derivado dos pré-requisitos. O sistema não deve confiar em uma marca visual
isolada que possa divergir das dependências reais.

### Ordem de recomendação

1. missão principal já iniciada e ainda válida;
2. missão obrigatória disponível correspondente ao ponto atual da trilha;
3. experimento ativo com ação ou prazo pendente;
4. missão semanal vencendo ou ainda não cumprida;
5. missão opcional contextual;
6. desempate por prioridade, ordem do catálogo e chave estável.

Somente o primeiro resultado vira `missão recomendada`. As demais elegíveis podem aparecer em
`Também disponível`, sem competir visualmente com o foco.

### Explicação da recomendação

O payload deve incluir uma razão curta e baseada em regra, por exemplo:

- `Continue esta missão porque você já registrou 2 de 5 entrevistas.`
- `Esta é a próxima etapa da trilha de Descoberta.`
- `Seu experimento termina hoje e ainda precisa de uma decisão.`
- `Faça a revisão para escolher o foco da próxima semana.`

## Trilha inicial aprovada

A trilha inicial é o primeiro arco operacional, da descoberta ao recorte do MVP. Ela não representa
todo o ciclo de vida da empresa. Trilhas posteriores cobrirão execução, aquisição, vendas, métricas,
operação e gestão contínua.

| Ordem | Chave sugerida | Missão | Entregável ou critério principal | Pré-requisito | XP sugerido |
| --- | --- | --- | --- | --- | ---: |
| 1 | `customer_interviews_5` | Converse com 5 potenciais clientes | cinco entrevistas e síntese de padrões | fundação concluída | 150 |
| 2 | `refine_problem_with_evidence` | Refine o problema com evidências | problema revisado e justificativa baseada nas entrevistas | missão 1 | 100 |
| 3 | `validate_priority_audience` | Valide o público prioritário | recorte de público, sinais observados e decisão de manter ou ajustar | missão 2 | 120 |
| 4 | `reframe_value_proposition` | Reformule a proposta de valor | proposta atualizada conectando público, dor e resultado esperado | missão 3 | 100 |
| 5 | `map_current_alternatives` | Mapeie as alternativas atuais | lista de alternativas, limitações e oportunidade percebida | missão 3 | 100 |
| 6 | `identify_riskiest_hypothesis` | Identifique a hipótese mais arriscada | hipótese explícita e motivo de prioridade | missões 4 e 5 | 80 |
| 7 | `plan_first_experiment` | Planeje o primeiro experimento | método, público, métrica, limite e critério de sucesso | missão 6 | 100 |
| 8 | `run_first_experiment` | Execute e registre o experimento | evidências, resultado medido e observações | missão 7 | 180 |
| 9 | `decide_from_experiment` | Interprete o resultado e tome uma decisão | aprendizado e decisão de manter, alterar, abandonar ou testar novamente | missão 8 | 120 |
| 10 | `define_smallest_mvp` | Defina o menor MVP e o próximo ciclo | escopo mínimo, exclusões, objetivo e foco da próxima semana | missão 9 | 150 |

Os valores de XP são configuração inicial e deverão ser calibrados com uso real. Alterações futuras
não podem reduzir ou duplicar recompensas já concedidas.

### Relação com a Jornada existente

- missões 1 a 3 validam e podem revisar `Problema` e `Público` sem mover a Jornada para trás;
- missão 4 alimenta `Proposta de valor`;
- missões 5 a 9 sustentam `Validação` e criam os primeiros objetos de experimento e decisão;
- missão 10 alimenta `MVP` e prepara `Execução`;
- toda alteração crítica preserva data, origem e objeto que motivou a revisão;
- `Modelo de negócio`, aquisição, vendas e operação pertencem às trilhas seguintes.

## Central de missão aprovada

### Rota e navegação

- rota: `/painel/startup/[startupId]/missoes`;
- `Missões` deixa de exibir `Em breve` e passa a ser um destino funcional da sidebar;
- o shell, seletor de startup, nível e sequência permanecem iguais às demais telas;
- a rolagem continua somente na área de conteúdo do workspace.

### Cabeçalho

O cabeçalho é compacto e informa:

- título `Missões`;
- fase ou arco atual;
- quantidade concluída no arco;
- frase curta: `Transforme a próxima dúvida da startup em ação.`

Não haverá hero, números gigantes ou uma segunda apresentação da marca.

### Bloco `Foco recomendado`

Ocupa a primeira posição e contém:

- razão da recomendação;
- tipo da missão;
- título e objetivo;
- progresso verificável;
- recompensa;
- próximo passo;
- ação `Continuar missão`.

Esse bloco é mais resumido do que a experiência de execução. A Home atual não será redesenhada
neste ciclo. A execução detalhada deve reutilizar os mesmos componentes e regras, evitando duas
implementações incompatíveis.

### Bloco `Também disponível`

- aparece somente se houver missões elegíveis além da principal;
- mostra no máximo três itens antes de uma ação de expansão;
- diferencia opcional e semanal por texto, não apenas por cor;
- informa esforço ou requisito principal em uma linha;
- não apresenta missão bloqueada como se pudesse ser iniciada;
- não exibe cartões vazios para simular funcionalidades futuras.

### Bloco `Sua trilha`

Lista compacta por fase com:

- ordem real;
- título;
- estado;
- resumo do progresso ou requisito de desbloqueio;
- recompensa concedida ou prevista;
- seleção da missão quando consultável.

Estados:

| Estado | Aparência | Comportamento |
| --- | --- | --- |
| Recomendada | realce âmbar, texto normal e motivo | abre a execução |
| Em andamento | progresso e próxima ação | abre a execução |
| Disponível | superfície neutra e texto legível | pode ser iniciada |
| Bloqueada | cinza, cadeado e requisito textual | não inicia; detalhes explicam o bloqueio |
| Concluída | confirmação teal e recompensa | abre evidências e aprendizado em leitura |
| Substituída | texto discreto e motivo | somente histórico, sem ação de conclusão |

O âmbar fica reservado à prioridade, seleção e ação principal. Verde/teal representa conclusão. O
cinza nunca será o único sinal de bloqueio.

### Histórico e conclusão do arco

- missões concluídas continuam consultáveis;
- evidências e aprendizados são somente leitura no histórico, salvo fluxo explícito de correção;
- quando as 10 missões forem concluídas, a Central celebra de forma curta e apresenta o próximo
  ciclo real;
- se a gestão semanal ainda não estiver implementada, a tela informa honestamente que a próxima
  trilha está em preparação e mantém o histórico acessível.

## Home, Central e execução

Para evitar duplicação conceitual:

| Superfície | Responsabilidade |
| --- | --- |
| Home | mostrar a prioridade atual, seu próximo gesto e o estado geral do fundador/startup |
| Central de missão | explicar opções, trilha, bloqueios, histórico e razão da recomendação |
| Execução da missão | coletar evidência, aprendizado, entregável e conclusão |

No primeiro incremento, a Home existente permanece funcional. A lógica de missão deve ser extraída
em componentes reutilizáveis antes de qualquer nova experiência detalhada. Nenhuma tela terá uma
cópia própria das regras de conclusão.

## Gamificação e continuidade

### Sequência diária

A sequência continua dependendo de pelo menos uma atividade significativa no dia. Login, abrir uma
tela ou clicar em `iniciar` não mantêm o fogo.

Atividades válidas incluem:

- evidência válida registrada;
- aprendizado criado;
- decisão registrada;
- etapa ou missão concluída;
- atualização semanal com conteúdo mínimo verificável.

### Missão semanal

A missão semanal será um objetivo maior e separado da sequência diária. Exemplo futuro: concluir
cinco entrevistas na semana. Uma entrevista válida pode manter o fogo daquele dia e avançar a meta
semanal, sem transformar cinco cliques em cinco dias de sequência.

### Recompensas

- XP por evidência usa chave de deduplicação;
- XP de conclusão é transacional e idempotente;
- missão opcional só recompensa trabalho verificável;
- uma definição alterada não reaplica recompensa;
- celebrações duram pouco, respeitam `prefers-reduced-motion` e não bloqueiam a próxima ação.

## Contrato inicial de API

### Leitura da Central

`GET /api/startups/<id>/missions/`

Deve retornar:

- startup e arco atual;
- progresso do arco;
- missão recomendada e razão da recomendação;
- missões disponíveis;
- missões bloqueadas com requisitos não atendidos;
- missões concluídas;
- missões semanais quando implementadas;
- versão do catálogo considerada.

Ordenação e recomendação vêm do backend. O frontend não decide qual missão é principal.

### Detalhe

`GET /api/startups/<id>/missions/<key>/`

Retorna conteúdo, passos, requisitos, progresso, evidências, aprendizado, pré-requisitos, recompensa e
ações permitidas.

### Mutações

As rotas atuais de evidência, aprendizado e conclusão serão preservadas enquanto forem compatíveis.
Novos tipos de missão podem ganhar operações específicas, mas todas devem:

- validar propriedade da startup;
- validar estado e pré-requisitos;
- retornar o estado reconciliado;
- registrar atividade significativa;
- impedir duplicação de XP;
- usar mensagens e erros de domínio legíveis.

O endpoint `today` continuará retornando somente a recomendação necessária à Home e deverá usar o
mesmo motor da Central.

## Estados de interface e falhas

### Carregamento

- usar skeletons com a geometria da Central;
- não exibir uma página vazia nem spinner central como única informação;
- preservar shell e navegação durante a carga.

### Erro de rede

- explicar que as missões não puderam ser carregadas;
- oferecer `Tentar novamente`;
- não inventar progresso local;
- manter troca de startup e saída disponíveis.

### Catálogo ausente ou inconsistente

- backend tenta sincronização idempotente;
- se continuar sem missão elegível, retorna estado explícito e observável;
- frontend mostra uma mensagem honesta, sem recomendar uma missão bloqueada;
- o erro deve ser registrado para diagnóstico.

### Sem alternativas

O bloco `Também disponível` simplesmente não aparece. Não existe estado vazio decorativo para uma
seção opcional.

### Todas concluídas

Mostrar resumo do arco, evidências produzidas e próximo ciclo real. Nunca reiniciar a trilha ou
conceder XP novamente automaticamente.

## Acessibilidade e comportamento desktop

- foco visível em links, linhas e ações;
- navegação completa por teclado;
- progresso exposto com semântica e valores legíveis;
- estado comunicado por texto, ícone e cor;
- contraste mínimo de 4,5:1 para texto comum;
- ações desabilitadas explicam o requisito sem depender de tooltip;
- transições de 150 a 250 ms e somente para comunicar estado;
- alternativa para movimento reduzido;
- validação principal em `1280 x 720`, `1366 x 768`, `1536 x 720` e `1920 x 900`;
- adaptação estrutural básica abaixo dessas larguras, sem priorizar experiência mobile neste ciclo.

## Entrega em três incrementos funcionais

### Incremento 1 — motor e descoberta

- catálogo versionado;
- sincronização segura de instâncias;
- pré-requisitos e recomendação determinística;
- endpoint e tela Central de missão;
- Missões habilitada na sidebar;
- missões 1 a 5 operacionais;
- evolução genérica de evidências;
- Home alimentada pelo mesmo motor;
- estados de carregamento, erro, bloqueio, ausência e conclusão;
- documentação e testes de contrato.

### Incremento 2 — experimentos e decisões

- modelos reais de hipótese, experimento, resultado e decisão;
- missões 6 a 9 operacionais;
- critérios de sucesso e encerramento;
- conexão com evidências e aprendizados;
- Experimentos habilitado somente quando a experiência mínima estiver completa.

### Incremento 3 — MVP e gestão semanal

- missão 10 operacional;
- definição do menor MVP e próximo ciclo;
- meta e revisão semanal;
- missões recorrentes de gestão;
- separação final entre sequência diária e objetivo semanal;
- base para futuras missões contextuais e dinâmicas.

Cada incremento precisa terminar com um fluxo utilizável. Não serão exibidos módulos ou cartões que
simulem capacidade ainda inexistente.

## Critérios de aceite do Incremento 1

1. Startups novas e antigas recebem as definições 1 a 5 sem duplicação.
2. Missões iniciadas ou concluídas não são alteradas indevidamente por sincronização.
3. O backend escolhe uma única missão recomendada com resultado determinístico.
4. Uma missão bloqueada não pode ser iniciada ou concluída por chamada direta à API.
5. Concluir uma missão desbloqueia as dependentes corretas na mesma transação ou reconciliação.
6. Home e Central exibem a mesma recomendação e o mesmo progresso.
7. Missões fica ativa na sidebar e respeita a startup selecionada.
8. A Central mostra foco, alternativas reais, trilha, bloqueios e histórico.
9. Missões sem alternativa escondem a seção, sem cartão falso.
10. Evidências de tipos diferentes não exigem campos de entrevista.
11. Requisições repetidas não duplicam evidência, conclusão, atividade ou XP quando houver chave de
    idempotência aplicável.
12. Trocar de startup não mistura missões, evidências, progresso ou aprendizados.
13. Carregamento, erro, vazio e conclusão do arco possuem estados úteis.
14. A tela funciona nas quatro resoluções desktop de referência sem rolagem horizontal.
15. Testes de backend, frontend, lint e build permanecem aprovados.

## Estratégia de testes

### Backend

- criação e sincronização de catálogo;
- preservação de versão e estado existente;
- grafo de pré-requisitos sem ciclos;
- recomendação e desempate determinísticos;
- autorização por proprietário;
- avaliadores por tipo de requisito;
- desbloqueio após conclusão;
- transações e idempotência de XP;
- migração das evidências atuais;
- isolamento entre startups.

### Frontend

- rota e item ativo da sidebar;
- renderização de foco, alternativas, trilha e histórico;
- ocultação de seções sem conteúdo;
- texto dos bloqueios;
- navegação para execução;
- loading skeleton, erro e retry;
- consistência entre payload da Home e da Central;
- foco por teclado e semântica de progresso;
- contratos visuais de tokens e ausência de overflow.

### Validação visual

- inspeção nas resoluções desktop de referência;
- conteúdo curto e longo;
- nomes de startup extensos;
- trilha parcialmente concluída e totalmente concluída;
- nenhuma alternativa disponível;
- combinação de recomendada, semanal e opcional nos incrementos em que existirem.

## Decisões de interface consolidadas

- direção escolhida pelo usuário: `Central de missão`;
- opção `Trilha primeiro` não foi escolhida porque enfraquece semanais e opcionais;
- opção `Quadro por status` não foi escolhida porque transforma orientação em gestão livre cedo
  demais;
- a Central equilibra direção, contexto e liberdade controlada;
- cartões serão usados somente para agrupamentos acionáveis; a trilha será uma lista estruturada;
- a tela não repetirá estatísticas gigantes nem conquistas em chips;
- a identidade azul-marinho, âmbar e teal do workspace será preservada;
- a Home aprovada não será redesenhada como efeito colateral deste ciclo.

## Questões deliberadamente adiadas

- quais sinais permitirão criar missões dinâmicas;
- quando uma recomendação dinâmica poderá superar a trilha principal;
- política de expiração e substituição de missões semanais;
- calibração de XP baseada em dados de uso;
- catálogo das trilhas de vendas, operação, aquisição e métricas;
- necessidade futura de um editor administrativo.

Essas decisões serão tomadas depois que a trilha inicial produzir dados reais de conclusão, abandono,
tempo e utilidade percebida.
