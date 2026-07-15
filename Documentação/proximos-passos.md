# Proximos Passos

## Nucleo atual concluido

- entrada pela startup usada por ultimo;
- workspace compartilhado com Home, Jornada e gerenciador;
- primeira missao real com evidencias, aprendizado, XP e sequencia;
- Mapa inicial editavel e Jornada com oito etapas;
- troca, renomeacao, criacao e exclusao segura de startups;
- retirada das telas provisorias do frontend.

## Ciclos posteriores

1. **Motor de Missoes 2.0:** catalogo versionado, recomendacao deterministica, dependencias reais e
   Central de missao. O primeiro incremento ativa as missoes 1 a 5 da trilha de Descoberta; os dois
   incrementos seguintes conectam experimentos, decisoes, MVP e gestao semanal. A especificacao
   aprovada esta em `design/2026-07-15-motor-missoes-2.md`.
2. **Experimentos:** hipoteses, metodo, criterio de sucesso, execucao, evidencias e resultado.
3. **Aprendizados:** biblioteca consultavel que preserve a origem em entrevistas e experimentos.
4. **Metricas:** indicadores definidos pelo usuario e alimentados por atividades e experimentos.
5. **Documentos:** artefatos vivos gerados a partir do mapa, evidencias, decisoes e metricas.
6. **Conquistas:** pagina propria, celebracoes e novos marcos sem premiar atividade vazia.

Esses modulos ja aparecem desabilitados na navegacao para comunicar a arquitetura, mas nao devem
ser tratados como implementados antes de seus dados, regras, estados vazios e testes existirem.

## Nota tecnica importante

Os scripts do projeto usam `http://127.0.0.1:3000`. O `allowedDevOrigins` de `next.config.ts`
autoriza `127.0.0.1` e `localhost`; a configuracao evita que a origem escolhida bloqueie o
hot-reload e deixe a pagina renderizada sem interatividade. Corrigido em 2026-07-09; ver
`progresso.md`.

Nota historica de 2026-07-08: naquela data, o painel `Suas startups` foi preferido aos mockups do
hub. Essa decisao foi superada em 2026-07-14, quando o painel e as telas de detalhe foram removidos
e substituidos por Home, Jornada e Gerenciador. Os mockups continuam somente como arquivo historico.

## Itens que devem acompanhar cada ciclo

- atualizar a documentacao afetada no mesmo momento da implementacao
- registrar decisoes de escopo e arquitetura
- manter coerencia entre codigo, telas, fluxos e funcionalidades

## Evolucoes apos o nucleo inicial

- ampliar a gamificacao existente com a pagina de Conquistas e novos marcos verificaveis;
- refinar recomendacoes de proximos passos com base em fase, evidencias e aprendizados;
- aprofundar indicadores por meio do futuro modulo de Metricas.

## Cuidados de escopo

- nao expandir para modulos de gestao empresarial completa
- nao adicionar funcionalidades que prejudiquem a entrega do fluxo principal
- nao transformar gamificacao no foco do produto
