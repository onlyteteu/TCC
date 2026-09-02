# Validação do Incremento 1 em uso real

Data de abertura: 2026-09-01. Documento vivo: preencher durante e logo após cada rodada.

`proximos-passos.md` condiciona a ampliação do catálogo a esta validação. O objetivo não é confirmar
que o arco funciona, é descobrir onde ele falha enquanto ainda é barato mudar texto, critério e ordem.

## Estado em 2026-09-02

A rodada técnica foi concluída em uma conta descartável separada da conta principal. Ela confirma
persistência, regras, navegação e apresentação do arco, mas não substitui uma rodada com fundador que
nunca viu o produto. Por isso, a validação com usuário permanece aberta e o catálogo não deve ser
ampliado ainda.

- conta de validação separada, com a `Startup de Teste` de identificador `8`;
- cinco entrevistas, síntese de aprendizado e cinco missões concluídas pelo fluxo real do navegador;
- Central em `5 de 5`, Home em `arc_complete`, Jornada em `4 de 8` etapas e conta com `945 XP`;
- respostas persistidas e reapresentadas no detalhe concluído em modo somente leitura;
- tentativa de abrir a startup `8` na conta principal corretamente bloqueada como recurso inexistente
  ou não pertencente à conta;
- Home, Jornada e Central inspecionadas em `1280 x 720`, `1366 x 768`, `1536 x 864` e `1920 x 900`,
  sem overflow horizontal, recorte de ações ou erro de runtime;
- link `Ir para o conteúdo` alcançado por teclado e ativado com sucesso;
- validações automatizadas e estáticas executadas em 2026-09-02: `170/170` testes frontend,
  `113/113` testes backend, `check`, verificação de migrations, TypeScript, lint e build aprovados.

## Perguntas que a validação precisa responder

1. o fundador entende por que aquela missão foi recomendada?
2. ele conclui as cinco missões sem explicação externa?
3. onde abandona ou entrega resposta superficial?
4. a relação entre Home, Central, detalhe, Jornada e Mapa fica clara?
5. XP e sequência reforçam trabalho real sem competir com o objetivo da missão?

Uma resposta só vale se estiver amarrada a um momento observado. `pareceu claro` não é resposta.

## Aviso sobre quem testa

Você construiu o produto, então não consegue não entender a interface: sabe o que cada palavra quer
dizer porque escreveu. A sua rodada serve para achar travas mecânicas, texto ambíguo e fluxo quebrado,
não para responder às perguntas 1 e 3 com honestidade.

Portanto: faça a rodada 1 sozinho para limpar o caminho e, se conseguir, rode a 2 e a 3 com pessoas
que nunca viram o produto — de preferência alguém que tenha ou queira ter uma startup. Cada pessoa
nova custa quarenta minutos e vale mais que uma semana de suposição. Se não for possível agora,
registre isso aqui e trate os achados como parciais, sem alegar validação com usuário na monografia.

## Preparação

1. subir o ambiente na raiz: `.\LIGAR-TUDO.cmd`;
2. usar a conta administrativa e a startup marcada como workspace de teste, que permite reiniciar
   pela própria Home e preserva o `id` e os dados-base da startup;
3. reiniciar o workspace antes de cada rodada, para todo participante começar do mesmo ponto;
4. deixar cronômetro à mão e anotar o horário de início de cada missão.

## Regras de condução

- não explicar nada antes da pessoa travar de fato; contar até dez em silêncio antes de intervir;
- quando ela perguntar `o que eu faço aqui?`, devolver `o que você acha que dá para fazer?` e anotar
  a resposta literal;
- pedir que pense em voz alta e não julgue a interface, só narre o que está tentando fazer;
- anotar a frase literal da pessoa, não o resumo dela; a frase é o dado;
- toda intervenção sua é um achado: se precisou explicar, o produto não explicou.

## Roteiro por missão

Para cada uma das cinco missões, registrar: tempo até começar, tempo até concluir, intervenções
necessárias, qualidade da resposta entregue e frases literais relevantes.

### 1. Converse com 5 potenciais clientes — `customer_interviews_5`

- a pessoa entende que precisa conversar com gente de verdade, ou tenta preencher inventando?
- o registro de cada entrevista pede o que ela realmente lembra da conversa?
- a síntese de aprendizado, liberada só após as cinco, aparece como recompensa ou como obstáculo?
- ela percebe que as evidências registradas alimentam a missão seguinte?

### 2. Refine o problema com evidências — `refine_problem_with_evidence`

- ela conecta a nova formulação às entrevistas, ou reescreve a ideia original com outras palavras?
- as evidências das cinco entrevistas aparecem no momento certo e são usadas?
- o critério de conclusão a impede de entregar algo superficial, ou passa qualquer texto?

### 3. Defina o público prioritário — `validate_priority_audience`

- ela decide um público ou lista todos os possíveis?
- entende que priorizar é excluir?

