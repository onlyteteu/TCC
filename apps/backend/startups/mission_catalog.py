from dataclasses import dataclass

from .models import Mission

CATALOG_VERSION = 2


@dataclass(frozen=True)
class MissionDefinition:
    key: str
    version: int
    mission_type: str
    phase: str
    title: str
    objective: str
    why_it_matters: str
    instructions: tuple[str, ...]
    completion_criteria: str
    contextual_tip: str
    required_evidence_count: int
    xp_reward: int
    order: int
    priority: int
    prerequisites: tuple[str, ...]
    action_type: str
    completion_rule: str
    requirement_config: dict
    steps: tuple[dict, ...]
    is_required: bool = True

    @classmethod
    def minimal(cls, key: str, prerequisites: tuple[str, ...] = ()):
        return cls(
            key=key,
            version=CATALOG_VERSION,
            mission_type=Mission.Type.MAIN,
            phase="Teste",
            title=key,
            objective=key,
            why_it_matters=key,
            instructions=(key,),
            completion_criteria=key,
            contextual_tip="",
            required_evidence_count=1,
            xp_reward=0,
            order=0,
            priority=100,
            prerequisites=prerequisites,
            action_type=Mission.ActionType.PROBLEM_REFINEMENT,
            completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
            requirement_config={"submissionKey": "primary"},
            steps=({"key": "submit", "title": key, "description": key},),
        )

    def snapshot(self):
        return {
            "definition_version": self.version,
            "origin": Mission.Origin.CATALOG,
            "mission_type": self.mission_type,
            "phase": self.phase,
            "title": self.title,
            "objective": self.objective,
            "why_it_matters": self.why_it_matters,
            "instructions": list(self.instructions),
            "completion_criteria": self.completion_criteria,
            "contextual_tip": self.contextual_tip,
            "required_evidence_count": self.required_evidence_count,
            "xp_reward": self.xp_reward,
            "order": self.order,
            "priority": self.priority,
            "prerequisite_keys": list(self.prerequisites),
            "action_type": self.action_type,
            "completion_rule": self.completion_rule,
            "requirement_config": self.requirement_config,
            "step_blueprint": list(self.steps),
            "is_required": self.is_required,
        }


