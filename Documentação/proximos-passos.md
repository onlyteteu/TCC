# Proximos Passos

## Nucleo atual concluido

- entrada pela startup usada por ultimo;
- workspace compartilhado com Home, Jornada e gerenciador;
- primeira missao real com evidencias, aprendizado, XP e sequencia;
- Mapa inicial editavel e Jornada com oito etapas;
- troca, renomeacao, criacao e exclusao segura de startups;
- retirada das telas provisorias do frontend.

## Ciclos posteriores

1. **Missoes completas:** biblioteca por fase, recomendacao contextual, missoes semanais e tarefas
   rapidas, sempre com criterios verificaveis.
2. **Experimentos:** hipoteses, metodo, criterio de sucesso, execucao, evidencias e resultado.
3. **Aprendizados:** biblioteca consultavel que preserve a origem em entrevistas e experimentos.
4. **Metricas:** indicadores definidos pelo usuario e alimentados por atividades e experimentos.
5. **Documentos:** artefatos vivos gerados a partir do mapa, evidencias, decisoes e metricas.
6. **Conquistas:** pagina propria, celebracoes e novos marcos sem premiar atividade vazia.

Esses modulos ja aparecem desabilitados na navegacao para comunicar a arquitetura, mas nao devem
ser tratados como implementados antes de seus dados, regras, estados vazios e testes existirem.

## Nota tecnica importante

O projeto deve ser acessado por `http://127.0.0.1:3000` (nao `localhost:3000`) com
`allowedDevOrigins` configurado em `next.config.ts` — sem isso, o Next.js bloqueia o hot-reload
nessa origem e a pagina fica sem interatividade (renderiza, mas nenhum clique funciona). Corrigido
em 2026-07-09; ver `progresso.md`.

Nota de direcao registrada em 2026-07-08: o visual atual do painel `Suas startups` foi preferido
em relacao aos mockups do hub (`hub-inicial-v1/v2`, `painel-startups-v1`). Os mockups seguem como
referencia de conteudo (saude, proximo passo, acessos rapidos), mas a composicao implementada e a
direcao valida.

## Itens que devem acompanhar cada ciclo

- atualizar a documentacao afetada no mesmo momento da implementacao
- registrar decisoes de escopo e arquitetura
- manter coerencia entre codigo, telas, fluxos e funcionalidades

## Evolucoes apos o nucleo inicial

- adicionar gamificacao leve ao fluxo principal
- refinar recomendacoes de proximos passos
- aprofundar indicadores de progresso

## Cuidados de escopo

- nao expandir para modulos de gestao empresarial completa
- nao adicionar funcionalidades que prejudiquem a entrega do fluxo principal
- nao transformar gamificacao no foco do produto