### 4. Formule a promessa central — `reframe_value_proposition`

- a promessa conecta público, dor e resultado, ou vira slogan?
- ela reaproveita o que já registrou ou começa do zero, sinal de que o produto não devolveu o contexto?

### 5. Compare as alternativas atuais — `map_current_alternatives`

- ela mapeia o que as pessoas fazem hoje, ou lista concorrentes formais?
- ao terminar, entende que fechou um arco? O estado `arc_complete` comunica isso?

## Navegação e gamificação

Perguntar ao fim, sem induzir:

- `me mostra onde você vê o quanto já andou` — observar se vai à Jornada, à Home ou se procura;
- `o que a Central de missão faz que a Home não faz?`;
- `o que aconteceu quando você ganhou XP?` — se ela não souber dizer, o reforço não está funcionando;
- `o que você faria agora se estivesse sozinha?`.

## Achados

Preencher durante a rodada. Severidade: `trava` impede concluir, `atrito` atrasa ou frustra,
`ruído` incomoda sem impedir.

| # | Momento | O que aconteceu | Frase literal | Severidade | Hipótese de causa |
| --- | --- | --- | --- | --- | --- |
| 1 | Home, depois de concluir a quinta missão | O atalho de teste `Concluir missão atual` continuou habilitado mesmo sem missão disponível; o clique não alterou XP nem progresso, mas exibiu erro. | `Nao ha uma missao disponivel para concluir.` | atrito | O banner de teste não deriva seu estado do `arc_complete` para ocultar ou desabilitar a ação. |
| 2 | Central, detalhe, Jornada e atividade recente | Rótulos de estado e títulos derivados aparecem sem acentuação em trechos visíveis e em nomes acessíveis. | `Concluida`, `Missao concluida`, `Evidencia registrada`, `Validacao inicial` | ruído | Parte das cópias ainda vem de literais ASCII compartilhados entre catálogo, API e frontend. |
| 3 | Acesso direto à startup de teste pela conta principal | A interface recusou o acesso e explicou que a startup não existe ou não pertence à conta. | `Essa startup não existe ou não pertence à sua conta.` | não se aplica | Comportamento esperado de isolamento entre contas; não requer mudança. |
| 4 | Retorno ao detalhe da missão de problema depois do arco completo | O sistema preservou a formulação e as evidências e apresentou o conteúdo como consulta. | `Esta missao esta concluida. Os dados abaixo permanecem somente para consulta.` | não se aplica | Comportamento esperado de persistência e idempotência; a frase participa apenas do achado de acentuação. |

## Respostas parciais às perguntas iniciais

1. A Home e a Central exibem o motivo da recomendação, mas a compreensão por um fundador novo não
   foi validada nesta rodada técnica.
2. O fluxo completo é executável sem trava mecânica e mantém dependências, bloqueios, persistência e
   idempotência. Isso não demonstra que uma pessoa nova consiga concluí-lo sem explicação externa.
3. Não houve abandono técnico. A qualidade das respostas foi deliberadamente suficiente para os
   critérios; ainda falta observar onde um usuário novo entrega resposta superficial.
4. Home, Central, detalhe e Jornada permaneceram coerentes depois de cada avanço. A distinção entre
   essas áreas ainda precisa ser explicada por um participante, sem indução.
5. O XP só avançou com entrevistas, entregáveis e missões; abrir telas e entrar na conta não gerou
   recompensa. Ainda falta observar se a gamificação ajuda ou distrai uma pessoa real.

## Decisões derivadas

Cada linha de severidade `trava` ou `atrito` recorrente precisa virar uma decisão explícita aqui:
mudança de texto, de critério de conclusão, de ordem das missões ou de interface. O que não virar
decisão nesta seção não entra no código.

| Achado | Decisão | Onde muda | Vira DEC? |
| --- | --- | --- | --- |
| 1 | Quando o arco estiver concluído, retirar a ação de conclusão rápida ou apresentá-la desabilitada com texto de estado, sem provocar uma requisição destinada a falhar. | Banner `Modo de teste` da Home | não |
| 2 | Corrigir acentuação em todas as cópias visíveis e nomes acessíveis derivados de status, evento, marco e erro. | Catálogo/API e componentes de Home, Central, detalhe e Jornada | não |
| Validação externa pendente | Não ampliar para as missões 6 a 8 antes de duas ou três rodadas com pessoas que não conhecem o produto. | Planejamento do Incremento 2 | decisão já vigente |

## Critério de encerramento

A validação está encerrada quando as cinco perguntas iniciais tiverem resposta amarrada a observação
e as travas encontradas tiverem decisão registrada. Só então o catálogo pode crescer para as missões
6 a 8, conforme `proximos-passos.md`.

Situação em 2026-09-02: a rodada técnica está encerrada e não encontrou trava. A validação do
Incremento 1 continua aberta porque as perguntas 1 e 3, e as partes subjetivas das perguntas 4 e 5,
dependem de participantes externos.
