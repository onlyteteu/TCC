# Como usar o protocolo de contexto

Resumo operacional para o Matheus. A regra completa está em `AGENTS.md`, que as duas ferramentas leem.

## O ciclo

1. **Ao abrir qualquer ferramenta**, primeira mensagem: `abrir sessão`.
   A ferramenta lê `AGENTS.md`, o bastão em `Documentação/sessoes/HANDOFF.md`, o `LOG.md` e o estado
   do git, e devolve um resumo de onde o trabalho parou. Só depois disso peça o que quer.

2. **Durante o trabalho**, peça commits frequentes. Cada commit é um ponto de retorno; se um limite
   de uso acabar de repente, é o git que salva a sessão.

3. **Ao perceber que o limite está perto**, ou ao pausar: `fechar sessão`.
   A ferramenta roda as validações, reescreve o bastão, acrescenta a entrada no log, atualiza
   `decisoes.md`, `progresso.md` e `proximos-passos.md` se for o caso, e commita.

4. **Abra a outra ferramenta e volte ao passo 1.**

## Se o limite acabar sem aviso

Abra a outra ferramenta e diga: `abrir sessão, a anterior caiu sem fechar`. Ela reconstrói o estado
pelo `git log`, `git status` e `git diff`, escreve o bastão retroativamente e marca a entrada como
reconstruída.

## Comando de apoio

Na raiz do projeto, em PowerShell:

```powershell
.\scripts\estado.ps1
```

Imprime branch, últimos commits, arquivos alterados e o próximo passo registrado no bastão. Útil para
você conferir sozinho, e para colar em uma ferramenta que ainda não leu o repositório.

## Primeiro uso no Codex

O Codex lê `AGENTS.md` sozinho ao abrir o projeto. Se ele parecer ignorar o protocolo, escreva:
`leia AGENTS.md e Documentação/sessoes/HANDOFF.md antes de responder`.

## Primeiro uso no Claude

O Claude Code lê `CLAUDE.md`, que importa `AGENTS.md`. O Claude no aplicativo não lê nada
automaticamente: comece com `abrir sessão` e ele fará a leitura como primeira ação.

## O que nunca fazer

- retomar o trabalho sem `abrir sessão`, confiando na memória da conversa;
- encerrar uma sessão com trabalho relevante sem commitar;
- deixar campo do bastão vazio ou preenchido com generalidade;
- escrever no bastão que um teste passou sem ter rodado o comando.
