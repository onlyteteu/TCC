# Guided Interview Mission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o formulário monótono da missão de entrevistas por um guia de bolso curto e um registro guiado em quatro rodadas, com pouca digitação, autosave e uma coleção visual de Fichas de Evidência.

**Architecture:** Manter o endpoint e o modelo de dados atuais, adicionando os sinais estruturados ao `MissionEvidence.details`. Extrair do `StartupHomeScreen` um modelo determinístico, um componente de fluxo e um componente de coleção. O modal, a autenticação e a reconciliação do workspace continuam sob responsabilidade da Home; o novo fluxo controla etapas, rascunho local, validação e confirmação.

**Tech Stack:** Django 5, Django TestCase, Next.js 16, React 19, TypeScript strict, CSS Modules, Vitest e Testing Library.

## Global Constraints

- Não criar migração: `MissionEvidence.details` já é um `JSONField`.
- Não quebrar clientes ou registros antigos: os novos campos são opcionais no endpoint e obrigatórios apenas no novo fluxo visual.
- Não alterar o fluxo de aprendizado, a conclusão da missão ou as missões estruturadas.
- Não adicionar gravação, transcrição, simulação de entrevista ou nova aba de artefatos.
- Preservar o modal acessível existente: foco preso no diálogo, `Escape`, restauração de foco e estado `inert` no fundo.
- Toda mudança funcional começa por um teste que falha pelo motivo esperado.
- Usar o frontend na porta fixa `3001` nas verificações manuais.

---

### Task 1: Aceitar e persistir os sinais estruturados no backend

**Files:**

- Modify: `apps/backend/startups/tests.py` (`MissionApiTests`)
- Modify: `apps/backend/startups/views.py` (`mission_evidence`)
- Verify only: `apps/backend/startups/mission_serializers.py` (`serialize_evidence`)

- [ ] **Step 1: Registrar o baseline do fluxo legado**

Run from `apps/backend`:

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.tests.MissionApiTests --keepdb
```

Expected: PASS. Esse baseline confirma que o payload antigo, sem `frequency` e `currentAlternative`, precisa continuar aceito.

- [ ] **Step 2: Escrever os testes que falham para os novos sinais**

Adicionar a `MissionApiTests`:

```python
def test_recording_interview_persists_guided_signals(self):
    response = self.client.post(
        self.evidence_url(),
        data={
            "intervieweeName": "Pessoa 1",
            "intervieweeProfile": "Dona de restaurante",
            "occurredOn": timezone.localdate().isoformat(),
            "context": "Percebeu a falta durante o fechamento do estoque.",
            "notes": "Precisou conferir mensagens antigas antes de comprar novamente.",
            "frequency": "weekly",
            "currentAlternative": "messages",
        },
        content_type="application/json",
        **self.auth,
    )

    self.assertEqual(response.status_code, 201)
    evidence = MissionEvidence.objects.get()
    self.assertEqual(
        evidence.details,
        {"frequency": "weekly", "currentAlternative": "messages"},
    )
    self.assertEqual(
        response.json()["mission"]["evidences"][0]["details"],
        {"frequency": "weekly", "currentAlternative": "messages"},
    )

def test_recording_interview_rejects_unknown_guided_signals(self):
    response = self.client.post(
        self.evidence_url(),
        data={
            "intervieweeName": "Pessoa 1",
            "notes": "Relato suficientemente detalhado para ser uma evidencia valida.",
            "frequency": "sometimes",
            "currentAlternative": "carrier_pigeon",
        },
        content_type="application/json",
        **self.auth,
    )

    self.assertEqual(response.status_code, 400)
    self.assertIn("frequency", response.json()["fieldErrors"])
    self.assertIn("currentAlternative", response.json()["fieldErrors"])
    self.assertEqual(MissionEvidence.objects.count(), 0)
