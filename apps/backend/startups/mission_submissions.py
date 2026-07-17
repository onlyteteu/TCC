from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

from .mission_engine import complete_mission_record, reconcile_mission_states
from .models import (
    ActivityEvent,
    JourneyStep,
    Mission,
    MissionEvidence,
    Startup,
    ensure_journey,
)

XP_PER_GENERIC_EVIDENCE = 25


class SubmissionValidationError(ValueError):
    def __init__(self, message, field_errors=None):
        super().__init__(message)
        self.message = message
        self.field_errors = field_errors or {}


@dataclass(frozen=True)
class SubmissionResult:
    title: str
    summary: str
    details: dict
    journey_key: str | None = None
    journey_answer: str = ""
    complete_journey_step: bool = False


@dataclass(frozen=True)
class SubmissionMutation:
    mission: Mission
    evidence: MissionEvidence
    evidence_created: bool
    completed_now: bool


def _required_text(payload, key, *, minimum, label, field_errors):
    value = (payload.get(key) or "").strip()
    if len(value) < minimum:
        field_errors[key] = [f"{label} deve ter pelo menos {minimum} caracteres."]
    return value


def _problem_refinement(payload):
    errors = {}
    problem = _required_text(
        payload,
        "problemStatement",
        minimum=40,
        label="O problema",
        field_errors=errors,
    )
    evidence = _required_text(
        payload,
        "evidenceSummary",
        minimum=40,
        label="A síntese das evidências",
        field_errors=errors,
    )
    if errors:
        raise SubmissionValidationError("Revise o problema refinado.", errors)
    return SubmissionResult(
        title="Problema refinado",
        summary=evidence,
        details={"problemStatement": problem, "evidenceSummary": evidence},
        journey_key=Startup.Stage.PROBLEM,
        journey_answer=problem,
    )


def _audience_validation(payload):
    errors = {}
    audience = _required_text(
        payload,
        "audienceStatement",
        minimum=30,
        label="O público prioritário",
        field_errors=errors,
    )
    signals = _required_text(
        payload,
        "observedSignals",
        minimum=40,
        label="Os sinais observados",
        field_errors=errors,
    )
    decision = (payload.get("decision") or "").strip()
    if decision not in {"keep", "adjust"}:
        errors["decision"] = ["Escolha manter ou ajustar o público."]
    if errors:
        raise SubmissionValidationError("Revise a validação do público.", errors)
    return SubmissionResult(
        title="Público prioritário validado",
        summary=signals,
        details={
            "audienceStatement": audience,
            "observedSignals": signals,
            "decision": decision,
        },
        journey_key=Startup.Stage.AUDIENCE,
        journey_answer=audience,
    )


def _value_proposition(payload):
    errors = {}
    value = _required_text(
        payload,
        "valueProposition",
        minimum=30,
        label="A proposta de valor",
        field_errors=errors,
    )
    rationale = _required_text(
        payload,
        "rationale",
        minimum=30,
        label="A justificativa",
        field_errors=errors,
    )
    if errors:
        raise SubmissionValidationError("Revise a proposta de valor.", errors)
    return SubmissionResult(
        title="Proposta de valor reformulada",
        summary=rationale,
        details={"valueProposition": value, "rationale": rationale},
        journey_key=Startup.Stage.VALUE,
        journey_answer=value,
        complete_journey_step=True,
    )


def _alternatives_map(payload):
    errors = {}
    alternatives = _required_text(
        payload,
        "alternatives",
        minimum=40,
        label="As alternativas",
        field_errors=errors,
    )
    limitations = _required_text(
        payload,
        "limitations",
        minimum=40,
        label="As limitações",
        field_errors=errors,
    )
    opportunity = _required_text(
        payload,
        "opportunity",
        minimum=30,
        label="A oportunidade",
        field_errors=errors,
    )
    if errors:
        raise SubmissionValidationError("Revise o mapa de alternativas.", errors)
    return SubmissionResult(
        title="Alternativas atuais mapeadas",
        summary=opportunity,
        details={
            "alternatives": alternatives,
            "limitations": limitations,
            "opportunity": opportunity,
        },
    )


