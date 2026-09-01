# Validação do Incremento 1 em uso real

Data de abertura: 2026-09-01. Documento vivo: preencher durante e logo após cada rodada.

`proximos-passos.md` condiciona a ampliação do catálogo a esta validação. O objetivo não é confirmar
que o arco funciona, é descobrir onde ele falha enquanto ainda é barato mudar texto, critério e ordem.

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
|  |  |  |  |  |  |

## Decisões derivadas

Cada linha de severidade `trava` ou `atrito` recorrente precisa virar uma decisão explícita aqui:
mudança de texto, de critério de conclusão, de ordem das missões ou de interface. O que não virar
decisão nesta seção não entra no código.

| Achado | Decisão | Onde muda | Vira DEC? |
| --- | --- | --- | --- |
|  |  |  |  |

## Critério de encerramento

A validação está encerrada quando as cinco perguntas iniciais tiverem resposta amarrada a observação
e as travas encontradas tiverem decisão registrada. Só então o catálogo pode crescer para as missões
6 a 8, conforme `proximos-passos.md`.