```

- [ ] **Step 3: Executar os novos testes e confirmar a falha correta**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.tests.MissionApiTests.test_recording_interview_persists_guided_signals startups.tests.MissionApiTests.test_recording_interview_rejects_unknown_guided_signals --keepdb
```

Expected: FAIL porque `details` ainda fica vazio e valores desconhecidos ainda não são rejeitados.

- [ ] **Step 4: Implementar validação compatível e persistência**

Em `views.py`, próximo das constantes de entrevista, declarar os valores aceitos:

```python
INTERVIEW_FREQUENCIES = {"rarely", "monthly", "weekly", "daily"}
INTERVIEW_ALTERNATIVES = {
    "manual",
    "spreadsheet",
    "messages",
    "another_tool",
    "none",
}
```

No início de `mission_evidence`, ler os novos campos:

```python
frequency = _clean_text(payload, "frequency")
current_alternative = _clean_text(payload, "currentAlternative")
```

Validar somente quando o campo for enviado, preservando o contrato legado:

```python
if frequency and frequency not in INTERVIEW_FREQUENCIES:
    field_errors["frequency"] = ["Escolha uma frequencia valida."]
if current_alternative and current_alternative not in INTERVIEW_ALTERNATIVES:
    field_errors["currentAlternative"] = ["Escolha uma alternativa atual valida."]
```

Montar e persistir apenas valores presentes:

```python
details = {
    key: value
    for key, value in {
        "frequency": frequency,
        "currentAlternative": current_alternative,
    }.items()
    if value
}

evidence = MissionEvidence.objects.create(
    mission=mission,
    evidence_type=MissionEvidence.Type.INTERVIEW,
    interviewee_name=interviewee_name,
    interviewee_profile=interviewee_profile,
    context=context,
    notes=notes,
    occurred_on=occurred_on,
    details=details,
)
```

Não alterar `serialize_evidence`: ele já devolve `details`.

- [ ] **Step 5: Executar os testes focados e o contrato legado**

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.tests.MissionApiTests.test_recording_interview_persists_guided_signals startups.tests.MissionApiTests.test_recording_interview_rejects_unknown_guided_signals startups.tests.MissionApiTests.test_recording_interview_awards_xp_and_keeps_streak --keepdb
```

Expected: PASS. O terceiro teste usa o payload antigo e prova compatibilidade.

- [ ] **Step 6: Commitar a alteração do backend**

```powershell
git add apps/backend/startups/tests.py apps/backend/startups/views.py
git commit -m "feat: store guided interview signals"
```

---

### Task 2: Criar o modelo determinístico do registro guiado

**Files:**

- Create: `apps/frontend/src/components/home/guided-interview-model.ts`
- Create: `apps/frontend/src/components/home/guided-interview-model.test.ts`

- [ ] **Step 1: Escrever testes para etapas, payload e chave de autosave**

Cobrir explicitamente:

```ts
describe("guided interview model", () => {
  it("creates the first stage with the supplied local date", () => {
    expect(createGuidedInterviewDraft("2026-07-21")).toMatchObject({
      stage: 1,
      occurredOn: "2026-07-21",
      frequency: "",
      currentAlternative: "",
    });
  });

  it.each([
    [1, { intervieweeName: "Cliente 01", occurredOn: "2026-07-21" }, true],
    [2, { context: "Faltou produto durante o fechamento." }, true],
    [3, { frequency: "weekly", currentAlternative: "spreadsheet" }, true],
    [4, { notes: "Confere tres planilhas antes de realizar uma nova compra." }, true],
  ])("validates stage %s", (stage, changes, expected) => {
    const draft = { ...createGuidedInterviewDraft("2026-07-21"), ...changes };
    expect(canAdvanceInterview(draft, stage as GuidedInterviewStage)).toBe(expected);
  });

  it("builds the existing API payload plus the two structured signals", () => {
    const completeDraft: GuidedInterviewDraft = {
      ...createGuidedInterviewDraft("2026-07-21"),
      intervieweeName: "Cliente 01",
      intervieweeProfile: "Dona de restaurante",
      context: "Percebeu a falta durante o fechamento do estoque.",
      notes: "Confere mensagens antigas antes de realizar uma nova compra.",
      frequency: "weekly",
      currentAlternative: "messages",
    };
    const payload = buildInterviewEvidencePayload(completeDraft);
    expect(payload).toEqual({
      intervieweeName: "Cliente 01",
      intervieweeProfile: "Dona de restaurante",
      occurredOn: "2026-07-21",
      context: "Percebeu a falta durante o fechamento do estoque.",
      notes: "Confere mensagens antigas antes de realizar uma nova compra.",
      frequency: "weekly",
      currentAlternative: "messages",
    });
  });

  it("scopes autosave by startup, mission and interview ordinal", () => {
    expect(guidedInterviewStorageKey(7, "customer_interviews_5", 2)).toBe(
      "startup-quest:interview-draft:7:customer_interviews_5:2"
    );
  });
});
```

Adicionar casos negativos para cada etapa: nome vazio, situação curta, um dos sinais não escolhido e descoberta com menos de 20 caracteres.

- [ ] **Step 2: Executar o teste e confirmar que o módulo ainda não existe**

Run from `apps/frontend`:

```powershell
npm test -- --run src/components/home/guided-interview-model.test.ts
```

Expected: FAIL por import ausente.

- [ ] **Step 3: Implementar tipos, opções e funções puras**

O arquivo deve exportar este contrato:

```ts
export type InterviewFrequency = "rarely" | "monthly" | "weekly" | "daily";
export type InterviewAlternative =
  | "manual"
  | "spreadsheet"
  | "messages"
  | "another_tool"
  | "none";
