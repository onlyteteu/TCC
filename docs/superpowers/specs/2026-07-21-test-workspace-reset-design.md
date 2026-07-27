# Ambiente de testes reiniciável

## Objetivo

Permitir que o proprietário do Startup Quest teste repetidamente a jornada publicada sem precisar criar uma nova conta ou uma nova startup a cada ciclo. Uma conta exclusiva terá uma única Startup de Teste capaz de voltar com segurança ao estado da primeira missão.

O recurso é uma ferramenta de desenvolvimento e validação do produto. Ele não faz parte da experiência normal de fundadores.

## Experiência aprovada

A Startup de Teste exibe no painel uma faixa compacta `Modo de teste`, com a ação `Reiniciar ambiente`.

Ao acionar o reset:

1. Um modal informa que o progresso de teste será apagado.
2. O usuário confirma em `Reiniciar na primeira missão`.
3. A plataforma reinicia a mesma startup, sem trocar seu identificador.
4. O painel é atualizado com a primeira missão disponível.

A conta, a senha e os campos-base da startup permanecem. Isso inclui nome, descrição, segmento, problema, público e objetivo inicial.

O modal explicita que serão removidos:

- progresso da jornada;
- missões e seus estados;
- entrevistas e outras evidências;
- aprendizados;
- eventos de atividade e XP derivados dos testes.

## Identificação do ambiente de teste

`Startup` receberá o campo booleano `is_test_workspace`, falso por padrão. Somente a startup fixa da conta de testes terá esse campo habilitado.

A conta será criada ou atualizada pelo comando administrativo idempotente
`bootstrap_test_workspace`. E-mail e senha serão fornecidos pelas variáveis
`TEST_WORKSPACE_EMAIL` e `TEST_WORKSPACE_PASSWORD`, com possibilidade de
sobrescrita por argumentos do comando. Credenciais não serão gravadas no
repositório nem exibidas na saída.

A conta poderá ser marcada como `is_staff` para autorizar o endpoint, mas não será `superuser` e não receberá permissões amplas de administração de dados.

O provisionamento não reinicia uma startup existente. Ele apenas garante que a conta e sua Startup de Teste existam; o reset continua sendo uma ação explícita da interface.

## Reset no servidor

O endpoint dedicado será
`POST /api/startups/<startup_id>/test-reset/`. Ele receberá
`{"confirmation": "RESET_TEST_WORKSPACE"}` e exigirá simultaneamente:

- sessão autenticada;
- usuário `is_staff`;
- propriedade da startup;
- `is_test_workspace=true`;
- confirmação explícita no corpo da requisição.

O reset será executado dentro de uma transação de banco. Ele removerá os dados derivados na ordem adequada e reconstruirá o estado inicial usando as funções de jornada e catálogo que já existem.

Ao final:

- problema e público permanecem como respostas da fundação;
- a jornada volta ao estado inicial calculado para esses dados-base;
- a missão de cinco entrevistas volta a ser a primeira missão disponível;
- evidências, aprendizados e eventos anteriores deixam de existir;
- XP e sequência voltam ao valor derivado apenas da fundação;
- a resposta devolve o payload atualizado do painel.

O reset não apaga nem recria o registro `Startup`, preservando o mesmo ID e os mesmos links.

## Interface e estado local

A faixa `Modo de teste` será renderizada somente quando o payload da Home
trouxer `testWorkspace.canReset=true`. Esse valor será calculado pelo backend
a partir da startup e do usuário autenticado. A interface não deduz permissão
pelo e-mail e não contém uma lista fixa de contas.

Depois do sucesso, o frontend:

- remove rascunhos locais vinculados ao ID da Startup de Teste, limitados às
  chaves `startup-quest:interview-draft:<startup_id>:` e
  `startup-quest:problem-refinement:<startup_id>`;
- reconcilia o workspace;
- fecha o modal;
- apresenta a primeira missão no mesmo painel;
- anuncia a confirmação em uma região live.

O modal exige uma segunda ação consciente. O botão destrutivo usa texto específico, não apenas `Confirmar`, e fica desabilitado durante a requisição.

## Erros e concorrência

- Uma falha dentro da transação desfaz todo o reset.
- Respostas `401`, `403` e `404` não revelam dados de outras contas.
- Duplo clique não dispara duas operações concorrentes.
- Em erro de rede ou servidor, o modal permanece aberto e oferece nova tentativa.
- A interface nunca apresenta o reset para uma startup normal, mas o servidor continua sendo a autoridade de segurança.

## Verificação

### Backend

- provisionamento cria a conta e a startup na primeira execução;
- provisionamento repetido é idempotente e não apaga progresso;
- credenciais não aparecem em código ou respostas;
- somente o proprietário autorizado consegue reiniciar a Startup de Teste;
- usuário comum, outro proprietário e startup normal são rejeitados;
- o reset preserva campos-base e o ID da startup;
- missões, evidências, aprendizados, eventos e estados da jornada voltam ao baseline;
- uma falha simulada comprova rollback atômico.

### Frontend

- a faixa aparece somente para o workspace autorizado pelo backend;
- o modal descreve os dados removidos e exige confirmação;
- a requisição não pode ser duplicada;
- erro preserva o modal e permite tentar novamente;
- sucesso limpa rascunhos locais e mostra a primeira missão;
- teclado, foco, `Escape` e anúncios acessíveis continuam funcionando.

### Integração

- conta provisionada consegue entrar no site publicado;
- a Startup de Teste pode completar missões e voltar ao início repetidamente;
- startups comuns da mesma base de dados não sofrem qualquer alteração.

## Fora de escopo

- reiniciar qualquer startup escolhida pelo usuário;
- selecionar checkpoints intermediários da jornada;
- criar várias startups de teste;
- expor o reset para contas comuns;
- armazenar senha de teste no GitHub;
- alterar o fluxo normal de cadastro e criação de startups.