MISSION_DEFINITIONS = (
    MissionDefinition(
        key="customer_interviews_5",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Converse com 5 potenciais clientes",
        objective="Entender como o problema acontece na vida real antes de definir a solução.",
        why_it_matters="Conversas reais substituem suposições por evidências.",
        instructions=(
            "Prepare um roteiro curto com perguntas sobre situações reais do passado.",
            "Converse com cinco pessoas do público inicial sem apresentar sua solução.",
            "Registre cada entrevista e resuma os padrões encontrados.",
        ),
        completion_criteria="Registrar cinco entrevistas e uma síntese de aprendizado.",
        contextual_tip="Pergunte sobre situações reais do passado, sem vender a solução.",
        required_evidence_count=5,
        xp_reward=150,
        order=10,
        priority=100,
        prerequisites=(),
        action_type=Mission.ActionType.INTERVIEWS,
        completion_rule=Mission.CompletionRule.INTERVIEWS_AND_LEARNING,
        requirement_config={"evidenceType": "interview", "minimum": 5, "learning": True},
        steps=(
            {"key": "prepare", "title": "Prepare o roteiro", "description": "Defina perguntas sobre fatos do passado."},
            {"key": "interviews", "title": "Registre 5 entrevistas", "description": "Documente cada conversa."},
            {"key": "learning", "title": "Resuma os padrões", "description": "Transforme relatos em aprendizado."},
        ),
    ),
    MissionDefinition(
        key="refine_problem_with_evidence",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Refine o problema com evidências",
        objective="Reescrever o problema usando os padrões encontrados nas entrevistas.",
        why_it_matters="Um problema específico e observado reduz o risco de construir para uma suposição.",
        instructions=("Revise os padrões.", "Escreva o problema sem citar a solução.", "Explique quais evidências sustentam o recorte."),
        completion_criteria="Registrar o problema refinado e a síntese das evidências.",
        contextual_tip="Descreva quem sofre, em qual situação e qual consequência aparece.",
        required_evidence_count=1,
        xp_reward=100,
        order=20,
        priority=100,
        prerequisites=("customer_interviews_5",),
        action_type=Mission.ActionType.PROBLEM_REFINEMENT,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Refine o problema", "description": "Conecte a formulação às entrevistas."},),
    ),
    MissionDefinition(
        key="validate_priority_audience",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Descoberta",
        title="Valide o público prioritário",
        objective="Escolher o primeiro público com base nos sinais observados.",
        why_it_matters="Um recorte inicial claro melhora entrevistas, proposta e experimentos.",
        instructions=("Compare os perfis entrevistados.", "Identifique onde a dor foi mais frequente.", "Decida manter ou ajustar o público."),
        completion_criteria="Registrar público, sinais observados e decisão.",
        contextual_tip="Prefira um grupo pequeno e alcançável a uma categoria ampla.",
        required_evidence_count=1,
        xp_reward=120,
        order=30,
        priority=100,
        prerequisites=("refine_problem_with_evidence",),
        action_type=Mission.ActionType.AUDIENCE_VALIDATION,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Defina o público prioritário", "description": "Registre sinais e a decisão."},),
    ),
    MissionDefinition(
        key="reframe_value_proposition",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Proposta",
        title="Reformule a proposta de valor",
        objective="Conectar público, problema e resultado esperado em uma promessa clara.",
        why_it_matters="A proposta orienta o que será testado sem antecipar um produto grande.",
        instructions=("Use o público validado.", "Nomeie o problema prioritário.", "Descreva o resultado esperado."),
        completion_criteria="Registrar proposta de valor e justificativa baseada nas evidências.",
        contextual_tip="Explique o valor antes de listar funcionalidades.",
        required_evidence_count=1,
        xp_reward=100,
        order=40,
        priority=100,
        prerequisites=("validate_priority_audience",),
        action_type=Mission.ActionType.VALUE_PROPOSITION,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Formule a promessa central", "description": "Conecte público, dor e resultado."},),
    ),
    MissionDefinition(
        key="map_current_alternatives",
        version=2,
        mission_type=Mission.Type.MAIN,
        phase="Proposta",
        title="Mapeie as alternativas atuais",
        objective="Entender como o público resolve o problema hoje e onde as opções falham.",
        why_it_matters="A startup compete também com planilhas, improvisos e a decisão de não agir.",
        instructions=("Liste alternativas citadas.", "Registre limitações observadas.", "Descreva a oportunidade de diferenciação."),
        completion_criteria="Registrar alternativas, limitações e oportunidade.",
        contextual_tip="Inclua soluções manuais e o comportamento de não fazer nada.",
        required_evidence_count=1,
        xp_reward=100,
        order=50,
        priority=100,
        prerequisites=("validate_priority_audience",),
        action_type=Mission.ActionType.ALTERNATIVES_MAP,
        completion_rule=Mission.CompletionRule.PRIMARY_SUBMISSION,
        requirement_config={"submissionKey": "primary"},
        steps=({"key": "submit", "title": "Compare as alternativas", "description": "Registre opções, falhas e oportunidade."},),
    ),
)


def validate_catalog(definitions):
    by_key = {}
    for definition in definitions:
        if definition.key in by_key:
            raise ValueError(f"Chave de missao duplicada: {definition.key}")
        by_key[definition.key] = definition

    for definition in definitions:
        missing = [key for key in definition.prerequisites if key not in by_key]
        if missing:
            raise ValueError(f"Pre-requisito ausente em {definition.key}: {', '.join(missing)}")

    state = {}

    def visit(key, path):
        if state.get(key) == "visited":
            return
        if state.get(key) == "visiting":
            cycle = " -> ".join([*path, key])
            raise ValueError(f"Catalogo de missoes possui ciclo: {cycle}")
        state[key] = "visiting"
        for prerequisite in by_key[key].prerequisites:
            visit(prerequisite, [*path, key])
        state[key] = "visited"

    for key in by_key:
        visit(key, [])


validate_catalog(MISSION_DEFINITIONS)
