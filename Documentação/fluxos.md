# Fluxos

## Estado atual

O fluxo principal esta operacional de ponta a ponta: autenticacao, resolucao da startup mais
recente, criacao, troca, trabalho guiado, gerenciamento e exclusao com fallback.

## Fluxos atuais do workspace

### Login e resolucao da entrada

1. O usuario entra ou cria a conta.
2. `/painel` consulta as startups da conta autenticada.
3. Sem startup, o usuario segue para `/painel/startups/nova`.
4. Com startups, abre aquela com `lastOpenedAt` mais recente em `/painel/startup/<id>`.
5. Uma startup sem `lastOpenedAt` ainda participa do desempate pela atividade e pela ordem segura
   do backend.

### Troca de startup

1. O usuario abre o seletor da topbar.
2. Seleciona uma startup pertencente a sua conta.
3. O frontend registra a abertura em `POST /api/startups/<id>/open`.
4. A Home da escolhida abre e ela passa a ser a entrada preferida no proximo login.

### Criacao de startup

1. O usuario escolhe `Nova startup` no seletor ou `Criar nova startup` no gerenciador.
2. O fluxo de fundacao coleta nome, ideia, segmento, problema e publico inicial.
3. A criacao e persistida somente ao final do fluxo.
4. A nova startup abre como contexto ativo do workspace.

### Exclusao e fallback

1. O usuario abre `/painel/startups` e solicita a exclusao.
2. O dialogo descreve a perda de jornada, missoes e evidencias e exige a digitacao do nome.
3. Ao excluir uma startup nao ativa, a lista e atualizada sem trocar o contexto atual.
4. Ao excluir a ativa, `nextStartupId` define a proxima Home; sem outra startup, abre o gerenciador
   vazio ou o fluxo de criacao.
5. Falha ao atualizar a lista depois de uma exclusao confirmada nao desfaz a exclusao ja concluida.

### Logout

O menu da conta encerra a sessao e devolve o usuario a tela de login. Recursos de outro usuario
continuam respondendo como nao encontrados, sem revelar a existencia dos dados.

## Historico de evolucao dos fluxos

Esta secao preserva a sequencia de implementacao sem confundi-la com a navegacao vigente:

- **2026-04-09:** autenticacao e fundacao passaram a funcionar; `/painel` ainda levava a um painel
  inicial e a criacao terminava na tela provisoria `Suas startups`;
- **2026-07-08:** cards passaram a abrir uma pagina de detalhe com Mapa e Jornada. Essa pagina e o
  dashboard provisorio foram etapas intermediarias;
- **2026-07-13:** a primeira missao real passou a orientar a pagina chamada `Hoje`;
- **2026-07-14:** o workspace substituiu as telas intermediarias. A pagina `Hoje` tornou-se Home,
  a Jornada ganhou rota propria, o Mapa foi integrado a ela e `Suas startups` foi substituida pelo
  gerenciador em `/painel/startups`.

Os fluxos vigentes sao exclusivamente os descritos em `Fluxos atuais do workspace` acima. Em
especial, a criacao ocorre em `/painel/startups/nova`, a entrada ocorre pela Home da startup mais
recente e nao existe mais uma pagina de detalhe ou dashboard provisorio em producao.
