import json

from django.contrib.auth import get_user_model
from django.core import signing
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from accounts.tokens import get_user_from_token

from .models import Startup

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
        "currentStage": startup.current_stage,
        "currentStageLabel": startup.get_current_stage_display(),
        "initialGoal": startup.initial_goal,
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


@require_GET
def list_startups(request):
    try:
        user = _authenticate_request(request)
    except (PermissionError, User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    startups = Startup.objects.filter(owner=user)
    return JsonResponse({"startups": [_serialize_startup(startup) for startup in startups]})


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

    name = (payload.get("name") or "").strip()
    defer_naming = bool(payload.get("deferNaming"))
    field_errors = {}

    if not name and not defer_naming:
        field_errors["name"] = ["Informe o nome da startup ou marque que vai definir isso depois."]
    elif len(name) > 120:
        field_errors["name"] = ["Use um nome com ate 120 caracteres."]

    if field_errors:
        return _error_response(
            "Revise os dados da startup antes de continuar.",
            field_errors=field_errors,
        )

    startup = Startup.objects.create(
        owner=user,
        name=name or _build_deferred_name(user),
    )

    message = (
        "Startup criada. Voce pode definir o nome com calma depois."
        if defer_naming and not name
        else "Startup criada com sucesso."
    )

    return JsonResponse(
        {
            "message": message,
            "startup": _serialize_startup(startup),
        },
        status=201,
    )