export type GuidedInterviewStage = 1 | 2 | 3 | 4;

export type GuidedInterviewDraft = {
  stage: GuidedInterviewStage;
  intervieweeName: string;
  intervieweeProfile: string;
  occurredOn: string;
  context: string;
  frequency: InterviewFrequency | "";
  currentAlternative: InterviewAlternative | "";
  notes: string;
};

export type InterviewEvidencePayload = Omit<GuidedInterviewDraft, "stage"> & {
  frequency: InterviewFrequency;
  currentAlternative: InterviewAlternative;
};
```

Exportar também:

```ts
export const INTERVIEW_FREQUENCY_OPTIONS = [
  { value: "rarely", label: "Raramente" },
  { value: "monthly", label: "Todo mês" },
  { value: "weekly", label: "Toda semana" },
  { value: "daily", label: "Todo dia" },
] as const;

export const INTERVIEW_ALTERNATIVE_OPTIONS = [
  { value: "manual", label: "Processo manual" },
  { value: "spreadsheet", label: "Planilha" },
  { value: "messages", label: "Mensagens ou anotações" },
  { value: "another_tool", label: "Outra ferramenta" },
  { value: "none", label: "Não resolve hoje" },
] as const;
```

Implementar:

- `localDateValue(date = new Date())`, preservando o formato local `YYYY-MM-DD`;
- `createGuidedInterviewDraft(occurredOn)`;
- `canAdvanceInterview(draft, stage)`;
- `buildInterviewEvidencePayload(draft)`, com narrowing dos dois sinais;
- `guidedInterviewStorageKey(startupId, missionKey, ordinal)`.

Regras de avanço:

- etapa 1: nome não vazio e data não vazia;
- etapa 2: situação com pelo menos 10 caracteres;
- etapa 3: frequência e alternativa escolhidas;
- etapa 4: descoberta com pelo menos 20 caracteres, igual ao mínimo do backend.

- [ ] **Step 4: Executar o teste do modelo**

```powershell
npm test -- --run src/components/home/guided-interview-model.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commitar o modelo**

```powershell
git add apps/frontend/src/components/home/guided-interview-model.ts apps/frontend/src/components/home/guided-interview-model.test.ts
git commit -m "feat: add guided interview model"
```

