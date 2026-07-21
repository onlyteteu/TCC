from .mission_engine import sync_mission_catalog
from .models import JourneyStep, Mission, Startup


CHAPTERS = (
    {
        "key": "foundation",
        "title": "Fundamento",
        "question": "Para quem e para qual dor esta startup existe?",
        "steps": (Startup.Stage.PROBLEM, Startup.Stage.AUDIENCE),
    },
    {
        "key": "proposal",
        "title": "Proposta",
        "question": "Por que essa startup merece existir?",
        "steps": (Startup.Stage.VALUE, Startup.Stage.DIFFERENTIATORS),
    },
    {
        "key": "validation",
        "title": "Validação",
        "question": "O que prova que a proposta é desejável e viável?",
        "steps": (Startup.Stage.VALIDATION, Startup.Stage.BUSINESS_MODEL),
    },
    {
        "key": "construction",
        "title": "Construção",
        "question": "Qual é a menor entrega e como medir o avanço?",
        "steps": (Startup.Stage.MVP, Startup.Stage.GOALS),
    },
)

MISSION_BY_STEP = {
    Startup.Stage.PROBLEM: "refine_problem_with_evidence",
    Startup.Stage.AUDIENCE: "validate_priority_audience",
    Startup.Stage.VALUE: "reframe_value_proposition",
    Startup.Stage.DIFFERENTIATORS: "map_current_alternatives",
}

MILESTONE_DESCRIPTIONS = {
    Startup.Stage.PROBLEM: "Delimite uma dor real antes de pensar na solucao.",
    Startup.Stage.AUDIENCE: "Escolha o primeiro grupo para o qual vale resolver essa dor.",
    Startup.Stage.VALUE: "Transforme problema e publico em uma promessa clara de resultado.",
    Startup.Stage.DIFFERENTIATORS: "Mostre por que a proposta supera as alternativas atuais.",
    Startup.Stage.VALIDATION: "Reuna sinais de que o publico deseja a proposta.",
    Startup.Stage.BUSINESS_MODEL: "Explique como a startup entrega e captura valor.",
    Startup.Stage.MVP: "Defina a menor entrega capaz de testar a proposta.",
    Startup.Stage.GOALS: "Escolha medidas concretas para acompanhar o avanco.",
}


def _serialize_step(step):
    return {
        "key": step.key,
        "title": step.get_key_display(),
        "status": step.status,
        "answer": step.answer,
        "order": step.order,
        "completedAt": step.completed_at.isoformat() if step.completed_at else None,
    }


def _chapter_status(steps):
    if all(step.status == JourneyStep.Status.DONE for step in steps):
        return "done"
    if any(step.status == JourneyStep.Status.CURRENT for step in steps):
        return "current"
    return "locked"


def _serialize_chapter(definition, steps_by_key):
    steps = [steps_by_key[key] for key in definition["steps"]]
    return {
        "key": definition["key"],
        "title": definition["title"],
        "question": definition["question"],
        "status": _chapter_status(steps),
        "completedSteps": sum(
            step.status == JourneyStep.Status.DONE for step in steps
        ),
        "totalSteps": len(steps),
        "steps": [_serialize_step(step) for step in steps],
    }


def _strategic_summary(steps):
    fields_by_key = {
        Startup.Stage.PROBLEM: "problem",
        Startup.Stage.AUDIENCE: "audience",
    }
    labels_by_key = {
        Startup.Stage.PROBLEM: "Problema",
        Startup.Stage.AUDIENCE: "Público-alvo",
    }
    return [
        {
            "key": step.key,
            "label": labels_by_key.get(step.key, step.get_key_display()),
            "value": step.answer,
            "field": fields_by_key.get(step.key),
        }
        for step in steps
        if step.answer.strip()
    ]


def _serialize_mission(startup, mission):
    if mission is None:
        return None
    return {
        "key": mission.key,
        "title": mission.title,
        "objective": mission.objective,
        "href": f"/painel/startup/{startup.pk}/missoes/{mission.key}",
        "estimatedMinutes": mission.estimated_minutes,
        "xpReward": mission.xp_reward,
        "status": mission.status,
        "canContinue": mission.status
        in {Mission.Status.AVAILABLE, Mission.Status.IN_PROGRESS},
    }


def _chapter_for_step(step_key, chapters):
    return next(
        chapter
        for chapter in chapters
        if any(step["key"] == step_key for step in chapter["steps"])
    )


def _serialize_milestone(startup, current, steps, chapters, missions_by_key):
    if current is None:
        return None

    chapter = _chapter_for_step(current.key, chapters)
    mission_key = MISSION_BY_STEP.get(current.key)
    mission = missions_by_key.get(mission_key)
    next_step = next((step for step in steps if step.order > current.order), None)
    summary = _strategic_summary(steps)
    return {
        "key": current.key,
        "chapterKey": chapter["key"],
        "title": current.get_key_display(),
        "description": MILESTONE_DESCRIPTIONS[current.key],
        "alreadyBuilt": summary,
        "nextUnlock": (
            {
                "title": next_step.get_key_display(),
                "description": MILESTONE_DESCRIPTIONS[next_step.key],
            }
            if next_step
            else None
        ),
        "mission": _serialize_mission(startup, mission),
        "message": (
            None
            if mission
            else "A missão deste marco ainda não foi liberada."
        ),
    }


def build_journey_context(startup, steps):
    missions = sync_mission_catalog(startup)
    missions_by_key = {mission.key: mission for mission in missions}
    steps_by_key = {step.key: step for step in steps}
    chapters = [
        _serialize_chapter(definition, steps_by_key) for definition in CHAPTERS
    ]
    current = next(
        (step for step in steps if step.status == JourneyStep.Status.CURRENT),
        None,
    )
    return {
        "chapters": chapters,
        "currentMilestone": _serialize_milestone(
            startup,
            current,
            steps,
            chapters,
            missions_by_key,
        ),
        "strategicSummary": _strategic_summary(steps),
    }
