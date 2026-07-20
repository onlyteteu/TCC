from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

from .mission_catalog import MISSION_DEFINITIONS
from .models import ActivityEvent, Mission


@dataclass(frozen=True)
class MissionEvaluation:
    progress: int
    requirements: list[dict]
    steps: list[dict]
    can_add_learning: bool
    can_complete: bool


class MissionRuleError(ValueError):
    pass


def ensure_interview_workflow_mission(mission):
    if (
        mission.action_type != Mission.ActionType.INTERVIEWS
        or mission.completion_rule
        != Mission.CompletionRule.INTERVIEWS_AND_LEARNING
    ):
        raise MissionRuleError(
            "Esta rota aceita apenas a missao de entrevistas e aprendizado."
        )


def reconcile_mission_states(startup):
    missions = list(startup.missions.order_by("order", "key"))
    by_key = {mission.key: mission for mission in missions}

    for mission in missions:
        if mission.status in {Mission.Status.IN_PROGRESS, Mission.Status.COMPLETED}:
            continue
        prerequisites_complete = all(
            by_key.get(key) is not None and by_key[key].status == Mission.Status.COMPLETED
            for key in mission.prerequisite_keys
        )
        desired = Mission.Status.AVAILABLE if prerequisites_complete else Mission.Status.LOCKED
        if mission.status != desired:
            mission.status = desired
            mission.save(update_fields=["status", "updated_at"])

    return list(startup.missions.order_by("order", "key"))


def sync_mission_catalog(startup):
    for definition in MISSION_DEFINITIONS:
        snapshot = definition.snapshot()
        mission, created = Mission.objects.get_or_create(
            startup=startup,
            key=definition.key,
            defaults={**snapshot, "status": Mission.Status.LOCKED},
        )
        may_refresh_snapshot = (
            not created
            and mission.started_at is None
            and mission.completed_at is None
            and mission.status in {Mission.Status.LOCKED, Mission.Status.AVAILABLE}
        )
        if may_refresh_snapshot:
            changed = []
            for field, value in snapshot.items():
                if getattr(mission, field) != value:
                    setattr(mission, field, value)
                    changed.append(field)
            if changed:
                mission.save(update_fields=[*changed, "updated_at"])

    return reconcile_mission_states(startup)


def evaluate_mission(mission):
    is_completed = mission.status == Mission.Status.COMPLETED
    if mission.completion_rule == Mission.CompletionRule.INTERVIEWS_AND_LEARNING:
        evidence_count = mission.evidences.filter(evidence_type="interview").count()
        learning_complete = mission.learnings.exists()
        interviews_complete = evidence_count >= mission.required_evidence_count
        total_units = max(mission.required_evidence_count, 1) + 1
        completed_units = min(evidence_count, mission.required_evidence_count) + int(
            learning_complete
        )
        steps = [
            {
                "key": "prepare",
                "title": "Prepare o roteiro",
                "description": "Use perguntas sobre situa\u00e7\u00f5es reais do passado.",
                "status": "completed" if evidence_count > 0 or is_completed else "current",
            },
            {
                "key": "interviews",
                "title": f"Registre {mission.required_evidence_count} entrevistas",
                "description": f"{evidence_count} de {mission.required_evidence_count} entrevistas conclu\u00eddas",
                "status": (
                    "completed"
                    if interviews_complete
                    else "current"
                    if evidence_count
                    else "available"
                ),
            },
            {
                "key": "learning",
                "title": "Resuma os padr\u00f5es",
                "description": (
                    "S\u00edntese registrada"
                    if learning_complete
                    else "Dispon\u00edvel ap\u00f3s registrar as entrevistas"
                ),
                "status": (
                    "completed"
                    if learning_complete
                    else "available"
                    if interviews_complete
                    else "locked"
                ),
            },
        ]
        return MissionEvaluation(
            progress=round((completed_units / total_units) * 100),
            requirements=[
                {
                    "key": "interviews",
                    "label": f"{mission.required_evidence_count} entrevistas registradas",
                    "current": evidence_count,
                    "target": mission.required_evidence_count,
                    "completed": interviews_complete,
                },
                {
                    "key": "learning",
                    "label": "S\u00edntese de aprendizado registrada",
                    "current": int(learning_complete),
                    "target": 1,
                    "completed": learning_complete,
                },
            ],
            steps=steps,
            can_add_learning=(
                interviews_complete and not learning_complete and not is_completed
            ),
            can_complete=interviews_complete and learning_complete and not is_completed,
        )

    if mission.completion_rule == Mission.CompletionRule.PRIMARY_SUBMISSION:
        has_submission = mission.evidences.filter(submission_key="primary").exists()
        steps = [
            {
                **step,
                "status": "completed" if has_submission or is_completed else "current",
            }
            for step in mission.step_blueprint
        ]
        return MissionEvaluation(
            progress=100 if has_submission or is_completed else 0,
            requirements=[
                {
                    "key": "submission",
                    "label": "Entreg\u00e1vel principal registrado",
                    "current": int(has_submission),
                    "target": 1,
                    "completed": has_submission,
                }
            ],
            steps=steps,
            can_add_learning=False,
            can_complete=has_submission and not is_completed,
        )

    raise MissionRuleError(f"Regra de conclusao desconhecida: {mission.completion_rule}")


def select_recommended_mission(startup):
    sync_mission_catalog(startup)
    ordered = startup.missions.order_by("priority", "order", "key")
    return (
        ordered.filter(status=Mission.Status.IN_PROGRESS).first()
        or ordered.filter(status=Mission.Status.AVAILABLE, is_required=True).first()
        or ordered.filter(status=Mission.Status.AVAILABLE).first()
    )


def recommendation_reason(mission):
    if mission.status == Mission.Status.IN_PROGRESS:
        return "Continue esta miss\u00e3o porque ela j\u00e1 est\u00e1 em andamento."
    if mission.prerequisite_keys:
        return "Esta \u00e9 a pr\u00f3xima etapa liberada pela sua trilha."
    return "Comece por evid\u00eancias reais antes de avan\u00e7ar para a solu\u00e7\u00e3o."


@transaction.atomic
def complete_mission_record(mission):
    mission = Mission.objects.select_for_update().get(pk=mission.pk)
    if mission.status == Mission.Status.COMPLETED:
        return mission, False
    if mission.status == Mission.Status.LOCKED:
        raise MissionRuleError("Essa miss\u00e3o ainda est\u00e1 bloqueada.")

    evaluation = evaluate_mission(mission)
    if not evaluation.can_complete:
        raise MissionRuleError(
            "A miss\u00e3o ainda precisa de evid\u00eancias antes de ser conclu\u00edda."
        )

    mission.status = Mission.Status.COMPLETED
    mission.completed_at = timezone.now()
    mission.save(update_fields=["status", "completed_at", "updated_at"])
    ActivityEvent.objects.get_or_create(
        startup=mission.startup,
        dedupe_key=f"mission_completed:{mission.pk}",
        defaults={
            "kind": ActivityEvent.Kind.MISSION_COMPLETED,
            "description": f"Miss\u00e3o conclu\u00edda: {mission.title}",
            "xp_awarded": mission.xp_reward,
            "metadata": {"missionKey": mission.key},
        },
    )
    reconcile_mission_states(mission.startup)
    return mission, True