---

### Task 3: Implementar o guia de bolso e as quatro rodadas

**Files:**

- Create: `apps/frontend/src/components/home/guided-interview-flow.tsx`
- Create: `apps/frontend/src/components/home/guided-interview-flow.module.css`
- Create: `apps/frontend/src/components/home/guided-interview-flow.test.tsx`

- [ ] **Step 1: Escrever o teste da primeira entrevista e do roteiro opcional**

Usar um `localStorage` limpo no `beforeEach`. Cobrir dois cenários:

```tsx
const baseProps = {
  isSaving: false,
  missionKey: "customer_interviews_5",
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue("Entrevista registrada. Você ganhou 10 XP."),
  startupId: 7,
};

it("shows the pocket guide before the first interview", () => {
  render(<GuidedInterviewFlow evidenceCount={0} {...baseProps} />);

  expect(screen.getByRole("heading", { name: "Antes da conversa" })).toBeInTheDocument();
  expect(screen.getByText("Conte sobre a última vez que isso aconteceu.")).toBeInTheDocument();
  expect(screen.getByText(/nao tente vender a solucao/i)).toBeInTheDocument();
  expect(screen.queryByText("Etapa 1 de 4")).not.toBeInTheDocument();
});

it("starts later interviews at registration and keeps the guide optional", () => {
  render(<GuidedInterviewFlow evidenceCount={1} {...baseProps} />);

  expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Consultar roteiro" }));
  expect(screen.getByRole("heading", { name: "Roteiro da entrevista" })).toBeInTheDocument();
});
```

O guia deve mostrar estas cinco perguntas prontas:

1. `Conte sobre a última vez que isso aconteceu.`
2. `O que tornou esse momento difícil?`
3. `Com que frequência algo parecido acontece?`
4. `Como você resolve isso hoje?`
5. `O que acontece quando você não consegue resolver?`

E um alerta curto: evitar perguntas hipotéticas como `Você usaria meu aplicativo?` e não tentar vender a solução.

- [ ] **Step 2: Escrever o teste das quatro rodadas e da Ficha de Evidência**

O teste deve:

- clicar `Começar registro` na primeira entrevista;
- preencher nome e avançar;
- preencher a situação e avançar;
- escolher frequência e alternativa por botões;
- preencher a descoberta;
- conferir a prévia com todos os sinais;
- voltar uma etapa sem perder respostas;
- avançar novamente e salvar;
- verificar o payload exato entregue a `onSubmit`.

Exemplo do final do teste:

```tsx
expect(screen.getByRole("button", { name: "Toda semana" })).toHaveAttribute(
  "aria-pressed",
  "true"
);
expect(screen.getByText("Ficha de Evidência")).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: "Salvar evidencia" }));

await waitFor(() =>
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      frequency: "weekly",
      currentAlternative: "spreadsheet",
    })
  )
);
expect(screen.getByText(/transformou uma conversa em evidencia observavel/i)).toBeInTheDocument();
expect(screen.getByText(/10 XP/i)).toBeInTheDocument();
```

- [ ] **Step 3: Escrever testes de autosave, falhas e acessibilidade**

Cobrir:

- rascunho salvo na chave de `startupId + missionKey + ordinal`;
- rascunho restaurado ao remontar;
- entrada corrompida ou fora do schema ignorada e removida, validando etapa, strings e enums antes do cast;
- exceções em `getItem`, `setItem` e `removeItem` não quebram o fluxo;
- falha de `onSubmit` mantém respostas e mostra `role="alert"`;
- sucesso remove o rascunho;
- cada etapa recebe foco ao avançar ou voltar;
- progresso, erro e sucesso usam regiões live;
- botões de sinais usam `aria-pressed`.

- [ ] **Step 4: Executar os testes e confirmar a falha de módulo ausente**

