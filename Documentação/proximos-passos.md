# Próximos Passos

## Núcleo atual concluído

- entrada pela startup usada por último e workspace compartilhado;
- Home, Jornada, Mapa inicial e gerenciamento de startups;
- gamificação baseada em atividades significativas, com XP, nível e sequência;
- Motor de Missões 2.0 com catálogo versionado e recomendação determinística;
- Central de missão e detalhe operacional;
- cinco missões do arco inicial: entrevistas, problema, público, proposta e alternativas;
- dependências, bloqueios, submissões idempotentes e integração com Jornada/Mapa.

## Antes de ampliar o motor

O primeiro passo aprovado é implementar o redesenho da Jornada como `Mapa de Capítulos`, descrito em
`design/2026-07-21-jornada-mapa-capitulos.md`. A mudança deve preservar as oito etapas e fazer do
backend a fonte de verdade para progresso, bloqueios e XP.

Depois, validar o Incremento 1 em uso real. Observar especialmente:

- se o fundador entende por que uma missão foi recomendada;
- se consegue concluir as cinco missões sem explicação externa;
- onde abandona ou entrega respostas superficiais;
- se a relação entre Home, Central, detalhe, Jornada e Mapa fica clara;
- se XP e fogo reforçam trabalho real sem competir com o objetivo da missão.

Essa validação deve orientar texto, critérios e ordem antes de aumentar o catálogo.

## Incremento 2 recomendado

Depois da validação do arco atual:

1. implementar as missões 6 a 8 da trilha aprovada;
2. criar Experimentos com hipótese, método, critério de sucesso, execução e resultado;
3. criar Decisões ligadas às evidências e aos resultados dos experimentos;
4. ampliar Aprendizados para uma biblioteca consultável com origem preservada;
5. manter a recomendação determinística enquanto não houver dados suficientes para regras
   dinâmicas confiáveis.

## Incremento 3 previsto

- missões 9 e 10 e recorte do MVP;
- metas, missões semanais e revisão recorrente;
- Métricas alimentadas por atividades e experimentos;
- Documentos vivos derivados do mapa, evidências e decisões;
- ampliação de Conquistas com marcos verificáveis.

## Itens ainda futuros

Experimentos, Decisões, biblioteca independente de Aprendizados, Métricas, Documentos, página
completa de Conquistas, Configurações e missões dinâmicas não estão implementados. Entre esses
itens, Experimentos, Aprendizados, Métricas, Documentos e Conquistas estão visíveis na sidebar e
continuam desabilitados até possuírem dados, regras, estados vazios e testes. Configurações
permanece futura e ainda não aparece na navegação.

## Itens que devem acompanhar cada ciclo

- atualizar documentação, testes e handoff no mesmo incremento;
- registrar decisões de escopo e arquitetura;
- preservar compatibilidade com missões já iniciadas ou concluídas;
- manter Home, Central, detalhe e Jornada com responsabilidades distintas;
- validar os viewports desktop `1280 x 720`, `1366 x 768`, `1536 x 720` e `1920 x 900`;
- verificar navegação por teclado e mensagens que não dependam apenas de cor.

## Cuidados de escopo

- não expandir para CRM, financeiro ou operação empresarial completa;
- não criar missões opcionais ou semanais apenas para preencher a interface;
- não conceder XP por login, abertura de tela ou clique sem trabalho real;
- não transformar gamificação no foco do produto;
- não introduzir geração por IA antes de existir sinal de uso e mecanismo de auditoria.

A especificação dos três incrementos está em `design/2026-07-15-motor-missoes-2.md`.
