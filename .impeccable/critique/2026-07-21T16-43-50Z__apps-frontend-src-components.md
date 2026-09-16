---
target: apps/frontend/src/components
total_score: 20
p0_count: 0
p1_count: 3
timestamp: 2026-07-21T16-43-50Z
slug: apps-frontend-src-components
---
Method: dual-agent (A: /root/critique_design_a · B: /root/critique_evidence_b)

## Design Health Score

| # | Heurística | Nota | Principal problema |
|---|---|---:|---|
| 1 | Visibilidade do estado | 3 | Estados, skeletons e progresso são bons; a criação ainda anuncia alguns erros de forma inconsistente. |
| 2 | Correspondência com o mundo real | 2 | “Missão” e “evidência” funcionam; mínimos de caracteres e erros técnicos quebram a linguagem do fundador. |
| 3 | Controle e liberdade | 2 | Há voltar, cancelar e retry; faltam autosave, rascunho, undo e controle sobre celebrações automáticas. |
| 4 | Consistência e padrões | 2 | O workspace é coeso, mas criação e área interna parecem produtos diferentes; a execução muda de lugar conforme a missão. |
| 5 | Prevenção de erros | 2 | Required e bloqueios ajudam; não há prevenção contextual de respostas fracas nem recuperação de rascunho. |
| 6 | Reconhecimento em vez de lembrança | 2 | A próxima ação fica visível, mas a síntese exige lembrar entrevistas que não aparecem ao lado da tarefa. |
| 7 | Flexibilidade e eficiência | 1 | Fluxos rígidos, sem atalhos, modelos, ações rápidas ou progressão adequada a usuários mais experientes. |
| 8 | Estética e minimalismo | 2 | A hierarquia principal é clara, porém métricas duplicadas, módulos futuros e painéis aninhados aumentam o ruído. |
| 9 | Recuperação de erros | 2 | Há erros inline e retry; a criação pode esconder o campo com problema e expõe detalhes como “backend Django”. |
| 10 | Ajuda e documentação | 2 | Existem dicas e critérios, mas falta coaching exatamente no momento de produzir a entrega. |
| **Total** |  | **20/40** | **Aceitável, com melhorias significativas necessárias** |

## Veredito de anti-padrões

**Avaliação de design:** há intenção forte em estados, progressão real, linguagem e acessibilidade. Ainda assim, o produto alterna entre dois clichês: um “dashboard dark premium” com painéis, barras e XP no workspace e um “ritual sci-fi” ornamental na criação. A mudança de registro é grande: a criação parece uma cerimônia de outro produto; depois, a experiência se torna um gerenciador corporativo com uma camada de XP.

O problema mais importante não é apenas visual. O trabalho empreendedor ainda é frequentemente reduzido a campos vazios, contagem mínima de caracteres e “Salvar e concluir missão”. A interface chama isso de evidência, mas ensina pouco sobre como produzir uma boa evidência.

**Scan determinístico:** 3 avisos de uma mesma regra (`layout-transition`):

- `apps/frontend/src/components/auth-screen.module.css:338` — `transition: margin-top`;
- `apps/frontend/src/components/journey/startup-journey-screen.module.css:261` — `transition: width`;
- `apps/frontend/src/components/startup-creation-screen.module.css:484` — `transition: width`.

Não são falsos positivos literais, mas as duas animações de largura são barras de progresso pequenas e contidas. A Jornada já as desativa em `prefers-reduced-motion`; a criação não cobre seu `progressFill`. O detector ainda subconta algumas transições multilinha existentes na autenticação.

**Overlays visuais:** não há overlay confiável visível ao usuário. O controle do Browser não estava disponível para os avaliadores; como fallback, foi confirmado HTTP 200 no frontend, proteção de sessão nas rotas internas e feita inspeção estrutural do código, estilos, documentação e mockups existentes.

## Impressão geral

A base está mais madura do que o incômodo sugere: a próxima ação é clara, a progressão é honesta e a Jornada organiza bem os capítulos. Mas a experiência ainda faz o fundador se sentir como alguém preenchendo um sistema, não como alguém ficando melhor em tomar decisões. A maior oportunidade é transformar o núcleo de “ler → escrever → enviar” em “observar → decidir → receber feedback → ver consequência”.

## O que está funcionando

1. **A próxima ação domina a Home.** Isso responde bem a “o que faço agora?” e liga progresso a trabalho real.
2. **A Jornada possui papéis claros.** Quatro capítulos, duas etapas por capítulo e separação entre consulta estratégica e execução reduzem o mapa mental.
3. **A base de acessibilidade é acima da média.** Skip link, foco visível, headings, listas, progressbars, live regions, skeletons e redução de movimento mostram cuidado real.

