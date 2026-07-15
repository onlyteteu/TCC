# Arquitetura do primeiro ciclo de missões

## Objetivo

Este documento registra como o primeiro fluxo operacional da Startup Quest foi implementado.
O recorte transforma a missão de entrevistas em um ciclo completo e verificável:

`Missão -> Passos -> Evidências -> Aprendizado -> Conclusão -> XP, sequência e atividade`

## Interacao entre os elementos

1. A `Mission` define o objetivo, a explicacao, a recompensa e os criterios verificaveis.
2. A API deriva os passos de interface do estado persistido: preparar, registrar evidencias,
   sintetizar e concluir.
3. Cada `MissionEvidence` avanca a contagem do criterio sem, por si so, encerrar a missao.
4. Ao atingir a quantidade exigida, a sintese e liberada e vira um `Learning` ligado a mesma
   startup e missao.
5. A conclusao valida evidencias e aprendizado em uma transacao antes de mudar o status.
6. Cada gesto relevante cria um `ActivityEvent` com chave de deduplicacao; esse evento alimenta
   XP operacional, sequencia, atividade recente e conquistas.
7. A Home recebe esse estado agregado pelo endpoint `today`, de modo que passos, bloqueios,
   progresso e recompensa nunca dependem apenas do estado local da interface.

O XP da Jornada e o XP operacional sao somados na conta, mas a missao, suas evidencias e seu
aprendizado continuam locais a startup. Assim, trocar de startup preserva nivel e sequencia globais
sem misturar o trabalho e as decisoes de cada negocio.

## Modelo de dados

### Mission

Representa uma missão atribuída a uma startup. Guarda chave estável, tipo, fase, conteúdo de
orientação, quantidade de evidências exigidas, recompensa, status e datas de início e conclusão.
A chave inicial é `customer_interviews_5`.

### MissionEvidence

Registra a evidência entregue para uma missão. No primeiro ciclo, a evidência é uma entrevista e
possui identificação da pessoa, perfil, contexto, anotações e data da conversa. O modelo é genérico
o suficiente para receber outros tipos de evidência nos ciclos seguintes.

### Learning

Consolida o padrão encontrado nas evidências. Cada missão possui no máximo um aprendizado ativo,
com conteúdo, impacto, próxima ação e grau de confiança. Atualizações não concedem XP novamente.

### ActivityEvent

É o histórico imutável das atividades significativas. Cada evento possui tipo, descrição, XP,
data, metadados e uma chave de deduplicação. Essa tabela é a fonte operacional para XP adicional,
sequência de dias e atividade recente.

## Regras do fluxo inicial

1. A missão exige cinco entrevistas válidas.
2. Cada entrevista exige identificação e anotações com pelo menos 20 caracteres.
3. Cada entrevista concede 10 XP e cria um evento de atividade único.
4. O aprendizado só pode ser registrado após as cinco entrevistas.
5. A primeira criação do aprendizado concede 25 XP; edições posteriores não repetem a recompensa.
6. A missão só pode ser concluída com cinco entrevistas e um aprendizado.
7. A conclusão concede 150 XP uma única vez, mesmo que a requisição seja repetida.
8. Login isolado não cria evento e não mantém a sequência.
9. Uma etapa concluída da jornada mantém a sequência, mas não duplica os 100 XP já calculados pela jornada.

## Endpoints

- `GET /api/startups/<id>/today/`: reúne missão, jornada, gamificação, próximos passos e atividade.
- `POST /api/startups/<id>/missions/<key>/evidence/`: registra uma evidência.
- `POST /api/startups/<id>/missions/<key>/learning/`: cria ou atualiza o aprendizado.
- `POST /api/startups/<id>/missions/<key>/complete/`: conclui a missão de forma transacional e idempotente.

As rotas internas equivalentes do Next.js encaminham a sessão autenticada ao Django sem expor o
token ao componente de interface.

## Cálculo inicial da gamificação

- XP da jornada: 100 por etapa concluída.
- XP operacional: soma dos eventos de atividade.
- Nível: um novo nível a cada 300 XP.
- Sequência: dias locais consecutivos com pelo menos uma atividade significativa.
- Estado da sequência: mantida, em risco, quebrada ou ainda não iniciada.

## Decisões de interface

- a Home da startup, chamada `Hoje` no primeiro ciclo, concentra a próxima ação e evita exigir que
  o usuário descubra sozinho o que fazer
- a missão ocupa a área dominante; XP, fogo e saúde ficam em uma coluna lateral secundária
- o registro de entrevista acontece no contexto da missão, sem navegação desnecessária
- módulos futuros permanecem visíveis para comunicar a arquitetura, mas marcados como `em breve`
- a prioridade é desktop; há apenas uma adaptação estrutural básica para telas estreitas neste ciclo

## Próximas extensões previstas

1. Transformar a entrevista em um experimento relacionado a uma hipótese.
2. Criar uma biblioteca de missões por fase e regras de recomendação.
3. Exibir aprendizados e evidências em áreas próprias, mantendo o vínculo com a origem.
4. Atualizar métricas a partir das atividades e critérios de sucesso.
5. Gerar documentos vivos a partir das evidências e decisões registradas.

## Evolução aprovada em 2026-07-15

O próximo ciclo amplia esta arquitetura para o `Motor de Missões 2.0`. A evolução preserva o fluxo
operacional já implementado, mas adiciona:

- catálogo curado e versionado;
- instâncias persistidas que preservam a versão iniciada ou concluída;
- pré-requisitos verificáveis e recomendação determinística;
- evidências compatíveis com tipos além de entrevista;
- trilha inicial de 10 missões, da descoberta ao recorte do MVP;
- Central de missão com foco, alternativas reais, trilha, bloqueios e histórico;
- preparação para experimentos, decisões, gestão semanal e missões dinâmicas futuras.

A especificação completa e os critérios de aceite estão em
`design/2026-07-15-motor-missoes-2.md`. Este documento continua descrevendo fielmente o primeiro
ciclo já implementado; o novo documento descreve a evolução ainda não implementada.
