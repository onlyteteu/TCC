# Log de sessões

Histórico append-only das trocas de ferramenta. Nunca reescrever nem apagar entradas: só acrescentar
ao fim. Cada entrada tem no máximo cinco linhas. O detalhe completo da sessão mais recente fica em
`HANDOFF.md`; o detalhe das anteriores fica no histórico do git deste arquivo e do bastão.

Formato: `## AAAA-MM-DD — ferramenta — resumo em uma linha`, seguido de feito, próximo passo e estado.

## 2026-09-01 — Claude (aplicativo) — instalação do protocolo de contexto entre ferramentas

- feito: `AGENTS.md`, `CLAUDE.md`, `Documentação/sessoes/` com bastão, log e guia, e `scripts/estado.ps1`;
- próximo passo: rodar a suíte do frontend, resolver as alterações de teste pendentes e commitar;
- estado: estável, nada commitado, nenhuma validação executada.
