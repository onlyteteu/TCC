# Botão de conclusão de missão no ambiente de teste

**Data:** 28 de julho de 2026
**Status:** aprovado para implementação

## Objetivo

Permitir que a conta autorizada do ambiente de teste avance rapidamente pelo fluxo da Startup
Quest sem precisar produzir as evidências exigidas de um usuário normal. O controle deve concluir a
missão atual e atualizar imediatamente a Home com o novo estado do workspace.

## Escopo

- Exibir o botão **Concluir missão atual** no banner **Modo de teste**, ao lado de
  **Reiniciar ambiente**.
- Mostrar o botão somente quando o backend já tiver identificado que o usuário pode administrar o
  ambiente de teste.
- Concluir a missão recomendada atual por um endpoint exclusivo do ambiente de teste.
- Atualizar a Home, o progresso, o XP e a próxima missão usando a resposta atualizada do backend.
- Manter inalteradas as regras normais de conclusão por evidências e entregáveis.

## Interface e interação

O botão ficará no grupo de ações do banner do ambiente de teste. Ao ser acionado:

1. o texto muda para **Concluindo missão...**;
2. o botão fica desabilitado e cliques adicionais não disparam novas requisições;
3. o controle de reinicialização também fica indisponível durante a conclusão;
4. em caso de sucesso, a Home substitui seu payload pelo estado devolvido pelo backend;
5. em caso de falha, o banner exibe uma mensagem acessível e permite nova tentativa.

O botão não exige confirmação porque a ação é incremental e recuperável pelo controle
**Reiniciar ambiente**. A reinicialização continua exigindo sua confirmação destrutiva própria.

## API e regras de autorização

O frontend chamará uma rota Next.js que encaminha um `POST` autenticado para
`/api/startups/<startup_id>/test-complete-mission/`.

O backend deve:

- rejeitar sessões ausentes ou inválidas;
- ocultar startups pertencentes a outro usuário;
- permitir a ação somente para proprietário `is_staff` de uma startup com
  `is_test_workspace=true`;
- selecionar a missão recomendada atual;
- rejeitar a operação quando não houver missão disponível ou quando ela estiver bloqueada;
- concluir a missão sem avaliar evidências somente dentro desse endpoint;
- reutilizar o registro normal de conclusão, atividade, XP e reconciliação das missões seguintes;
- devolver o payload atualizado da Home com uma mensagem de sucesso.

A exceção às evidências não será exposta como parâmetro do endpoint normal. Assim, usuários e
startups comuns não conseguem acionar o atalho.

## Estado e consistência

A conclusão ocorrerá em transação e bloqueará o registro da missão durante a alteração. O serviço
será idempotente para uma missão que já esteja concluída, sem conceder XP ou criar atividade em
duplicidade. A seleção da próxima missão acontecerá após a reconciliação do catálogo.

## Tratamento de erros

- `401`: sessão inválida ou expirada;
- `403`: usuário ou startup sem permissão para usar o atalho;
- `404`: startup inexistente ou pertencente a outro usuário;
- `409`: nenhuma missão disponível ou missão bloqueada;
- falha de rede ou resposta inesperada: mensagem no banner sem descartar o estado atual da Home.

O frontend deverá liberar os controles depois de qualquer erro para permitir nova tentativa.

## Testes

### Backend

- exige autenticação;
- não revela a startup de outro proprietário;
- rejeita usuário comum e startup que não seja de teste;
- conclui a missão atual mesmo sem evidências;
- registra progresso apenas uma vez;
- libera e devolve a próxima missão;
- responde adequadamente quando não há missão disponível.

### Frontend

- renderiza o botão somente quando recebe a ação de conclusão;
- envia uma única requisição durante cliques repetidos;
- apresenta o estado pendente e desabilita ações conflitantes;
- atualiza a Home com o payload de sucesso;
- apresenta erro no banner e permite tentar novamente.

## Fora do escopo

- alterar a conclusão de missões de usuários normais;
- permitir escolher uma missão arbitrária;
- desfazer somente a última missão;
- adicionar o controle fora do banner **Modo de teste**;
- mudar os critérios de evidência, aprendizado ou entregáveis.
