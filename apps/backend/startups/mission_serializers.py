from .mission_catalog import CATALOG_VERSION
from .mission_engine import (
    evaluate_mission,
    recommendation_reason,
    select_recommended_mission,
    sync_mission_catalog,
)
from .models import Mission


TYPE_LABELS = {
    Mission.Type.MAIN: "Miss\u00e3o principal",
    Mission.Type.WEEKLY: "Miss\u00e3o semanal",
    Mission.Type.QUICK: "Tarefa r\u00e1pida",
    Mission.Type.EXPERIMENT: "Experimento",
    Mission.Type.LEARNING: "Aprendizado",
    Mission.Type.MANAGEMENT: "Gest\u00e3o recorrente",
}


def serialize_evidence(evidence):
    return {
        "id": evidence.pk,
        "type": evidence.evidence_type,
        "title": evidence.title,
        "summary": evidence.summary,
        "details": evidence.details,
        "intervieweeName": evidence.interviewee_name,
        "intervieweeProfile": evidence.interviewee_profile,
        "context": evidence.context,
        "notes": evidence.notes,
        "occurredOn": evidence.occurred_on.isoformat(),
        "createdAt": evidence.created_at.isoformat(),
    }


def serialize_learning(learning):
    if learning is None:
        return None
    return {
        "id": learning.pk,
        "content": learning.content,
        "impact": learning.impact,
        "nextAction": learning.next_action,
        "confidence": learning.confidence,
        "confidenceLabel": learning.get_confidence_display(),
        "createdAt": learning.created_at.isoformat(),
        "updatedAt": learning.updated_at.isoformat(),
    }


def serialize_source_evidences(mission, by_key):
    source_evidences = []
    for key in mission.prerequisite_keys:
        prerequisite = by_key.get(key)
        if prerequisite is None:
            continue
        source_evidences.extend(
            serialize_evidence(item)
            for item in prerequisite.evidences.order_by("created_at", "pk")
        )
    return source_evidences


def locked_reasons(mission, by_key):
    return [
        f"Conclua: {by_key[key].title}"
        for key in mission.prerequisite_keys
        if key in by_key and by_key[key].status != Mission.Status.COMPLETED
    ]


def serialize_mission_card(mission, *, by_key, reason=None, evaluation=None):
    evaluation = evaluation or evaluate_mission(mission)
    return {
        "key": mission.key,
        "definitionVersion": mission.definition_version,
        "origin": mission.origin,
        "type": mission.mission_type,
        "typeLabel": TYPE_LABELS.get(
            mission.mission_type, mission.get_mission_type_display()
        ),
        "phase": mission.phase,
        "title": mission.title,
        "objective": mission.objective,
        "xpReward": mission.xp_reward,
        "estimatedMinutes": mission.estimated_minutes,
        "status": mission.status,
        "statusLabel": mission.get_status_display(),
        "progress": evaluation.progress,
        "actionType": mission.action_type,
        "isRequired": mission.is_required,
        "order": mission.order,
        "priority": mission.priority,
        "prerequisiteKeys": mission.prerequisite_keys,
        "lockedReasons": locked_reasons(mission, by_key),
        "recommendationReason": reason,
        "completedAt": mission.completed_at.isoformat() if mission.completed_at else None,
    }


def serialize_mission_detail(mission, *, by_key, reason=None):
    evaluation = evaluate_mission(mission)
    card = serialize_mission_card(
        mission,
        by_key=by_key,
        reason=reason,
        evaluation=evaluation,
    )
    learning = mission.learnings.first()
    return {
        **card,
        "whyItMatters": mission.why_it_matters,
        "instructions": mission.instructions,
        "completionCriteria": mission.completion_criteria,
        "contextualTip": mission.contextual_tip,
        "requiredEvidenceCount": mission.required_evidence_count,
        "evidenceCount": mission.evidences.count(),
        "canAddLearning": evaluation.can_add_learning,
        "canComplete": evaluation.can_complete,
        "requirements": evaluation.requirements,
        "steps": evaluation.steps,
        "evidences": [serialize_evidence(item) for item in mission.evidences.all()],
        "sourceEvidences": serialize_source_evidences(mission, by_key),
        "learning": serialize_learning(learning),
    }


def serialize_center_missions(startup):
    missions = sync_mission_catalog(startup)
    by_key = {mission.key: mission for mission in missions}
    recommended = select_recommended_mission(startup)
    cards = {
        mission.key: serialize_mission_card(mission, by_key=by_key)
        for mission in missions
    }
    recommended_card = None
    if recommended:
        recommended_card = serialize_mission_card(
            recommended,
            by_key=by_key,
            reason=recommendation_reason(recommended),
        )
    completed = [
        mission for mission in missions if mission.status == Mission.Status.COMPLETED
    ]
    available = [
        cards[mission.key]
        for mission in missions
        if mission.status == Mission.Status.AVAILABLE and mission != recommended
    ]
    locked = [
        cards[mission.key]
        for mission in missions
        if mission.status == Mission.Status.LOCKED
    ]
    return {
        "catalogVersion": CATALOG_VERSION,
        "arc": {
            "key": "discovery",
            "title": "Descoberta",
            "completed": len(completed),
            "total": len(missions),
            "progress": round((len(completed) / len(missions)) * 100)
            if missions
            else 0,
        },
        "recommendedMission": recommended_card,
        "availableMissions": available,
        "lockedMissions": locked,
        "completedMissions": [cards[mission.key] for mission in completed],
    }
