import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import signing
from django.db import transaction
from django.db.models import F, Sum
from django.http import JsonResponse
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from django.utils import timezone

from accounts.tokens import get_user_from_token

from .mission_engine import (
    MissionRuleError,
    complete_mission_record,
    recommendation_reason,
    select_recommended_mission,
    sync_mission_catalog,
)
from .mission_serializers import serialize_mission_detail
from .models import (
    ActivityEvent,
    JourneyStep,
    Learning,
    Mission,
    MissionEvidence,
    Startup,
    ensure_journey,
)

DEFERRED_STARTUP_NAME = "Startup sem nome"
User = get_user_model()


def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise ValueError("Nao foi possivel interpretar a requisicao.")


def _error_response(message, *, status=400, field_errors=None):
    payload = {"message": message}
    if field_errors:
        payload["fieldErrors"] = field_errors
    return JsonResponse(payload, status=status)


def _extract_token(request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header.replace("Bearer ", "", 1).strip()


def _authenticate_request(request):
    token = _extract_token(request)
    if token is None:
        raise PermissionError

    return get_user_from_token(token)


def _serialize_startup(startup):
    return {
        "id": startup.pk,
        "name": startup.name,
        "description": startup.description,
        "segment": startup.segment,
        "problem": startup.problem,
        "audience": startup.audience,
        "currentStage": startup.current_stage,
        "currentStageLabel": startup.get_current_stage_display(),
        "initialGoal": startup.initial_goal,
        "lastOpenedAt": startup.last_opened_at.isoformat() if startup.last_opened_at else None,
        "createdAt": startup.created_at.isoformat(),
        "updatedAt": startup.updated_at.isoformat(),
    }


def _build_deferred_name(user):
    existing_names = {
        value.lower()
        for value in Startup.objects.filter(owner=user, name__istartswith=DEFERRED_STARTUP_NAME).values_list(
            "name",
            flat=True,
        )
    }

    if DEFERRED_STARTUP_NAME.lower() not in existing_names:
        return DEFERRED_STARTUP_NAME

    suffix = 2
    while f"{DEFERRED_STARTUP_NAME} {suffix}".lower() in existing_names:
        suffix += 1

    return f"{DEFERRED_STARTUP_NAME} {suffix}"


def _clean_text(payload, key):
    return (payload.get(key) or "").strip()


XP_PER_STEP = 100
XP_PER_LEVEL = 300

FOUNDATION_STEPS = 2  # problema e publico ja nascem concluidos na fundacao

XP_PER_INTERVIEW = 10
XP_PER_LEARNING = 25


def _build_streak(events):
    activity_dates = sorted(
        {
            timezone.localtime(occurred_at).date()
            for occurred_at in events.values_list("occurred_at", flat=True)
        }
    )

    if not activity_dates:
        return {
            "currentStreak": 0,
            "longestStreak": 0,
            "streakStatus": "inactive",
            "lastActivityDate": None,
        }

    longest = 1
    run = 1
    for previous, current in zip(activity_dates, activity_dates[1:]):
        if current == previous + timedelta(days=1):
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    today = timezone.localdate()
    last_activity = activity_dates[-1]

    if last_activity == today:
        status = "maintained"
        current_streak = 1
    elif last_activity == today - timedelta(days=1):
        status = "at_risk"
        current_streak = 1
    else:
        status = "broken"
        current_streak = 0

    if current_streak:
        cursor = last_activity
        activity_set = set(activity_dates)
        while cursor - timedelta(days=1) in activity_set:
            current_streak += 1
            cursor -= timedelta(days=1)

    return {
        "currentStreak": current_streak,
        "longestStreak": longest,
        "streakStatus": status,
        "lastActivityDate": last_activity.isoformat(),
    }


def _ordered_startups_for_user(user):
    return Startup.objects.filter(owner=user).order_by(
        F("last_opened_at").desc(nulls_last=True),
        "-updated_at",
        "-created_at",
        "-pk",
    )


def _last_activity_at(startup):
    event = startup.activity_events.order_by("-occurred_at").first()
    return event.occurred_at.isoformat() if event else startup.updated_at.isoformat()


def _build_account_progress(startups_with_steps):
    """Calcula progresso a partir da jornada e de atividades significativas."""
    total_done = sum(done for _, done, _ in startups_with_steps)
    named_any = any(
        not startup.name.lower().startswith("startup sem nome")
        for startup, _, _ in startups_with_steps
    )
    progresses = [progress for _, _, progress in startups_with_steps]

    startup_ids = [startup.pk for startup, _, _ in startups_with_steps]
    activity_events = ActivityEvent.objects.filter(startup_id__in=startup_ids)
    activity_xp = activity_events.aggregate(total=Sum("xp_awarded"))["total"] or 0
    xp = total_done * XP_PER_STEP + activity_xp
    level = 1 + xp // XP_PER_LEVEL

    interview_count = MissionEvidence.objects.filter(
        mission__startup_id__in=startup_ids,
        evidence_type=MissionEvidence.Type.INTERVIEW,
    ).count()
    learning_count = Learning.objects.filter(startup_id__in=startup_ids).count()
    completed_missions = Mission.objects.filter(
        startup_id__in=startup_ids,
        status=Mission.Status.COMPLETED,
    ).count()
    streak = _build_streak(activity_events)

    achievements = [
        {
            "key": "founder",
            "title": "Fundacao",
            "description": "Criou a primeira startup na plataforma.",
            "unlocked": len(startups_with_steps) > 0,
        },
        {
            "key": "named",
            "title": "Batismo",
            "description": "Deu nome a uma startup.",
            "unlocked": named_any,
        },
        {
            "key": "first_door",
            "title": "Primeira porta",
            "description": "Concluiu uma etapa alem da fundacao.",
            "unlocked": any(done > FOUNDATION_STEPS for _, done, _ in startups_with_steps),
        },
        {
            "key": "halfway",
            "title": "Meio caminho",
            "description": "Levou uma startup a 50% da jornada.",
            "unlocked": any(progress >= 50 for progress in progresses),
        },
        {
            "key": "complete",
            "title": "Jornada completa",
            "description": "Concluiu as 8 etapas de uma startup.",
            "unlocked": any(progress >= 100 for progress in progresses),
        },
        {
            "key": "first_interview",
            "title": "Primeira escuta",
            "description": "Registrou a primeira entrevista com um potencial cliente.",
            "unlocked": interview_count >= 1,
            "progress": min(interview_count, 1),
            "target": 1,
        },
        {
            "key": "five_interviews",
            "title": "Ouvidos abertos",
            "description": "Registrou cinco entrevistas com potenciais clientes.",
            "unlocked": interview_count >= 5,
            "progress": min(interview_count, 5),
            "target": 5,
        },
        {
            "key": "first_learning",
            "title": "Sinal encontrado",
            "description": "Transformou evidencias em um aprendizado registrado.",
            "unlocked": learning_count >= 1,
            "progress": min(learning_count, 1),
            "target": 1,
        },
        {
            "key": "first_mission",
            "title": "Missao cumprida",
            "description": "Concluiu a primeira missao guiada da startup.",
            "unlocked": completed_missions >= 1,
            "progress": min(completed_missions, 1),
            "target": 1,
        },
        {
            "key": "three_day_streak",
            "title": "Ritmo de fundador",
            "description": "Manteve tres dias seguidos de atividade significativa.",
            "unlocked": streak["longestStreak"] >= 3,
            "progress": min(streak["longestStreak"], 3),
            "target": 3,
        },
    ]

    return {
        "xp": xp,
        "level": level,
        "xpIntoLevel": xp % XP_PER_LEVEL,
        "xpPerLevel": XP_PER_LEVEL,
        "achievements": achievements,
        "unlockedCount": sum(1 for item in achievements if item["unlocked"]),
        **streak,
    }


@require_GET
def list_startups(request):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startups = list(_ordered_startups_for_user(user))

    payload = []
    startups_with_steps = []
    for startup in startups:
        ensure_journey(startup)
        steps = list(startup.journey_steps.all())
        done_count = sum(1 for step in steps if step.status == JourneyStep.Status.DONE)
        progress = round((done_count / len(steps)) * 100) if steps else 0
        current = next(
            (step for step in steps if step.status == JourneyStep.Status.CURRENT), None
        )

        serialized = _serialize_startup(startup)
        serialized["lastActivityAt"] = _last_activity_at(startup)
        serialized["journeyProgress"] = progress
        serialized["nextStepLabel"] = current.get_key_display() if current else None
        payload.append(serialized)
        startups_with_steps.append((startup, done_count, progress))

    return JsonResponse(
        {
            "startups": payload,
            "accountProgress": _build_account_progress(startups_with_steps),
        }
    )


@csrf_exempt
@require_POST
def open_startup(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    startup.last_opened_at = timezone.now()
    startup.save(update_fields=["last_opened_at"])
    return JsonResponse(
        {
            "message": f"{startup.name} agora e a startup ativa.",
            "startup": _serialize_startup(startup),
        }
    )


@csrf_exempt
@require_POST
def create_startup(request):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    name = _clean_text(payload, "name")
    defer_naming = bool(payload.get("deferNaming"))
    description = _clean_text(payload, "description")
    segment = _clean_text(payload, "segment")
    problem = _clean_text(payload, "problem")
    audience = _clean_text(payload, "audience")
    field_errors = {}

    if not name and not defer_naming:
        field_errors["name"] = ["Informe o nome da startup ou marque que vai definir isso depois."]
    elif len(name) > 120:
        field_errors["name"] = ["Use um nome com ate 120 caracteres."]

    required_fields = {
        "description": (description, "Conte a ideia da startup em uma frase."),
        "segment": (segment, "Escolha o segmento inicial da startup."),
        "problem": (problem, "Descreva a dor que essa startup quer resolver."),
        "audience": (audience, "Descreva quem sente essa dor primeiro."),
    }

    for field_name, (value, message) in required_fields.items():
        if not value:
            field_errors[field_name] = [message]

    if len(segment) > 120:
        field_errors["segment"] = ["Use um segmento com ate 120 caracteres."]

    if field_errors:
        return _error_response(
            "Revise o mapa inicial da startup antes de continuar.",
            field_errors=field_errors,
        )

    startup = Startup.objects.create(
        owner=user,
        name=name or _build_deferred_name(user),
        description=description,
        segment=segment,
        problem=problem,
        audience=audience,
        last_opened_at=timezone.now(),
    )
    ensure_journey(startup)
    sync_mission_catalog(startup)

    message = (
        "Mapa inicial criado. Voce pode definir o nome com calma depois."
        if defer_naming and not name
        else "Mapa inicial da startup criado com sucesso."
    )

    return JsonResponse(
        {
            "message": message,
            "startup": _serialize_startup(startup),
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "DELETE", "PATCH"])
def startup_detail(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()

    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    if request.method == "GET":
        return JsonResponse({"startup": _serialize_startup(startup)})

    if request.method == "DELETE":
        return _delete_startup(startup, startup_id, user)

    return _update_startup(request, startup)


def _delete_startup(startup, startup_id, user):
    startup_name = startup.name
    startup.delete()
    next_startup = _ordered_startups_for_user(user).first()

    return JsonResponse(
        {
            "deletedStartupId": startup_id,
            "nextStartupId": next_startup.pk if next_startup else None,
            "message": f'{startup_name} foi excluida com sucesso.',
        }
    )


UPDATABLE_FIELDS = ("name", "description", "segment", "problem", "audience", "initialGoal")

MODEL_FIELD_BY_PAYLOAD_FIELD = {
    "name": "name",
    "description": "description",
    "segment": "segment",
    "problem": "problem",
    "audience": "audience",
    "initialGoal": "initial_goal",
}


def _update_startup(request, startup):
    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    provided_fields = [field for field in UPDATABLE_FIELDS if field in payload]

    if not provided_fields:
        return _error_response("Nenhum campo para atualizar foi informado.")

    field_errors = {}
    cleaned = {field: _clean_text(payload, field) for field in provided_fields}

    if "name" in cleaned:
        if not cleaned["name"]:
            field_errors["name"] = ["Informe um nome para a startup."]
        elif len(cleaned["name"]) > 120:
            field_errors["name"] = ["Use um nome com ate 120 caracteres."]

    if "segment" in cleaned and len(cleaned["segment"]) > 120:
        field_errors["segment"] = ["Use um segmento com ate 120 caracteres."]

    if "initialGoal" in cleaned and len(cleaned["initialGoal"]) > 255:
        field_errors["initialGoal"] = ["Use uma meta inicial com ate 255 caracteres."]

    for field in ("description", "problem", "audience"):
        if field in cleaned and not cleaned[field]:
            field_errors[field] = ["Esse campo nao pode ficar vazio."]

    if field_errors:
        return _error_response(
            "Revise os campos antes de salvar.",
            field_errors=field_errors,
        )

    model_fields = []
    for field, value in cleaned.items():
        model_field = MODEL_FIELD_BY_PAYLOAD_FIELD[field]
        setattr(startup, model_field, value)
        model_fields.append(model_field)

    startup.save(update_fields=[*model_fields, "updated_at"])

    # Problema e publico tambem vivem como etapas da jornada; manter as respostas em sincronia.
    stage_by_field = {"problem": Startup.Stage.PROBLEM, "audience": Startup.Stage.AUDIENCE}
    for field, stage_key in stage_by_field.items():
        if field in cleaned:
            startup.journey_steps.filter(key=stage_key).update(answer=cleaned[field])

    return JsonResponse(
        {
            "message": f"{startup.name} foi atualizada com sucesso.",
            "startup": _serialize_startup(startup),
        }
    )


def _serialize_step(step):
    return {
        "key": step.key,
        "title": step.get_key_display(),
        "status": step.status,
        "answer": step.answer,
        "order": step.order,
        "completedAt": step.completed_at.isoformat() if step.completed_at else None,
    }


def _serialize_activity(event):
    return {
        "id": event.pk,
        "kind": event.kind,
        "kindLabel": event.get_kind_display(),
        "description": event.description,
        "xpAwarded": event.xp_awarded,
        "metadata": event.metadata,
        "occurredAt": event.occurred_at.isoformat(),
    }


def _startups_with_journey(user):
    startups_with_steps = []
    for candidate in Startup.objects.filter(owner=user):
        ensure_journey(candidate)
        steps = list(candidate.journey_steps.all())
        done_count = sum(1 for step in steps if step.status == JourneyStep.Status.DONE)
        progress = round((done_count / len(steps)) * 100) if steps else 0
        startups_with_steps.append((candidate, done_count, progress))
    return startups_with_steps


def _today_payload(user, startup, *, message=None, celebration=None):
    ensure_journey(startup)
    mission = select_recommended_mission(startup)
    missions = list(startup.missions.order_by("priority", "order", "key"))
    by_key = {item.key: item for item in missions}

    journey_steps = list(startup.journey_steps.all())
    done_count = sum(1 for step in journey_steps if step.status == JourneyStep.Status.DONE)
    journey_progress = round((done_count / len(journey_steps)) * 100) if journey_steps else 0
    current_step = next(
        (step for step in journey_steps if step.status == JourneyStep.Status.CURRENT),
        None,
    )
    mission_payload = (
        serialize_mission_detail(
            mission,
            by_key=by_key,
            reason=recommendation_reason(mission),
        )
        if mission
        else None
    )
    arc_complete = len(missions) == 5 and all(
        item.status == Mission.Status.COMPLETED for item in missions
    )
    mission_state = (
        "active" if mission else "arc_complete" if arc_complete else "unavailable"
    )
    dependent = next(
        (
            candidate
            for candidate in missions
            if mission and mission.key in candidate.prerequisite_keys
        ),
        None,
    )
    if arc_complete or dependent is None:
        next_unlock = {
            "key": None,
            "title": "Pr\u00f3xima trilha",
            "description": "A pr\u00f3xima trilha ainda n\u00e3o foi liberada.",
            "available": False,
        }
    else:
        next_unlock = {
            "key": dependent.key,
            "title": dependent.title,
            "description": dependent.objective,
            "available": dependent.status == Mission.Status.AVAILABLE,
        }

    recent_activity = list(startup.activity_events.all()[:6])
    account_progress = _build_account_progress(_startups_with_journey(user))
    first_name = (user.first_name or "").strip() or user.email.split("@", 1)[0]

    payload = {
        "user": {"firstName": first_name},
        "startup": _serialize_startup(startup),
        "journey": {
            "progress": journey_progress,
            "completedSteps": done_count,
            "totalSteps": len(journey_steps),
            "currentStepKey": current_step.key if current_step else None,
            "currentStepLabel": current_step.get_key_display() if current_step else None,
        },
        "mission": mission_payload,
        "missionState": mission_state,
        "gamification": account_progress,
        "recentActivities": [_serialize_activity(event) for event in recent_activity],
        "nextUnlock": next_unlock,
    }

    if message:
        payload["message"] = message
    if celebration:
        payload["celebration"] = celebration
    return payload


def _journey_payload(startup, message=None):
    steps = list(startup.journey_steps.all())
    done_count = sum(1 for step in steps if step.status == JourneyStep.Status.DONE)
    payload = {
        "journey": [_serialize_step(step) for step in steps],
        "progress": round((done_count / len(steps)) * 100) if steps else 0,
        "startup": _serialize_startup(startup),
    }

    if message:
        payload["message"] = message

    return payload


@require_GET
def today(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    return JsonResponse(_today_payload(user, startup))


def _mission_for_startup(startup, mission_key, *, for_update=False):
    sync_mission_catalog(startup)
    missions = startup.missions
    if for_update:
        missions = missions.select_for_update()
    return missions.filter(key=mission_key).first()


@csrf_exempt
@require_POST
def mission_evidence(request, startup_id, mission_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    interviewee_name = _clean_text(payload, "intervieweeName")
    interviewee_profile = _clean_text(payload, "intervieweeProfile")
    context = _clean_text(payload, "context")
    notes = _clean_text(payload, "notes")
    occurred_on_value = _clean_text(payload, "occurredOn")
    occurred_on = parse_date(occurred_on_value) if occurred_on_value else timezone.localdate()
    field_errors = {}

    if not interviewee_name:
        field_errors["intervieweeName"] = ["Informe com quem voce conversou."]
    elif len(interviewee_name) > 120:
        field_errors["intervieweeName"] = ["Use ate 120 caracteres."]

    if len(interviewee_profile) > 180:
        field_errors["intervieweeProfile"] = ["Use ate 180 caracteres."]
    if len(context) > 300:
        field_errors["context"] = ["Use ate 300 caracteres."]
    if not notes:
        field_errors["notes"] = ["Registre o que a pessoa contou na entrevista."]
    elif len(notes) < 20:
        field_errors["notes"] = ["Inclua um pouco mais de contexto, com pelo menos 20 caracteres."]
    if occurred_on is None:
        field_errors["occurredOn"] = ["Use uma data valida."]
    elif occurred_on > timezone.localdate():
        field_errors["occurredOn"] = ["A entrevista nao pode estar no futuro."]

    if field_errors:
        return _error_response(
            "Revise a entrevista antes de registrar.",
            field_errors=field_errors,
        )

    with transaction.atomic():
        mission = _mission_for_startup(startup, mission_key, for_update=True)
        if mission is None:
            return _error_response("Missao nao encontrada.", status=404)
        if mission.status == Mission.Status.LOCKED:
            return _error_response("Essa missao ainda nao foi desbloqueada.", status=409)
        if mission.status == Mission.Status.COMPLETED:
            return _error_response(
                "Essa missao ja foi concluida. As evidencias continuam disponiveis para consulta.",
                status=409,
            )

        evidence = MissionEvidence.objects.create(
            mission=mission,
            evidence_type=MissionEvidence.Type.INTERVIEW,
            interviewee_name=interviewee_name,
            interviewee_profile=interviewee_profile,
            context=context,
            notes=notes,
            occurred_on=occurred_on,
        )

        if mission.status == Mission.Status.AVAILABLE:
            mission.status = Mission.Status.IN_PROGRESS
            mission.started_at = timezone.now()
            mission.save(update_fields=["status", "started_at", "updated_at"])

        ActivityEvent.objects.create(
            startup=startup,
            kind=ActivityEvent.Kind.INTERVIEW_RECORDED,
            description=f"Entrevista com {interviewee_name} registrada",
            xp_awarded=XP_PER_INTERVIEW,
            dedupe_key=f"mission_evidence:{evidence.pk}",
            metadata={"missionKey": mission.key, "evidenceId": evidence.pk},
        )

    return JsonResponse(
        _today_payload(
            user,
            startup,
            message=f"Entrevista registrada. Você ganhou {XP_PER_INTERVIEW} XP.",
        ),
        status=201,
    )


@csrf_exempt
@require_POST
def mission_learning(request, startup_id, mission_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    content = _clean_text(payload, "content")
    impact = _clean_text(payload, "impact")
    next_action = _clean_text(payload, "nextAction")
    confidence = _clean_text(payload, "confidence") or Learning.Confidence.MEDIUM
    field_errors = {}

    if not content:
        field_errors["content"] = ["Resuma o principal padrao encontrado."]
    if not impact:
        field_errors["impact"] = ["Explique o que esse aprendizado muda na startup."]
    if not next_action:
        field_errors["nextAction"] = ["Defina a proxima acao recomendada."]
    if confidence not in Learning.Confidence.values:
        field_errors["confidence"] = ["Escolha confianca baixa, media ou alta."]

    if field_errors:
        return _error_response(
            "Revise a sintese antes de registrar.",
            field_errors=field_errors,
        )

    with transaction.atomic():
        mission = _mission_for_startup(startup, mission_key, for_update=True)
        if mission is None:
            return _error_response("Missao nao encontrada.", status=404)
        if mission.status == Mission.Status.COMPLETED:
            return _error_response(
                "Essa missao ja foi concluida. O aprendizado pode ser consultado no historico.",
                status=409,
            )

        evidence_count = mission.evidences.count()
        if evidence_count < mission.required_evidence_count:
            missing = mission.required_evidence_count - evidence_count
            interview_label = "entrevista" if missing == 1 else "entrevistas"
            return _error_response(
                f"Registre mais {missing} {interview_label} antes de resumir os padrões.",
                status=409,
            )

        learning, created = Learning.objects.update_or_create(
            startup=startup,
            mission=mission,
            defaults={
                "content": content,
                "impact": impact,
                "next_action": next_action,
                "confidence": confidence,
            },
        )

        if created:
            ActivityEvent.objects.create(
                startup=startup,
                kind=ActivityEvent.Kind.LEARNING_RECORDED,
                description="Sintese das entrevistas registrada",
                xp_awarded=XP_PER_LEARNING,
                dedupe_key=f"mission_learning:{mission.pk}",
                metadata={"missionKey": mission.key, "learningId": learning.pk},
            )

    message = (
        f"Aprendizado registrado. Você ganhou {XP_PER_LEARNING} XP."
        if created
        else "Aprendizado atualizado."
    )
    return JsonResponse(_today_payload(user, startup, message=message), status=201 if created else 200)


@csrf_exempt
@require_POST
def complete_mission(request, startup_id, mission_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()
    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    mission = _mission_for_startup(startup, mission_key)
    if mission is None:
        return _error_response("Missao nao encontrada.", status=404)

    try:
        mission, completed_now = complete_mission_record(mission)
    except MissionRuleError as error:
        mission.refresh_from_db()
        missions = list(startup.missions.order_by("priority", "order", "key"))
        by_key = {item.key: item for item in missions}
        return JsonResponse(
            {
                "message": str(error),
                "mission": serialize_mission_detail(mission, by_key=by_key),
            },
            status=409,
        )

    if not completed_now:
        return JsonResponse(
            _today_payload(user, startup, message="Essa missao ja esta concluida.")
        )

    next_mission = select_recommended_mission(startup)
    return JsonResponse(
        _today_payload(
            user,
            startup,
            message=f"Miss\u00e3o conclu\u00edda. Voc\u00ea ganhou {mission.xp_reward} XP.",
            celebration={
                "title": "Miss\u00e3o cumprida",
                "xpAwarded": mission.xp_reward,
                "unlocked": next_mission.title if next_mission else "Arco concluido",
            },
        )
    )


@require_GET
def journey(request, startup_id):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()

    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    ensure_journey(startup)
    return JsonResponse(_journey_payload(startup))


@csrf_exempt
@require_http_methods(["PATCH"])
def journey_step(request, startup_id, step_key):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startup = Startup.objects.filter(owner=user, pk=startup_id).first()

    if startup is None:
        return _error_response("Startup nao encontrada.", status=404)

    ensure_journey(startup)
    step = startup.journey_steps.filter(key=step_key).first()

    if step is None:
        return _error_response("Etapa da jornada nao encontrada.", status=404)

    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    answer = (payload.get("answer") or "").strip()
    complete = bool(payload.get("complete"))

    if step.status == JourneyStep.Status.PENDING:
        return _error_response(
            "Essa porta ainda nao abriu. Conclua a etapa atual primeiro.",
            status=409,
        )

    if not answer:
        return _error_response(
            "Revise a resposta antes de salvar.",
            field_errors={"answer": ["A resposta dessa etapa nao pode ficar vazia."]},
        )

    step.answer = answer
    update_fields = ["answer", "updated_at"]
    message = "Resposta da etapa atualizada."
    completed_now = False

    if complete and step.status == JourneyStep.Status.CURRENT:
        completed_now = True
        step.status = JourneyStep.Status.DONE
        step.completed_at = timezone.now()
        update_fields += ["status", "completed_at"]
        message = f"{step.get_key_display()} concluida. A proxima porta abriu."

        next_step = (
            startup.journey_steps.filter(status=JourneyStep.Status.PENDING)
            .order_by("order")
            .first()
        )

        if next_step:
            next_step.status = JourneyStep.Status.CURRENT
            next_step.save(update_fields=["status", "updated_at"])
            startup.current_stage = next_step.key
        else:
            message = f"{step.get_key_display()} concluida. Jornada inicial completa!"
            startup.current_stage = step.key

        startup.save(update_fields=["current_stage", "updated_at"])

    step.save(update_fields=update_fields)

    if completed_now:
        ActivityEvent.objects.get_or_create(
            startup=startup,
            dedupe_key=f"journey_step_completed:{step.pk}",
            defaults={
                "kind": ActivityEvent.Kind.JOURNEY_STEP_COMPLETED,
                "description": f"Etapa concluida: {step.get_key_display()}",
                # Os 100 XP da etapa ja sao calculados a partir do JourneyStep.
                "xp_awarded": 0,
                "metadata": {"stepKey": step.key},
            },
        )

    # Problema e publico tambem vivem como campos da startup; manter em sincronia.
    field_by_stage = {Startup.Stage.PROBLEM: "problem", Startup.Stage.AUDIENCE: "audience"}
    if step.key in field_by_stage:
        setattr(startup, field_by_stage[step.key], answer)
        startup.save(update_fields=[field_by_stage[step.key], "updated_at"])

    return JsonResponse(_journey_payload(startup, message=message))