## Problemas prioritários

### [P1] A aprendizagem termina quando começa a execução difícil

**Por que importa:** o iniciante recebe textareas como “Problema refinado” e “Evidências que sustentam o problema”, com 30–40 caracteres como guardrail. Isso mede texto suficiente, não raciocínio melhor. O modal de entrevista coloca cinco campos simultâneos antes da ação.

**Correção:** adotar coaching progressivo: exemplo fraco/forte, uma decisão por vez, perguntas-guia, evidências consultáveis ao lado, feedback imediato e prévia do artefato que entrará na memória da startup.

**Comando sugerido:** `$impeccable onboard`

### [P1] Gamificação ainda é uma camada numérica sobre formulários

**Por que importa:** XP, nível, streak, percentual e bloqueios informam estado, mas não criam uma experiência de jogo nem deixam claro o ganho de competência. O fundador vê “+100 XP”, porém não necessariamente entende o que passou a fazer melhor.

**Correção:** fazer da aprendizagem o jogo: microdesafios, escolhas com consequência, tentativa segura, feedback explicativo, capacidades visíveis e transformação do mapa/artefato. Celebrar “você transformou cinco relatos em um problema observável”, não apenas o XP.

**Comando sugerido:** `$impeccable delight`

### [P1] A arquitetura antecipa um ERP

**Por que importa:** a sidebar mostra oito destinos, cinco deles “Em breve”. Para um iniciante, isso antecipa departamentos e obrigações antes de ele dominar a primeira ação, aumentando ansiedade e o tom corporativo.

**Correção:** manter apenas Home, Jornada e Missões na navegação principal. Capacidades futuras devem surgir contextualmente quando passam a resolver uma necessidade real, como desbloqueios, não como módulos vazios.

**Comando sugerido:** `$impeccable distill`

### [P2] Promessas e contexto quebram a confiança

**Por que importa:** a Home diz “Bom dia” e mantém o mesmo foco independentemente de horário/estado; a criação promete “Gerar meu primeiro mapa” e abre a Home; mensagens de erro citam o backend Django. Pequenas contradições fazem a experiência parecer roteirizada, não viva.

**Correção:** derivar saudação e foco do estado real, alinhar o destino à promessa e reescrever erros na linguagem e nas opções de recuperação do fundador.

**Comando sugerido:** `$impeccable clarify`

### [P2] Continuidade, mobile e acessibilidade ainda têm lacunas

**Por que importa:** não há rascunho/autosave; a sidebar fixa comprime o conteúdo em telas menores; algumas seleções não expõem estado programaticamente; erros podem aparecer fora da etapa visível; a criação não desativa toda animação de progresso sob redução de movimento.

**Correção:** autosave e restauração, navegação compacta real no mobile, radiogroup/`aria-pressed`, foco e anúncio de erro, e cobertura completa de `prefers-reduced-motion`.

**Comando sugerido:** `$impeccable harden`

## Red flags por persona

**Jordan — primeiro contato:** vê oito módulos e pode acreditar que precisa dominar tudo. Recebe “mínimo de 40 caracteres” quando precisa de um exemplo bom. Entrevistas acontecem na Home, outras entregas no detalhe, exigindo aprender a arquitetura antes de aprender empreendedorismo.

**Sam — teclado, leitor de tela ou baixa visão:** a base semântica é boa, mas a seleção de território não anuncia de forma robusta qual opção está ativa; erros da criação podem não ser associados ao campo; a shell fixa se degrada com zoom ou viewport reduzido.

**Casey — celular, interrupções e pouca atenção:** sidebar não colapsa estruturalmente, formulários não preservam rascunho, o CTA do detalhe vem após muita orientação e a celebração automática não pode ser pulada.

## Observações menores

- Streak e nível aparecem na topbar e novamente na Home.
- A Central repete a missão recomendada na trilha completa.
- “Home” no menu e “trabalho de hoje” no conteúdo competem por nomenclatura.
- Criação e workspace usam registros visuais e tipográficos diferentes.
- Grade, órbitas, auras e estrelas dão atmosfera, mas não representam nenhum aprendizado ou artefato.
- Estados vazios e de erro geralmente são honestos e oferecem retry; isso deve ser preservado.

## Questões a considerar

- Se XP e streak desaparecessem, o fundador ainda sentiria que ficou mais competente?
- O que “40 caracteres” sabe sobre a qualidade de uma evidência?
- A entrevista deveria parecer um formulário de registro ou um roteiro que ensina a ouvir?
- Qual artefato concreto o usuário deveria admirar ao final de cada missão?
