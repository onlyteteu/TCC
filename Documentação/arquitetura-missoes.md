# Arquitetura do Motor de Missões 2.0

## Estado do documento

O Incremento 1 está implementado. Ele entrega o arco inicial de Descoberta/Proposta com cinco
missões operacionais, catálogo versionado, recomendação determinística, dependências reais,
Central de missão e telas de execução. Missões 6 a 10, Experimentos, Decisões e gestão semanal
continuam planejados para incrementos posteriores.

O ciclo implementado é:

`Catálogo -> Instâncias -> Recomendação -> Evidência -> Conclusão -> Jornada/Mapa -> XP`

## Catálogo e sincronização

`mission_catalog.py` é a fonte de verdade das definições. O catálogo atual é a versão 3 e
contém exatamente:

1. `customer_interviews_5` — Converse com 5 potenciais clientes;
2. `refine_problem_with_evidence` — Refine o problema com evidências;
3. `validate_priority_audience` — Valide o público prioritário;
4. `reframe_value_proposition` — Reformule a proposta de valor;
5. `map_current_alternatives` — Mapeie as alternativas atuais.

Cada definição possui chave e versão estáveis, tipo, fase, prioridade, ordem, recompensa, duração estimada,
pré-requisitos, orientações, critério de conclusão, tipo de ação, configuração dos
requisitos e passos. A validação rejeita chaves duplicadas, pré-requisitos ausentes e ciclos.

`sync_mission_catalog()` cria as cinco instâncias sem duplicá-las e atualiza somente snapshots
ainda não iniciados. Uma missão iniciada ou concluída preserva a definição com a qual o usuário
trabalhou, mesmo quando o catálogo evoluir.

## Modelo persistido

### Mission

Além da chave, conteúdo, recompensa, status e datas do primeiro ciclo, a instância guarda:

- versão da definição e origem;
- tipo e fase;
- ordem, prioridade e obrigatoriedade;
- chaves dos pré-requisitos;
- tipo de ação e regra de conclusão;
- configuração dos requisitos e blueprint dos passos;
- objetivo, motivo, instruções, critério e dica contextual.

### MissionEvidence

Aceita tanto entrevistas quanto submissões estruturadas. Os campos genéricos `evidence_type`,
`title`, `summary`, `details` e `submission_key` convivem com os campos legados de entrevista.
Uma restrição condicional impede duas evidências com a mesma chave de submissão na mesma
missão.

### Learning e ActivityEvent

`Learning` continua consolidando o padrão encontrado nas entrevistas. `ActivityEvent` registra
atividades significativas e imutáveis; suas chaves de deduplicação impedem XP repetido. O tipo
`evidence_recorded` cobre também as evidências estruturadas.

## Motor de estado e recomendação

O backend sincroniza o catálogo, reconcilia bloqueios e escolhe uma única recomendação. A ordem
é determinística:

1. missão em andamento;
2. missão obrigatória disponível;
3. outra missão disponível;
4. sem recomendação quando todo o arco foi concluído.

Home e Central consomem o mesmo avaliador para status, progresso e recomendação. O Today informa
`active`, `unavailable` ou `arc_complete`; ao concluir as cinco missões, a Home celebra o arco e
oferece a revisão da Central em vez de exibir um bloqueio falso.

Conclusão e concessão de XP ocorrem dentro de transação, com bloqueio do registro e chaves de
deduplicação. Repetir refresh, submissão ou conclusão não cria evidência, evento ou XP novo.

## Execução das cinco missões

- Entrevistas reutiliza o fluxo completo da Home: cinco evidências, aprendizado e conclusão.
- Refinamento do problema exige problema e resumo das evidências e atualiza problema na Startup,
  Jornada e Mapa da startup.
- Validação do público exige recorte, sinais observados e decisão; atualiza público na Startup,
  Jornada e Mapa da startup.
- Proposta de valor exige promessa e justificativa; atualiza a etapa correspondente e a conclui
  somente quando ela é a etapa atual.
- Alternativas exige opções atuais, limitações e oportunidade, registra evidência estruturada e
  reconcilia o marco de diferenciais mesmo quando concluída fora da ordem principal.

Cada primeira submissão estruturada válida concede 25 XP de evidência, além do XP próprio da
missão concluída. Validações superficiais retornam erros por campo; missões bloqueadas retornam
os pré-requisitos ainda necessários.

## Endpoints entregues

- `GET /api/startups/<id>/today/` — Home, recomendação e progresso agregado;
- `GET /api/startups/<id>/missions/` — Central, arco, foco, alternativas, bloqueadas e concluídas;
- `GET /api/startups/<id>/missions/<key>/` — detalhe, instruções e evidências;
- `POST /api/startups/<id>/missions/<key>/submission/` — submissões estruturadas;
- `POST /api/startups/<id>/missions/<key>/evidence/` — entrevistas;
- `POST /api/startups/<id>/missions/<key>/learning/` — aprendizado da missão de entrevistas;
- `POST /api/startups/<id>/missions/<key>/complete/` — conclusão idempotente.

As rotas internas equivalentes do Next.js encaminham a sessão HTTP-only ao Django sem expor o
token aos componentes.

## Responsabilidades de interface

- Home responde `o que fazer agora?` e mantém entrevistas no contexto em que já funcionavam.
- Central em `/painel/startup/<id>/missoes` mostra foco, alternativas realmente disponíveis,
  trilha, bloqueios e histórico.
- Detalhe em `/painel/startup/<id>/missoes/<key>` orienta e executa as quatro submissões
  estruturadas; bloqueadas explicam requisitos e concluídas ficam em modo leitura.
- Jornada apresenta as oito etapas em quatro capítulos, o marco atual e o Mapa da startup; ela não
  conclui marcos diretamente e recebe apenas efeitos coerentes produzidos pelas missões.

## Gamificação

- etapas legadas preservam o XP já registrado; etapas ligadas a missões usam a recompensa da missão
  sem somar um segundo XP pela Jornada;
- entrevistas: 10 XP por evidência;
- primeiro aprendizado da missão de entrevistas: 25 XP;
- submissão estruturada válida: 25 XP;
- conclusão: recompensa congelada na instância da missão;
- nível: um novo nível a cada 300 XP;
- sequência: dias locais consecutivos com atividade significativa, nunca login ou abertura de tela.

## Limites atuais

Não estão implementados neste incremento:

- missões 6 a 10 da trilha aprovada;
- entidades e telas de Experimentos e Decisões;
- biblioteca independente de Aprendizados;
- missões semanais, metas e revisão recorrente;
- geração dinâmica ou por IA;
- Métricas e Documentos derivados do motor.

O próximo plano recomendado é o Incremento 2, depois de validar o uso real deste arco inicial.
A especificação de produto permanece em `design/2026-07-15-motor-missoes-2.md`.
