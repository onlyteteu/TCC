# Fichas de evidência no tema escuro

**Data:** 28 de julho de 2026
**Status:** aprovado para implementação

## Objetivo

Alinhar a coleção de fichas de evidência ao tema escuro da Home e do fluxo guiado de entrevistas,
corrigindo o baixo contraste do título e removendo o card branco que destoa da interface.

## Diagnóstico

O componente `InterviewEvidenceCollection` manteve a paleta clara anterior à migração do fluxo de
entrevistas para o tema escuro. Trata-se de uma implementação isolada que não acompanhou os tokens
visuais introduzidos no formulário e na prévia de entrevista.

## Desenho aprovado

- Manter a grade de duas colunas em desktop e uma coluna abaixo de `680px`.
- Usar divisória `#2b3d52`, superfície do card `#111927` e borda `#2b3d52`.
- Exibir **Fichas de Evidência** em `#f7efe3`, com o progresso em `#9aa8b8`.
- Manter **Coleção** como marcador contextual em `#f2a51a`.
- Destacar o número da ficha com fundo `#f2a51a` e texto escuro `#070b13`.
- Exibir nome em `#f7efe3`; perfil, contexto e data em tons secundários legíveis.
- Reutilizar nos chips a linguagem visual da prévia da entrevista: fundo azul-escuro e texto azul
  claro.
- Transformar a observação em um bloco interno com fundo e borda completos, sem faixa lateral.
- Preservar a hierarquia semântica atual, os dados exibidos e a formatação da data.

## Responsividade e conteúdo

Os cards continuam com a mesma altura dentro de cada linha da grade. Nomes, perfis, contexto e
observações longas devem quebrar naturalmente sem estourar o card. Em telas menores, a grade passa
para uma coluna e mantém a ordem cronológica das fichas.

## Verificação

- Executar os testes de `InterviewEvidenceCollection`.
- Executar a suíte frontend, lint e build.
- Verificar visualmente uma ficha real na Home em desktop e em largura menor que `680px`.
- Confirmar que título, progresso, data, chips e observação permanecem legíveis sobre o fundo
  escuro.

## Fora do escopo

- Alterar os dados coletados pela entrevista.
- Mudar a ordem ou permitir edição das fichas.
- Adicionar interações aos cards.
- Redesenhar o restante da Home.