```powershell
npm test -- --run src/components/home/guided-interview-flow.test.tsx
```

Expected: FAIL por componente ausente.

- [ ] **Step 5: Implementar o contrato do componente**

```tsx
type GuidedInterviewFlowProps = {
  evidenceCount: number;
  isSaving: boolean;
  missionKey: string;
  onClose: () => void;
  onSubmit: (payload: InterviewEvidencePayload) => Promise<string>;
  startupId: number;
};
```

Estados internos:

- `view: "guide" | "form" | "success"`;
- `draft: GuidedInterviewDraft`;
- `error: string | null`;
- `restored: boolean` para evitar sobrescrever o storage antes da leitura inicial.

Comportamento:

- `evidenceCount === 0`: iniciar no guia;
- `evidenceCount > 0`: iniciar na etapa 1 e mostrar `Consultar roteiro`;
- fechar o roteiro opcional retorna à etapa que estava aberta;
- `ordinal = evidenceCount + 1` entra na chave do rascunho;
- o submit chama `buildInterviewEvidencePayload`, aguarda `onSubmit`, remove o rascunho e muda para sucesso;
- se `onSubmit` rejeitar, preservar `draft` e apresentar a mensagem para nova tentativa;
- `Ver coleção` chama `onClose` depois do sucesso.

A confirmação deve priorizar competência:

```tsx
<strong>Você transformou uma conversa em evidência observável.</strong>
<p>Você praticou ouvir sem induzir e reconhecer sinais reais. {serverMessage}</p>
```

- [ ] **Step 6: Implementar o layout sem textarea grande**

Estrutura visual:

- cabeçalho compacto com `Etapa N de 4` e barra de progresso;
- etapa 1 com dois inputs e data;
- etapa 2 com input curto de situação;
- etapa 3 com dois grupos de cartões selecionáveis;
- etapa 4 com input curto para a descoberta e prévia da ficha;
- ações `Voltar`, `Continuar depois` e `Continuar`/`Salvar evidência`;
- nenhuma animação obrigatória; transições cosméticas desabilitadas em `prefers-reduced-motion`.

Usar tokens visuais já presentes na Home (azul escuro, âmbar, superfícies claras) sem importar classes do CSS grande. O novo CSS Module deve manter foco visível de `2px solid #f2a51a` e alvos de toque com pelo menos `44px`.

- [ ] **Step 7: Executar os testes do fluxo**