VALIDATORS = {
    Mission.ActionType.PROBLEM_REFINEMENT: _problem_refinement,
    Mission.ActionType.AUDIENCE_VALIDATION: _audience_validation,
    Mission.ActionType.VALUE_PROPOSITION: _value_proposition,
    Mission.ActionType.ALTERNATIVES_MAP: _alternatives_map,
}


def _update_journey(startup, result):
    if result.journey_key is None:
        return
    ensure_journey(startup)
    step = startup.journey_steps.select_for_update().get(key=result.journey_key)
    step.answer = result.journey_answer
    step.save(update_fields=["answer", "updated_at"])

    if result.complete_journey_step and step.status == JourneyStep.Status.CURRENT:
        step.status = JourneyStep.Status.DONE
        step.completed_at = timezone.now()
        step.save(update_fields=["answer", "status", "completed_at", "updated_at"])
        next_step = (
            startup.journey_steps.select_for_update()
            .filter(
                status=JourneyStep.Status.PENDING,
                order__gt=step.order,
            )
            .order_by("order")
            .first()
        )
        if next_step:
            next_step.status = JourneyStep.Status.CURRENT
            next_step.save(update_fields=["status", "updated_at"])
            startup.current_stage = next_step.key
            startup.save(update_fields=["current_stage", "updated_at"])

    startup_field = {
        Startup.Stage.PROBLEM: "problem",
        Startup.Stage.AUDIENCE: "audience",
    }.get(result.journey_key)
    if startup_field:
        setattr(startup, startup_field, result.journey_answer)
        startup.save(update_fields=[startup_field, "updated_at"])


@transaction.atomic
def apply_mission_submission(startup, mission, payload):
    mission = Mission.objects.select_for_update().get(pk=mission.pk, startup=startup)
    existing = mission.evidences.filter(submission_key="primary").first()
    completed_with_evidence = (
        mission.status == Mission.Status.COMPLETED and existing is not None
    )
    if (
        completed_with_evidence
        and mission.action_type != Mission.ActionType.VALUE_PROPOSITION
    ):
        return SubmissionMutation(mission, existing, False, False)
    if mission.status == Mission.Status.LOCKED:
        raise SubmissionValidationError("Essa missão ainda está bloqueada.")
    if mission.action_type not in VALIDATORS:
        raise SubmissionValidationError("Essa missão não aceita este tipo de entrega.")

    result = VALIDATORS[mission.action_type](payload)
    if completed_with_evidence and result.details == existing.details:
        return SubmissionMutation(mission, existing, False, False)
    _update_journey(startup, result)
    evidence, created = MissionEvidence.objects.update_or_create(
        mission=mission,
        submission_key="primary",
        defaults={
            "evidence_type": MissionEvidence.Type.DOCUMENT,
            "title": result.title,
            "summary": result.summary,
            "details": result.details,
            "notes": result.summary,
            "occurred_on": timezone.localdate(),
        },
    )
    if created:
        ActivityEvent.objects.get_or_create(
            startup=startup,
            dedupe_key=f"mission_submission:{mission.pk}:primary",
            defaults={
                "kind": ActivityEvent.Kind.EVIDENCE_RECORDED,
                "description": f"Entregável registrado: {mission.title}",
                "xp_awarded": XP_PER_GENERIC_EVIDENCE,
                "metadata": {"missionKey": mission.key, "evidenceId": evidence.pk},
            },
        )
    if mission.started_at is None:
        mission.started_at = timezone.now()
        mission.status = Mission.Status.IN_PROGRESS
        mission.save(update_fields=["started_at", "status", "updated_at"])

    mission, completed_now = complete_mission_record(mission)
    reconcile_mission_states(startup)
    return SubmissionMutation(mission, evidence, created, completed_now)
