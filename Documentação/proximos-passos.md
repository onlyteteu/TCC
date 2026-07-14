# Proximos Passos

## Prioridade imediata

1. ~~Permitir editar e renomear a startup depois da criacao inicial.~~ Concluido em 2026-07-08
   (renomeacao inline no painel + `PATCH /api/startups/<id>/` com atualizacao parcial).
2. ~~Criar a pagina de detalhe da startup: o card do painel vira porta de entrada.~~ Concluido em
   2026-07-08 (`/painel/startup/[id]` com mapa inicial editavel e jornada com status honesto).
3. ~~Estruturar a base inicial da jornada guiada (modelo `JourneyStep` com as 8 etapas e API).~~
   Concluido em 2026-07-08: jornada jogavel de ponta a ponta na pagina de detalhe.
4. ~~Evoluir o painel interno para um dashboard de progresso real.~~ Concluido em 2026-07-08:
   cards com barra de progresso da jornada, proxima etapa e progresso medio da conta.
5. ~~Definir a primeira camada de gamificacao leve.~~ Concluido em 2026-07-08: XP, nivel e
   cinco conquistas calculados do estado real da jornada, exibidos no painel.
6. ~~Celebracao curta ao concluir etapa.~~ Concluido em 2026-07-09: anel e faiscas no marcador
   da etapa, reaproveitando o vocabulario visual da celebracao de fundacao.
7. Proximas frentes sugeridas (ordem de valor):
   - celebracao/toast ao desbloquear uma conquista (hoje so atualiza silenciosamente no painel)
   - resumo/mapa exportavel da startup (bom para a banca do TCC)
   - tarefas por etapa e recomendacoes mais inteligentes de proximo passo
   - conquistas tambem na pagina de detalhe da startup

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
