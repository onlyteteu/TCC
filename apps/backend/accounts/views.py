import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .tokens import get_user_from_token, issue_auth_token

User = get_user_model()


def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise ValueError("Nao foi possivel interpretar a requisicao.")


def _user_payload(user):
    return {
        "id": user.pk,
        "name": user.first_name or user.username,
        "email": user.email,
    }


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


@csrf_exempt
@require_POST
def register_view(request):
    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or ""

    field_errors = {}

    if not name:
        field_errors["name"] = ["Informe seu nome."]
    elif len(name) > 150:
        field_errors["name"] = ["Use um nome com ate 150 caracteres."]

    if not email:
        field_errors["email"] = ["Informe seu e-mail."]
    else:
        try:
            validate_email(email)
        except ValidationError:
            field_errors["email"] = ["Informe um e-mail valido."]
        else:
            if User.objects.filter(username__iexact=email).exists():
                field_errors["email"] = ["Ja existe uma conta com este e-mail."]

    if not password:
        field_errors["password"] = ["Informe uma senha."]

    if password != confirm_password:
        field_errors["confirmPassword"] = ["A confirmacao de senha nao confere."]

    if field_errors:
        return _error_response(
            "Verifique os campos destacados e tente novamente.",
            field_errors=field_errors,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        first_name=name,
        password=password,
    )
    token = issue_auth_token(user)

    return JsonResponse(
        {
            "message": "Conta criada com sucesso. Sua jornada ja pode comecar.",
            "token": token,
            "user": _user_payload(user),
        },
        status=201,
    )


@csrf_exempt
@require_POST
def login_view(request):
    try:
        payload = _json_body(request)
    except ValueError as error:
        return _error_response(str(error))

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    field_errors = {}
    if not email:
        field_errors["email"] = ["Informe seu e-mail."]
    if not password:
        field_errors["password"] = ["Informe sua senha."]

    if field_errors:
        return _error_response(
            "Preencha os dados de acesso para continuar.",
            field_errors=field_errors,
        )

    user = authenticate(request, username=email, password=password)
    if user is None or not user.is_active:
        return _error_response(
            "Nao encontramos uma conta com este e-mail e senha.",
            status=401,
        )

    token = issue_auth_token(user)

    return JsonResponse(
        {
            "message": "Login realizado com sucesso.",
            "token": token,
            "user": _user_payload(user),
        }
    )


@require_GET
def current_user(request):
    token = _extract_token(request)
    if token is None:
        return _error_response("Sessao nao encontrada.", status=401)

    try:
        user = get_user_from_token(token)
    except (User.DoesNotExist, signing.BadSignature, signing.SignatureExpired):
        return _error_response("Sessao invalida ou expirada.", status=401)

    return JsonResponse({"authenticated": True, "user": _user_payload(user)})


@csrf_exempt
@require_POST
def logout_view(request):
    return JsonResponse({"message": "Sessao encerrada com sucesso."})