```powershell
npm test -- --run src/components/home/guided-interview-model.test.ts src/components/home/guided-interview-flow.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commitar o fluxo guiado**

```powershell
git add apps/frontend/src/components/home/guided-interview-flow.tsx apps/frontend/src/components/home/guided-interview-flow.module.css apps/frontend/src/components/home/guided-interview-flow.test.tsx
git commit -m "feat: add guided interview flow"
```

---

### Task 4: Criar a coleção visual de Fichas de Evidência

**Files:**

- Create: `apps/frontend/src/components/home/interview-evidence-collection.tsx`
- Create: `apps/frontend/src/components/home/interview-evidence-collection.module.css`
- Create: `apps/frontend/src/components/home/interview-evidence-collection.test.tsx`
- Modify: `apps/frontend/src/components/home/mission-focus-panel.tsx`
- Modify: `apps/frontend/src/components/home/mission-focus-panel.test.tsx`

- [ ] **Step 1: Escrever testes da coleção nova e da compatibilidade antiga**

O componente recebe:

```ts
type InterviewEvidenceCollectionProps = {
  evidences: MissionEvidenceSummary[];
  requiredCount: number;
};
```

Testar um registro novo:

```tsx
expect(screen.getByText("1 de 5 entrevistas registradas")).toBeInTheDocument();
expect(screen.getByText("Toda semana")).toBeInTheDocument();
expect(screen.getByText("Planilha")).toBeInTheDocument();
expect(screen.getByText("Marina Costa")).toBeInTheDocument();
```

Testar um registro legado com `details: {}`:

```tsx
expect(screen.getByText("Entrevistado antigo")).toBeInTheDocument();
expect(screen.getByText("Relato antigo ainda valido e visivel.")).toBeInTheDocument();
expect(screen.queryByText("Frequencia nao informada")).not.toBeInTheDocument();
```

Ou seja: os chips novos são omitidos; a ficha antiga não é descartada nem tratada como erro.

- [ ] **Step 2: Atualizar o teste do painel para coleção em andamento e concluída**

Em `mission-focus-panel.test.tsx`:

- preencher `mission.evidences` no fixture em andamento e esperar a coleção;
- preservar o teste concluído, mas agora esperar a coleção extraída;
- garantir que a seção não duplique evidências quando concluída;
- garantir que o bloco de aprendizado concluído continue intacto e sem ações de mutação.

- [ ] **Step 3: Executar os testes e confirmar falhas esperadas**

```powershell
npm test -- --run src/components/home/interview-evidence-collection.test.tsx src/components/home/mission-focus-panel.test.tsx
```

Expected: FAIL por componente ausente e porque o painel atual só mostra evidências quando concluído.

- [ ] **Step 4: Implementar a coleção**

Reutilizar os labels exportados por `guided-interview-model.ts`. Fazer narrowing seguro do JSON:

```ts
const frequency = INTERVIEW_FREQUENCY_OPTIONS.find(
  (option) => option.value === evidence.details.frequency
);
const alternative = INTERVIEW_ALTERNATIVE_OPTIONS.find(
  (option) => option.value === evidence.details.currentAlternative
);
```

Cada ficha mostra, quando disponível:

- identificação e perfil;
- data;
- situação real;
- descoberta;
- chips de frequência e alternativa.

O cabeçalho mostra `${evidences.length} de ${requiredCount} entrevistas registradas`.

- [ ] **Step 5: Integrar no painel sem duplicar a marcação antiga**

Em `mission-focus-panel.tsx`:

- renderizar `InterviewEvidenceCollection` para missão de entrevista sempre que `evidences.length > 0`, em andamento ou concluída;
- remover apenas a lista manual `completedEvidenceList`;
- manter a seção de aprendizado dentro de `completedMissionDetails`;
- manter a missão concluída somente leitura.

- [ ] **Step 6: Executar os testes da coleção e painel**

```powershell
npm test -- --run src/components/home/interview-evidence-collection.test.tsx src/components/home/mission-focus-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commitar a coleção**

```powershell
git add apps/frontend/src/components/home/interview-evidence-collection.tsx apps/frontend/src/components/home/interview-evidence-collection.module.css apps/frontend/src/components/home/interview-evidence-collection.test.tsx apps/frontend/src/components/home/mission-focus-panel.tsx apps/frontend/src/components/home/mission-focus-panel.test.tsx
git commit -m "feat: show interview evidence collection"
```

---

### Task 5: Integrar o fluxo guiado à Home e ao endpoint real

**Files:**

- Modify: `apps/frontend/src/components/home/startup-home-screen.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.test.tsx`
- Modify: `apps/frontend/src/components/home/startup-home-screen.module.css` (somente remover estilos comprovadamente sem uso, se houver)

- [ ] **Step 1: Reescrever o teste de integração principal**

Substituir as interações com o formulário antigo no teste `loads the mission-focused home and opens interview work from its current step` pelo caminho aprovado:

1. abrir `Registre 5 entrevistas`;
2. ver o guia porque `evidenceCount` é zero no fixture específico;
3. clicar `Começar registro`;
4. percorrer as quatro rodadas;
5. salvar;
6. inspecionar `JSON.parse(options.body)`.

O payload esperado:

```ts
expect(JSON.parse(String(requestInit.body))).toEqual({
  intervieweeName: "Cliente 02",
  intervieweeProfile: "Dona de restaurante",
  occurredOn: expect.any(String),
  context: "Percebeu a falta durante o fechamento do estoque.",
  notes: "Precisou conferir mensagens antigas antes de comprar novamente.",
  frequency: "weekly",
  currentAlternative: "messages",
});
```

O mock da segunda resposta deve devolver `TodayPayload` com `evidenceCount` incrementado, a nova evidência em `mission.evidences` e `message` contendo os `10 XP`.

- [ ] **Step 2: Atualizar os testes de contrato do modal**

Manter e adaptar:

- ordinal contextual `2ª entrevista`;
- foco preso no diálogo, considerando o último botão da view atual;
- `Escape` e restauração do foco ao gatilho;
- erro de conexão mantendo o diálogo e respostas;
- `onWorkspaceChanged` chamado depois de salvar;
- rota de missão estruturada não abre o fluxo de entrevista;
- missão concluída continua sem CTA de registro;
- fluxo de aprendizado preserva o texto atual.

Adicionar uma asserção de que, após sucesso, o modal continua aberto na confirmação até o usuário clicar `Ver coleção`.

- [ ] **Step 3: Executar o teste e confirmar que a integração ainda usa o formulário antigo**

```powershell
npm test -- --run src/components/home/startup-home-screen.test.tsx
```

Expected: FAIL nas novas expectativas do guia e das rodadas.

- [ ] **Step 4: Remover estado e markup do formulário antigo**

De `startup-home-screen.tsx`, remover:

- `InterviewDraft`;
- `emptyInterview`;
- estado `interview` e seus setters;
- o `<form>` antigo com textarea;
- imports usados exclusivamente pelo formulário antigo.

Importar:

```ts
import { GuidedInterviewFlow } from "./guided-interview-flow";
import type { InterviewEvidencePayload } from "./guided-interview-model";
```

- [ ] **Step 5: Transformar o submit da Home em callback assíncrono**

Contrato:

```ts
async function submitInterview(nextInterview: InterviewEvidencePayload): Promise<string>
```

Comportamento:

- enviar `nextInterview` ao mesmo endpoint;
- em `401`, redirecionar para `/`;
- em outro erro HTTP, rejeitar com `firstFieldError`;
- em erro de rede, rejeitar com `A entrevista não foi registrada. Verifique sua conexão e tente novamente.`;
- em sucesso, atualizar `payload`, chamar `onWorkspaceChanged` e retornar `nextPayload.message ?? "Entrevista registrada. Você ganhou 10 XP."`;
- não chamar `closeWorkDialog` automaticamente;
- manter `isSaving` verdadeiro durante a requisição para impedir duplo envio.

Não reutilizar `applySuccess`, pois ele fecha o modal e deve continuar atendendo os fluxos atuais que precisam desse comportamento.

- [ ] **Step 6: Renderizar o componente dentro do shell de diálogo atual**

```tsx
{workMode === "interview" ? (
  <GuidedInterviewFlow
    evidenceCount={mission.evidenceCount}
    isSaving={isSaving}
    missionKey={mission.key}
    onClose={closeWorkDialog}
    onSubmit={submitInterview}
    startupId={startupId}
  />
) : workMode === "learning" ? (
  // formulário existente, sem mudança funcional
) : (
  // detalhes existentes
)}
```

No cabeçalho do diálogo, manter apenas o título `Registrar entrevista` e o ordinal. O guia e as instruções passam a pertencer ao novo componente.

- [ ] **Step 7: Remover somente CSS comprovadamente órfão**

Executar antes da remoção:

```powershell
rg -n "formGrid|fullField|workForm" apps/frontend/src/components/home
```

Remover classes de `startup-home-screen.module.css` apenas se não forem usadas pelo formulário de aprendizado ou por outra tela. Não fazer limpeza ampla nesta feature.

- [ ] **Step 8: Executar testes de integração da Home**

