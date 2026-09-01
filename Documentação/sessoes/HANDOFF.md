# Bastão de sessão

Este arquivo é reescrito inteiro ao fim de toda sessão, por qualquer ferramenta. Ele responde a uma
única pergunta: **se eu abrir outra ferramenta agora, o que ela precisa saber para continuar sem
perder nada?** O histórico das versões anteriores fica em `LOG.md` e no git.

Formato obrigatório: manter todos os campos abaixo, na mesma ordem, sem deixar nenhum vazio.

---

## Cabeçalho

- ferramenta: Claude (aplicativo, ponte com o computador `cei-ufg`)
- data e hora: 2026-09-01, 15h20 (America/Sao_Paulo)
- tipo da entrada: normal
- estado ao encerrar: estável

## Objetivo da sessão

Criar o protocolo de contexto compartilhado entre Codex e Claude, para que a troca de ferramenta
quando um dos limites de uso acabar não custe contexto nem trabalho repetido.

## O que foi feito

- pesquisa dos padrões usados para rodar as duas ferramentas no mesmo repositório: `AGENTS.md` como
  fonte canônica, `CLAUDE.md` importando com `@AGENTS.md`, e handoff por artefato em arquivo;
- criação de `AGENTS.md` na raiz, com projeto, stack, comandos, mapa da documentação, protocolo de
  sessão e convenções;
- criação de `CLAUDE.md` na raiz, importando `AGENTS.md` e guardando apenas o que é específico do
  Claude e do Windows;
- criação de `Documentação/sessoes/` com este bastão, o `LOG.md` e o `COMO-USAR.md`;
- criação de `scripts/estado.ps1`, que imprime o estado factual do repositório para a abertura de sessão.

## Estado do repositório

- branch: `main`, 42 commits à frente de `origin/main` (não empurrados)
- último commit: `7974c6c docs: finalize workspace panel v2` (2026-09-01)
- alterações não commitadas, anteriores a esta sessão: `apps/frontend/src/components/home/mission-focus-panel.test.tsx`,
  `apps/frontend/src/components/home/startup-home-screen.test.tsx` e
  `apps/frontend/src/components/missions/problem-refinement-challenge.test.tsx`, somando 32 inserções
  e 3 remoções; `apps/frontend/next-env.d.ts` também aparece modificado
- não rastreado: `.impeccable/`
- arquivos criados por esta sessão, ainda não commitados: `AGENTS.md`, `CLAUDE.md`,
  `Documentação/sessoes/HANDOFF.md`, `Documentação/sessoes/LOG.md`,
  `Documentação/sessoes/COMO-USAR.md`, `scripts/estado.ps1`
- arquivos editados por esta sessão, ainda não commitados: `README.md` (seção sobre agentes de IA) e
  `Documentação/handoff.md` (nota distinguindo panorama do produto e bastão de sessão)

## Validações executadas nesta sessão

Nenhuma. Esta sessão não alterou código de aplicação, apenas documentação e um script auxiliar. A
suíte de testes não foi executada e nada sobre ela é alegado aqui.

## Onde parei exatamente

O protocolo está instalado e completo em arquivo, mas ainda não foi exercitado por uma sessão real
de trabalho, e nada foi commitado.

## Próximo passo

Executar, na raiz do projeto:

```powershell
git status --short
cd apps\frontend; npm.cmd test -- --maxWorkers=1
```

Descobrir o que são as alterações pendentes nos três arquivos de teste do frontend, que vieram de
antes desta sessão. Se a suíte passar, commitar em duas partes: primeiro o protocolo
(`chore(handoff): instala protocolo de contexto entre Codex e Claude`), depois as alterações de
teste com mensagem própria. Se a suíte falhar, registrar a falha no próximo bastão antes de mexer.

## Decisões tomadas

- o repositório é a memória do projeto; nenhuma ferramenta depende da própria conversa anterior;
- `AGENTS.md` é canônico e `CLAUDE.md` importa em vez de duplicar ou usar symlink, porque o ambiente
  é Windows;
- `Documentação/handoff.md` continua sendo o panorama do produto; este arquivo é o bastão de sessão.

Nada disso foi registrado ainda em `Documentação/decisoes.md`: falta abrir uma entrada `DEC` para o
protocolo, se o Matheus concordar com o formato.

## O que não funcionou ou deve ser evitado

Nada nesta sessão.

## Pendências para o Matheus

- confirmar se o formato do bastão atende ou se algum campo sobra ou falta;
- decidir se o protocolo vira uma entrada `DEC` em `Documentação/decisoes.md`;
- decidir se os 42 commits locais serão empurrados para `origin/main`.
