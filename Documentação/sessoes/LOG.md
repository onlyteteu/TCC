# Log de sessões

Histórico append-only das trocas de ferramenta. Nunca reescrever nem apagar entradas: só acrescentar
ao fim. Cada entrada tem no máximo cinco linhas. O detalhe completo da sessão mais recente fica em
`HANDOFF.md`; o detalhe das anteriores fica no histórico do git deste arquivo e do bastão.

Formato: `## AAAA-MM-DD — ferramenta — resumo em uma linha`, seguido de feito, próximo passo e estado.

## 2026-09-01 — Claude (aplicativo) — instalação do protocolo de contexto entre ferramentas

- feito: `AGENTS.md`, `CLAUDE.md`, `Documentação/sessoes/` com bastão, log e guia, e `scripts/estado.ps1`;
- próximo passo: rodar a suíte do frontend, resolver as alterações de teste pendentes e commitar;
- estado: estável, nada commitado, nenhuma validação executada.

## 2026-09-01 — Claude (aplicativo) — protocolo commitado e pendências do Codex resolvidas

- feito: commits `0a5662d` (protocolo) e `2ee150c` (fixtures com `sourceEvidences`); regra nova em
  `AGENTS.md` sobre onde as validações rodam;
- próximo passo: rodar `npm.cmd test` e `npx.cmd tsc --noEmit` no PowerShell e escolher a próxima frente;
- estado: estável, árvore limpa, validações pendentes.

## 2026-09-01 — Claude (aplicativo) — roteiro de validação do Incremento 1 aberto

- feito: `Documentação/validacao/2026-09-01-incremento-1.md` (`092d969`), com roteiro, tabelas de
  achados e de decisões derivadas;
- próximo passo: rodar as validações no PowerShell, subir o ambiente e executar a rodada 1;
- estado: estável, árvore limpa, nenhum achado preenchido.

## 2026-09-16 — Codex — sincronização do conteúdo atualizado com GitHub

- feito: reconstruído o bastão pelo Git; código já em `origin/main` no commit `857c4fc`; incluído relatório histórico de revisão visual e preparado envio documental autorizado;
- próximo passo: executar a rodada 1 de `Documentação/validacao/2026-09-01-incremento-1.md`;
- estado: nenhuma alteração de código; suítes não executadas; conferir o resultado do push pelo remoto.
