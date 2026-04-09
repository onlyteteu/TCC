from django.contrib.auth import get_user_model
from django.core import signing

AUTH_TOKEN_SALT = "startup-quest.auth"
AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

User = get_user_model()


def issue_auth_token(user) -> str:
    return signing.dumps({"uid": user.pk}, salt=AUTH_TOKEN_SALT)


def get_user_from_token(token: str):
    payload = signing.loads(
        token,
        salt=AUTH_TOKEN_SALT,
        max_age=AUTH_TOKEN_MAX_AGE_SECONDS,
    )
    return User.objects.get(pk=payload["uid"], is_active=True)

