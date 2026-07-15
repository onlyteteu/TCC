# Scrollbars integradas a paleta da Startup Quest

## Objetivo

Substituir o aspecto claro e genérico das barras de rolagem visíveis por um acabamento coerente
com o workspace escuro da Startup Quest. A personalização deve reforçar a identidade sem disputar
atenção com missões, progresso e ações principais.

## Direção aprovada

A solução será discreta e baseada nos controles nativos do navegador:

- trilho em azul-marinho profundo, próximo ao fundo do workspace;
- polegar em cinza-azulado com contraste perceptível contra o trilho;
- polegar âmbar somente em `hover` e durante a interação;
- largura visual de aproximadamente `10px`;
- cantos arredondados e borda interna da mesma cor do trilho, criando respiro;
- botões de seta do scrollbar ocultos nos navegadores que permitem essa personalização;
- cursores e comportamento de rolagem permanecem nativos.

O âmbar continua reservado a ação e estado ativo. Por isso ele não ficará permanentemente aceso
na barra de rolagem.

## Alcance

A regra será global e alcançará todas as barras de rolagem visíveis do frontend, incluindo:

- conteúdo principal do workspace;
- listas e painéis internos da Home;
- Jornada;
- gerenciador de startups;
- menus, popovers e modais que precisem de rolagem;
- rolagem vertical ou horizontal da página quando existir.

Contêineres que escondem a barra de propósito para manter uma tela fixa continuarão sem scrollbar.
A mudança não altera alturas, `overflow`, `scrollbar-gutter` nem a estrutura responsiva atual.

## Implementação visual

As cores serão expostas como tokens semânticos globais para evitar valores diferentes entre telas.
O Firefox receberá `scrollbar-width` e `scrollbar-color`. Chrome e Edge receberão os equivalentes
`::-webkit-scrollbar`, incluindo trilho, polegar, estados interativos, canto e ocultação dos botões.

Não haverá JavaScript, biblioteca externa, animação ou substituição do mecanismo nativo. Sistemas
que não aceitam todos os seletores continuarão com uma barra funcional usando o suporte disponível.

## Acessibilidade e interação

- o polegar em repouso deve manter contraste de componente contra o trilho;
- `hover` e `active` devem ser distinguíveis sem alterar a geometria do conteúdo;
- a área não deve ficar estreita a ponto de dificultar o uso com mouse;
- teclado, roda do mouse, touchpad e arraste do polegar preservam o comportamento nativo;
- o estilo não depende de animação e não exige tratamento adicional para movimento reduzido.

## Critérios de aceite

1. Nenhuma barra visível apresenta o trilho branco mostrado no problema original.
2. Scrollbars externas e internas usam o mesmo vocabulário de cor e geometria.
3. O polegar permanece cinza-azulado em repouso e muda para âmbar no `hover` e no arraste.
4. A largura das barras não causa sobreposição, corte ou deslocamento relevante do conteúdo.
5. Chrome, Edge e Firefox mantêm rolagem funcional.
6. Telas propositalmente fixas não passam a exibir barras novas.
7. Testes, lint e build do frontend continuam aprovados.