```powershell
npm test -- --run src/components/home/startup-home-screen.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commitar a integração**

```powershell
git add apps/frontend/src/components/home/startup-home-screen.tsx apps/frontend/src/components/home/startup-home-screen.test.tsx apps/frontend/src/components/home/startup-home-screen.module.css
git commit -m "feat: integrate guided interview mission"
```

---

### Task 6: Verificação completa e inspeção no navegador

**Files:**

- Verify: todos os arquivos alterados nas Tasks 1–5
- Modify only if a verification exposes a defect in scope

- [ ] **Step 1: Executar a suíte backend relacionada a missões**

Run from `apps/backend`:

```powershell
& 'C:\Users\mateu\OneDrive\Área de Trabalho\TCC\apps\backend\.venv\Scripts\python.exe' manage.py test startups.tests.MissionApiTests startups.test_mission_api_v2 startups.test_mission_engine --keepdb
```

Expected: PASS sem novas migrações.

- [ ] **Step 2: Executar a suíte frontend completa**

Run from `apps/frontend`:

```powershell
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Executar lint e build de produção**

```powershell
npm run lint
npm run build
```

Expected: ambos PASS, sem erro de TypeScript, hook ou acessibilidade estática.

- [ ] **Step 4: Ligar a aplicação real e verificar o fluxo**

Na raiz do worktree, usar o launcher do projeto e confirmar:

```powershell
.\LIGAR-TUDO.cmd
```

Abrir `http://localhost:3001/` e verificar com uma startup de teste:

- primeira entrevista abre o guia de bolso;
- depois de `Começar registro`, as quatro rodadas funcionam sem textarea grande;
- fechar e reabrir restaura o rascunho da mesma entrevista;
- frequência e alternativa ficam visualmente selecionadas;
- erro simulado de rede não apaga respostas;
- sucesso mostra competência antes de XP e atualiza `1 de 5`;
- `Ver coleção` fecha o modal e deixa a ficha visível;
- a segunda entrevista abre diretamente na etapa 1 e oferece `Consultar roteiro`;
- um registro legado sem `details` continua legível;
- teclado, `Escape`, foco e viewport estreito continuam utilizáveis.

- [ ] **Step 5: Fazer a revisão final de escopo e diff**

```powershell
git diff --check
git status --short
git diff --stat origin/feat/decision-lab-pilot...HEAD
```

Confirmar que não existem:

- arquivos de migração;
- alterações no fluxo de aprendizado;
- marcadores temporários ou texto fictício;
- arquivos gerados pelo build;
- mudanças no launcher pessoal.

- [ ] **Step 6: Corrigir apenas falhas encontradas e repetir a verificação afetada**

Cada correção deve vir acompanhada do teste que a reproduz. Reexecutar pelo menos o teste focado, a suíte frontend, lint e build depois da última correção.

- [ ] **Step 7: Commitar ajustes finais, se houver**

Se a verificação exigiu mudanças:

```powershell
git add -u -- apps/backend/startups apps/frontend/src/components/home
git commit -m "fix: polish guided interview mission"
```

Se não houve mudança, não criar commit vazio.

---

## Definition of Done

- O primeiro registro ensina a entrevista com um guia curto e cinco perguntas.
- Registros seguintes pulam o guia, mas mantêm `Consultar roteiro`.
- O registro usa quatro rodadas curtas, escolhas visuais e prévia da Ficha de Evidência.
- O endpoint antigo continua aceitando payloads sem os novos sinais.
- Frequência e alternativa vão para `MissionEvidence.details` e retornam na serialização.
- Rascunhos são isolados por startup, missão e ordinal; falhas de storage não bloqueiam o usuário.
- Erros de rede ou servidor preservam respostas e permitem nova tentativa.
- Coleção mostra registros novos e antigos durante e depois da missão.
- Fluxo de aprendizado e conclusão permanecem funcionalmente iguais.
- Testes backend/frontend, lint, build e inspeção real em `localhost:3001` passam.
