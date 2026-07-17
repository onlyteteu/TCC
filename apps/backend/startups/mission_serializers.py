from .mission_engine import evaluate_mission
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


def locked_reasons(mission, by_key):
    return [
        f"Conclua: {by_key[key].title}"
        for key in mission.prerequisite_keys
        if key in by_key and by_key[key].status != Mission.Status.COMPLETED
    ]


def serialize_mission_card(mission, *, by_key, reason=None):
    evaluation = evaluate_mission(mission)
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
    card = serialize_mission_card(mission, by_key=by_key, reason=reason)
    evaluation = evaluate_mission(mission)
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
        "learning": serialize_learning(learning),
    }
