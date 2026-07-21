# Missão de entrevistas guiada

## Objetivo

Substituir o formulário único de entrevista por um fluxo curto e interativo. O Startup Quest ensina o que fazer antes da primeira conversa e, depois, ajuda o fundador a transformar o que ouviu em uma Ficha de Evidência com pouca digitação.

O fluxo continua registrando cinco entrevistas reais. Ele não simula clientes nem inventa evidências.

## Experiência aprovada

### 1. Guia de bolso

Antes da primeira entrevista, o usuário vê um guia curto, sem aula ou questionário:

- objetivo: compreender uma situação passada, sem vender a solução;
- cinco perguntas prontas para usar;
- exemplos do que evitar, como “você usaria meu aplicativo?”;
- lembrete para buscar frequência, consequência e alternativa atual.

Depois da primeira entrevista, o guia deixa de ser obrigatório e permanece disponível pelo botão `Consultar roteiro`.

### 2. Registro pós-conversa

O registro acontece em quatro rodadas:

1. **Pessoa:** identificação, perfil opcional e data já preenchida.
2. **Situação:** uma frase curta sobre o momento real relatado.
3. **Sinais:** escolhas visuais para frequência do problema e alternativa usada atualmente.
4. **Descoberta:** uma frase ou observação marcante e a prévia da Ficha de Evidência.

O usuário não encontra um textarea grande. A escrita fica limitada à situação real e ao principal sinal observado.

### 3. Coleção de evidências

Depois de salvar, a ficha entra em uma coleção visual com progresso `1 de 5`, `2 de 5` e assim por diante. A recompensa destaca primeiro a capacidade praticada — ouvir sem induzir e reconhecer sinais — e depois o XP.

As entrevistas já registradas continuam válidas e aparecem na coleção mesmo sem os novos campos estruturados.

## Dados

O endpoint atual de evidências será preservado. Os campos existentes continuam alimentados:

- `intervieweeName`: identificação;
- `intervieweeProfile`: perfil;
- `occurredOn`: data;
- `context`: situação real;
- `notes`: principal sinal ou frase marcante.

Frequência e alternativa atual serão armazenadas em `MissionEvidence.details`, que já é um campo JSON. Não será necessária migração de banco.

## Continuidade e erros

- O rascunho será salvo localmente por startup e por número da entrevista.
- Ao salvar com sucesso, o rascunho daquela entrevista será removido.
- Se o navegador bloquear armazenamento local, o registro continua funcionando sem autosave.
- Um erro do servidor mantém as respostas e oferece nova tentativa.
- Se a missão já estiver concluída, as fichas permanecem somente para consulta.

## Acessibilidade

- Cada rodada recebe foco ao avançar ou voltar.
- Cartões usam botões com `aria-pressed`.
- Progresso, erros e confirmação são anunciados por regiões live.
- Animações respeitam `prefers-reduced-motion`.

## Verificação

- Testes do modelo determinístico da ficha.
- Testes do guia obrigatório somente na primeira entrevista.
- Testes das quatro rodadas, autosave, restauração e falha de storage.
- Teste de compatibilidade com entrevistas antigas.
- Teste de integração do payload atual e dos novos detalhes.
- Suítes frontend e backend, lint e build.

## Fora de escopo

- Gravação ou transcrição de áudio.
- Entrevista conduzida dentro do Startup Quest.
- Redesenho da síntese final de aprendizados.
- Nova aba para consultar todos os artefatos da startup.
