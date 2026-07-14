# Funcionalidades

## Estado atual

Em 2026-07-14, a plataforma possui um workspace principal funcional: autenticacao, criacao e
gerenciamento de startups, Home guiada por missao, Jornada mestre-detalhe e gamificacao ligada a
atividades reais.

## Escopo da gamificacao

### Global da conta

- XP total e nivel combinam as etapas concluidas em todas as startups com eventos operacionais;
- a sequencia de dias usa atividades significativas, nunca apenas o login;
- conquistas globais derivam de marcos reais, como fundacao, entrevistas, aprendizado e missao;
- a topbar preserva nivel e sequencia ao trocar de startup.

### Local da startup

- a Home mostra a missao principal, seu progresso, recompensa e desbloqueio;
- evidencias, aprendizado, etapa da jornada e atividade recente pertencem a startup ativa;
- fase e progresso da Jornada refletem somente o percurso daquela startup;
- concluir entrevistas, aprendizado e missao gera eventos deduplicados e evita XP repetido.

A gamificacao informa e reforca o trabalho empreendedor. Ela nao substitui os criterios reais de
conclusao, nao premia login isolado e nao cria progresso apenas visual.

## Workspace principal implementado em 2026-07-14

- shell compartilhado com marca, navegacao, seletor, nivel, sequencia e menu de conta;
- entrada automatica pela startup usada por ultimo;
- Home orientada pela primeira missao operacional;
- Jornada com oito etapas, bloqueios honestos e Mapa inicial editavel;
- gerenciador com abertura, renomeacao, exclusao confirmada e fallback;
- estados de carregamento, erro, sessao e conteudo ausente nas rotas principais.
- sessao rejeitada pelo backend limpa o cookie antes de retornar ao login;
- mutacoes de Home, Jornada e Mapa reconciliam topbar e gerenciador sem recarga manual;

## Funcionalidades implementadas

### 1. Autenticacao e sessao

- cadastro, login, perfil e logout reais;
- sessao protegida por cookie HTTP-only entre Next.js e Django;
- `/painel` resolve a criacao ou a startup aberta mais recentemente;
- recursos de outra conta respondem como nao encontrados.

### 2. Fundacao e ciclo de vida da startup

- criacao dedicada em `/painel/startups/nova` com nome opcional, ideia, segmento, problema e publico;
- listagem, abertura, leitura, atualizacao parcial e exclusao no backend;
- `last_opened_at` registra a startup usada por ultimo, com ordenacao deterministica e nulos por ultimo;
- `nextStartupId` fornece fallback depois da exclusao da startup ativa.

### 3. Workspace principal

- shell unico com marca, sidebar, topbar, seletor de startup e menu de conta;
- Home em `/painel/startup/[id]`;
- Jornada em `/painel/startup/[id]/jornada`;
- gerenciador em `/painel/startups`;
- somente a area de conteudo rola no layout desktop.

### 4. Home guiada por missao

- missao principal com objetivo, motivo, passos, progresso, criterio e recompensa;
- registro de entrevistas como evidencias;
- sintese do aprendizado liberada depois das cinco entrevistas;
- conclusao transacional e idempotente;
- atividade recente e proximo desbloqueio derivados do backend.

### 5. Jornada e Mapa inicial

- oito etapas semeadas automaticamente por startup;
- etapa atual aberta, concluidas revisitaveis e futuras bloqueadas;
- editor com pergunta, dica, exemplo, rascunho e conclusao;
- Mapa inicial edita uma secao por vez: nome, ideia, segmento, problema, publico e objetivo;
- problema e publico permanecem sincronizados entre Startup e Jornada.

### 6. Gerenciamento de startups

- linhas compactas com fase, progresso, ultima atividade e startup ativa;
- abertura e renomeacao no contexto do workspace;
- exclusao com dialogo, digitacao do nome e foco controlado;
- estado vazio encaminha para a criacao.

### 7. Gamificacao baseada em atividade real

- 100 XP por etapa concluida da Jornada;
- 10 XP por entrevista, 25 XP pelo primeiro aprendizado da missao e 150 XP por sua conclusao;
- um nivel a cada 300 XP;
- sequencia calculada por dias com atividade significativa, nunca por login isolado;
- eventos deduplicados impedem recompensa repetida;
- nivel e sequencia sao globais da conta; missao, evidencias, aprendizado e fase sao locais da startup.

## Modulos ainda nao implementados

- biblioteca completa de Missoes;
- Experimentos;
- area propria de Aprendizados;
- Metricas;
- Documentos;
- pagina completa de Conquistas;
- Configuracoes.

Eles permanecem desabilitados na sidebar e nao possuem links falsos.

## Historico de implementacao

- **2026-04-09:** autenticacao, fundacao em cinco etapas e uma primeira tela `Suas startups`;
- **2026-07-08:** CRUD, pagina de detalhe, Jornada e primeira gamificacao derivada das etapas;
- **2026-07-13:** missao de entrevistas, evidencias, aprendizado, eventos operacionais, XP e sequencia;
- **2026-07-14:** dashboard, pagina de detalhe e tela `Hoje` provisorios foram removidos e suas
  responsabilidades migraram para Home, Jornada e Gerenciador do workspace atual.

As expressoes `painel inicial`, `Suas startups` e `pagina de detalhe` descrevem apenas esses ciclos
historicos. Nao representam componentes ou destinos vigentes.

## Fora do escopo funcional atual

- CRM
- financeiro avancado
- contabilidade
- operacao completa da empresa
- automacoes empresariais complexas
