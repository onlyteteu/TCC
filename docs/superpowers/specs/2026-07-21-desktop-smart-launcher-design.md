# Botão inteligente do Startup Quest na Área de Trabalho

## Objetivo

Manter um único `LIGAR-TUDO.cmd` visível na Área de Trabalho. Um duplo clique deve iniciar Docker, PostgreSQL, backend Django, frontend Next.js na porta `3001` e abrir o navegador, preservando o contrato já validado do `start.ps1`.

Durante a avaliação de uma branch em worktree, o mesmo botão deve abrir essa versão de teste. Quando a branch deixar de existir ou já estiver incorporada à `main` local, o botão deve voltar a usar automaticamente o checkout principal.

## Abordagens consideradas

### 1. Botão sempre ligado à `main`

É a alternativa mais simples, mas não permite visualizar um PR antes do merge. Foi descartada porque não atende ao uso atual de prototipação.

### 2. Duplicar toda a lógica no botão da Área de Trabalho

Permitiria escolher qualquer pasta, mas criaria dois launchers com comportamentos que poderiam divergir. Foi descartada para manter `start.ps1` como contrato único do projeto.

### 3. Botão inteligente com delegação ao launcher do projeto

É a abordagem escolhida. O botão apenas resolve qual checkout deve ser usado e delega toda a inicialização ao `start.ps1` dessa pasta. Assim, portas, proxy, Docker e verificações continuam centralizados no repositório.

## Arquitetura

O fluxo terá duas peças:

1. `start.ps1` continuará sendo o launcher real do Startup Quest. Ele ganhará apenas uma resolução segura do Python: primeiro procura a `.venv` no checkout atual e, quando estiver em um worktree, reutiliza a `.venv` do checkout principal.
2. `LIGAR-TUDO.cmd`, criado diretamente na Área de Trabalho e não versionado, conhece o caminho estável do projeto principal e o worktree de teste atual. Ele escolhe o worktree somente enquanto essa branch ainda não estiver contida na `main` local; caso contrário, usa o projeto principal.

O botão da Área de Trabalho não copia dependências, não duplica o repositório e não contém a lógica de inicialização dos serviços.

## Fluxo de execução

1. O usuário dá duplo clique em `LIGAR-TUDO.cmd` na Área de Trabalho.
2. O botão verifica se o worktree de teste existe e se seu `HEAD` ainda não foi incorporado à `main` local.
3. Se o teste estiver ativo, chama o `start.ps1` do worktree; caso contrário, chama o `start.ps1` do checkout principal.
4. O `start.ps1` localiza o Python disponível, inicia ou reaproveita PostgreSQL, Django e Next.js, e abre `http://127.0.0.1:3001`.
5. Se alguma porta pertencer a outro programa, o launcher preserva o processo desconhecido e mostra uma mensagem clara.

## Tratamento de erros

- Se o projeto principal não existir, o botão informa o caminho ausente e não tenta iniciar nada.
- Se a branch de teste tiver sido removida, o botão usa a `main` sem exigir manutenção manual.
- Se a `.venv` não existir nem no worktree nem no checkout principal, `start.ps1` encerra com orientação para instalar as dependências.
- O launcher mantém as proteções existentes de propriedade das portas `8000` e `3001`.
- O botão permanece aberto ao final para que mensagens de erro possam ser lidas.

## Verificação

- Estender `scripts/test-startup-launcher.ps1` antes da implementação para exigir a resolução da `.venv` do checkout principal.
- Executar o teste de contrato do PowerShell e o teste `launcher-contract.test.ts` do frontend.
- Validar o botão local com resolução somente: primeiro selecionando o worktree ativo e depois simulando a ausência dele para confirmar o fallback à `main`.
- Executar o launcher real uma vez e confirmar respostas HTTP do frontend em `3001`, backend em `8000` e proxy `/api`.

## Fora de escopo

- Instalar Docker, Node, Python ou dependências automaticamente.
- Encerrar processos desconhecidos que estejam usando as portas do projeto.
- Enviar o arquivo local da Área de Trabalho ao GitHub.
- Fazer merge automático do PR.
