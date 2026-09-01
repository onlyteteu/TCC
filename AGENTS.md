# AGENTS.md — Startup Quest (TCC)

Fonte única de contexto para qualquer agente de IA que trabalhe neste repositório: Codex, Claude
Code, Claude no aplicativo, Cursor ou outro. `CLAUDE.md` apenas importa este arquivo.

Regra que sustenta todas as outras: **a memória do projeto é o repositório, não a conversa**.
Nenhuma ferramenta lembra da sessão anterior nem das sessões da outra ferramenta. Tudo que precisa
sobreviver à troca de ferramenta tem que estar escrito em arquivo e commitado.

## Projeto

- produto: Startup Quest, plataforma guiada e gamificada para empreendedores iniciantes;
- natureza: TCC de Gestão da Informação da UFG, então o código precisa ser academicamente defensável;
- repositório: `onlyteteu/TCC`, branch principal `main`;
- diretório local: `C:\Users\mateu\OneDrive\Área de Trabalho\TCC`;
- fase atual: desenvolvimento do sistema. A escrita da monografia vem depois e será alimentada pelo
  que estiver registrado em `Documentação`.

## Stack e comandos

- frontend: Next.js 16.2, React 19, TypeScript, em `apps/frontend`;
- backend: Django 5.2, Python 3.12+, em `apps/backend`;
- banco: PostgreSQL 17 via `docker-compose.yml`;
- ambiente local (Windows, PowerShell): `.\LIGAR-TUDO.cmd` na raiz sobe tudo e abre `http://127.0.0.1:3000`.

Validações padrão antes de encerrar qualquer sessão que tenha mexido em código:

```powershell
cd apps\backend;  python manage.py makemigrations --check --dry-run
cd apps\backend;  python manage.py check
cd apps\backend;  python manage.py test accounts startups
cd apps\frontend; npm.cmd test -- --maxWorkers=1
cd apps\frontend; npx.cmd tsc --noEmit --pretty false
cd apps\frontend; npm.cmd run lint
```

Nunca afirmar que um teste passou sem ter executado o comando na sessão.

As validações rodam no Windows, em PowerShell, na máquina do Matheus. Quando a sessão é o Claude no
aplicativo, o acesso aos arquivos passa por uma ponte e o sistema de arquivos fica lento demais para
essas suítes: um `tsc --noEmit` passou de dez minutos sem terminar, e `npm test` depende de binários
instalados para Windows. Nesse caso, pedir ao Matheus que rode o comando no PowerShell e cole a
saída, e registrar no bastão que a validação ficou pendente.

## Mapa da documentação

Antes de propor qualquer coisa, ler o que já foi decidido. Ordem de leitura por objetivo:

| Preciso de | Arquivo |
| --- | --- |
| onde a sessão anterior parou | `Documentação/sessoes/HANDOFF.md` |
| histórico das trocas de ferramenta | `Documentação/sessoes/LOG.md` |
| o que já foi decidido e por quê | `Documentação/decisoes.md` |
| o que está pronto e o que não está | `Documentação/progresso.md` |
| o que vem depois e o que é fora de escopo | `Documentação/proximos-passos.md` |
| panorama funcional do produto | `Documentação/handoff.md` |
| arquitetura | `Documentação/arquitetura.md` e `arquitetura-missoes.md` |
| telas, fluxos e design | `Documentação/telas.md`, `fluxos.md`, `design/` |
| especificação da plataforma | `Documentação/especificacao-plataforma.md` |

Distinção importante entre dois arquivos de nome parecido:

- `Documentação/handoff.md` é o **panorama do produto**: o que a Startup Quest é hoje. Muda por
  incremento;
- `Documentação/sessoes/HANDOFF.md` é o **bastão de sessão**: onde a última sessão parou. Muda a
  cada troca de ferramenta.

## Protocolo de contexto entre ferramentas

O trabalho alterna entre Codex e Claude, normalmente porque o limite de uso de um deles acabou. A
troca não pode custar contexto. Três rituais obrigatórios.

### 1. Abertura de sessão

Ao iniciar qualquer sessão neste repositório, antes de responder ou escrever qualquer código:

1. ler `Documentação/sessoes/HANDOFF.md` inteiro;
2. ler as duas últimas entradas de `Documentação/sessoes/LOG.md`;
3. executar `git log -5 --oneline` e `git status --short` e comparar com o que o bastão afirma;
4. se houver divergência entre o bastão e o repositório, o repositório vence — e isso deve ser
   apontado ao Matheus;
5. resumir em até dez linhas: onde paramos, qual é o próximo passo e o que está pendente. Só então
   começar a trabalhar.

O Matheus pode disparar isso explicitamente com a frase **`abrir sessão`**.

### 2. Durante a sessão

- decisão de escopo, arquitetura ou produto vira entrada em `Documentação/decisoes.md` no mesmo
  ciclo, com identificador `DEC-NNN` sequencial (DEC-001 é obrigação documental, ver o arquivo);
- entrega concluída vira entrada datada em `Documentação/progresso.md`;
- mudança de rota do projeto vira atualização de `Documentação/proximos-passos.md`;
- commits pequenos e frequentes, em português no corpo e com prefixo convencional no título
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`);
- tentativa que falhou também é contexto: registrar no bastão o que não funcionou, para a outra
  ferramenta não repetir o erro.

### 3. Encerramento de sessão

Disparado pela frase **`fechar sessão`**, e obrigatório sempre que o limite de uso estiver perto ou
o trabalho for pausar. Nesta ordem:

1. rodar as validações que fizerem sentido para o que foi mexido;
2. reescrever `Documentação/sessoes/HANDOFF.md` inteiro, no formato definido no próprio arquivo,
   sem deixar campo vazio (usar `nenhuma` ou `não se aplica` quando for o caso);
3. acrescentar a mesma entrada, em versão curta, ao fim de `Documentação/sessoes/LOG.md`, que é
   append-only e nunca é reescrito;
4. atualizar `decisoes.md`, `progresso.md` e `proximos-passos.md` se algo mudou;
5. commitar tudo: `git add -A && git commit -m "chore(handoff): <ferramenta> — <resumo>"`.

Regras de escrita do bastão:

- escrever para alguém que não viu nada desta sessão, porque é exatamente esse o caso;
- ser específico: caminho de arquivo, nome de função, comando exato, mensagem de erro literal;
- o campo `Próximo passo` precisa ser executável sem interpretação, uma ação concreta e única;
- não elogiar o próprio trabalho, não resumir por adjetivo, não alegar teste não executado;
- se a sessão terminou no meio de algo quebrado, dizer isso na primeira linha.

### Se o limite acabar sem aviso

O bastão fica desatualizado. A sessão seguinte reconstrói o estado por `git log`, `git status` e
`git diff`, escreve o bastão retroativamente com o que conseguir apurar, marca a entrada como
`reconstruída` e pergunta ao Matheus o que faltar. Por isso os commits precisam ser frequentes: o
histórico do git é a rede de segurança do protocolo.

## Convenções do repositório

- idioma de documentação, commits e interface: português do Brasil;
- documentação sem emoji e sem linguagem promocional;
- código, identificadores e nomes de arquivo em inglês, seguindo o padrão já existente;
- não expandir escopo para CRM, financeiro ou operação empresarial completa;
- não conceder XP por login, abertura de tela ou clique sem trabalho real;
- itens sem dados, regras, estados vazios e testes não entram na navegação;
- alterações de interface precisam ser validadas nos viewports `1280x720`, `1366x768`, `1536x864` e
  `1920x900`;
- os cuidados completos de escopo estão em `Documentação/proximos-passos.md` e valem como restrição.
