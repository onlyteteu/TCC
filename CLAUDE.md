# CLAUDE.md

@AGENTS.md

O conteúdo canônico está em `AGENTS.md`, importado acima e compartilhado com o Codex. Este arquivo
guarda apenas o que é específico do Claude. Não duplicar contexto aqui: o que valer para as duas
ferramentas vai para `AGENTS.md`.

## Específico do Claude

- o protocolo de abertura e encerramento de sessão descrito em `AGENTS.md` é obrigatório também no
  Claude no aplicativo (Cowork), que não lê este arquivo automaticamente — nesse caso, ler
  `AGENTS.md` e `Documentação/sessoes/HANDOFF.md` como primeira ação da sessão;
- o ambiente é Windows: usar `npm.cmd`, `npx.cmd` e PowerShell, e nunca criar symlink (por isso
  `CLAUDE.md` importa `AGENTS.md` em vez de ser um link para ele);
- ao trabalhar pelo Claude no aplicativo, o acesso aos arquivos é por ponte com o computador
  `cei-ufg`: trabalhar direto na pasta do projeto, sem copiar arquivos para fora dela;
- antes de encerrar, executar o ritual `fechar sessão` de `AGENTS.md` sem pular o commit.
