# Sistema visual do Startup Quest

Este documento é a referência vigente para o workspace autenticado. Ele registra a linguagem
visual implementada no `Painel 2.0` e deve orientar novas telas antes da criação de estilos locais.

## Princípio do produto

O Startup Quest é uma ferramenta de trabalho guiado para fundadores. A interface deve ser
motivadora e ter identidade própria, mas continuar séria, legível e baseada em progresso real.
A missão recomendada é sempre a decisão principal; gamificação informa continuidade e recompensa,
sem competir com o trabalho da startup.

## Hierarquia do workspace

- Sidebar: somente `Home`, `Jornada` e `Missões` enquanto os demais módulos não existirem.
- Topbar: startup ativa, sequência e nível/XP da conta em formato compacto.
- Home: missão principal primeiro, progresso da startup ao lado e atividade recente abaixo.
- Jornada: explica a evolução e preserva a memória estratégica.
- Missões: apresenta a prioridade, a execução e os bloqueios reais.
- Não repetir nível, XP ou sequência em cards de progresso local da startup.

## Tokens semânticos

Os tokens canônicos vivem em
`apps/frontend/src/components/workspace/workspace-shell.module.css`.

| Papel | Token | Valor atual |
| --- | --- | --- |
| Fundo do workspace | `--sq-bg` | `#070b13` |
| Fundo da sidebar | `--sq-sidebar` | `#060a12` |
| Superfície principal | `--sq-surface` | `#0b111c` |
| Superfície elevada | `--sq-surface-raised` | `#111927` |
| Superfície interativa | `--sq-surface-interactive` | `#152033` |
| Borda | `--sq-border` | `#203145` |
| Borda forte | `--sq-border-strong` | `#2b3d52` |
| Texto principal | `--sq-text` | `#f7efe3` |
| Texto secundário | `--sq-text-soft` | `#bac5d1` |
| Texto discreto | `--sq-text-muted` | `#9aa8b8` |
| Texto desabilitado | `--sq-text-subtle` | `#7f8da0` |
| Ação e foco | `--sq-accent` | `#f2a51a` |
| Ação em hover | `--sq-accent-hover` | `#ffb630` |
| Sucesso | `--sq-success` | `#bfe8ce` |
| Fundo de sucesso | `--sq-success-bg` | `#10241b` |
| Borda de sucesso | `--sq-success-border` | `#2f6550` |
| Erro | `--sq-danger` | `#ffaaaa` |

Novos componentes devem consumir os tokens pelo papel semântico. Cores específicas de capítulos,
gráficos ou estados especializados podem permanecer locais quando carregarem significado próprio.

## Tipografia

- Títulos: Manrope, com `--font-heading` e fallback `Segoe UI`.
- Texto de interface: IBM Plex Sans, com `--font-body` e fallback `Segoe UI`.
- Elementos compactos de produto podem usar Inter por `--font-product`.
- Títulos de página: entre `1.9rem` e `2.3rem`, com escala fixa e quebra balanceada.
- Títulos de seção: entre `1rem` e `1.4rem`.
- Corpo: `0.86rem` a `1rem`, linha entre `1.45` e `1.6`.
- Rótulos: no mínimo `0.72rem`, usados com peso alto e nunca como único sinal de estado.

## Espaçamento, bordas e movimento

- Escala base: 4, 8, 12, 16, 24 e 32 pixels (`--sq-space-*`).
- Raios de cards: 8, 12 ou 16 pixels; não exceder 16 pixels em superfícies principais.
- Cards usam borda ou contraste de superfície. Evitar sombra larga somada a borda.
- Ações primárias usam âmbar preenchido; ações secundárias usam superfície escura e borda forte.
- Todo controle precisa de `:focus-visible` com `--sq-focus-ring` e deslocamento perceptível.
- Transições de interação duram entre 150 e 250 ms e não animam largura, altura ou margens.
- Respeitar `prefers-reduced-motion` e não criar coreografia de entrada para páginas de produto.

## Estados e acessibilidade

- Carregamento: skeleton com `role="status"`, `aria-busy` e descrição acessível.
- Progresso: elemento com `role="progressbar"` e valores mínimo, máximo e atual.
- Bloqueio: texto explica o pré-requisito; cor e ícone são apoio, nunca a única informação.
- Erro: mensagem acionável e tentativa novamente quando a operação puder ser repetida.
- Sucesso: confirmação persistente o suficiente para ser percebida, sem depender de animação.
- Conteúdo desktop: apenas a região principal rola; sidebar e topbar permanecem estáveis.

## Viewports de aceite

Cada mudança relevante no workspace deve ser verificada em `1280 x 720`, `1366 x 768`,
`1536 x 864` e `1920 x 900`. Conferir ausência de overflow horizontal, foco visível, CTA principal
perceptível na primeira dobra e menus sem recorte. Em larguras menores, preservar reflow e acesso
ao conteúdo mesmo que o foco atual do TCC continue sendo desktop.

## Restrições visuais

- Não usar texto com gradiente, glassmorphism como superfície padrão ou brilho decorativo excessivo.
- Não criar cards dentro de cards quando agrupamento por espaço e divisores resolver o problema.
- Não mostrar módulos futuros desabilitados apenas para preencher a navegação.
- Não usar cores da gamificação em textos longos de leitura.
- Não criar testes que leem o arquivo CSS procurando valores literais; testar comportamento,
  semântica e resultado renderizado.
