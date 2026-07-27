import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q

from startups.mission_engine import sync_mission_catalog
from startups.models import Startup, ensure_journey

User = get_user_model()


class Command(BaseCommand):
    help = "Cria ou atualiza a conta e a startup dedicadas aos testes do produto."

    def add_arguments(self, parser):
        parser.add_argument("--email")
        parser.add_argument("--password")

    @transaction.atomic
    def handle(self, *args, **options):
        email = (
            options.get("email")
            or os.environ.get("TEST_WORKSPACE_EMAIL")
            or ""
        ).strip().lower()
        password = (
            options.get("password")
            or os.environ.get("TEST_WORKSPACE_PASSWORD")
            or ""
        )

        if not email or not password:
            raise CommandError(
                "Informe TEST_WORKSPACE_EMAIL e TEST_WORKSPACE_PASSWORD "
                "ou use --email e --password."
            )

        matching_users = User.objects.filter(
            Q(username__iexact=email) | Q(email__iexact=email)
        ).distinct()
        if matching_users.count() > 1:
            raise CommandError(
                "Mais de uma conta usa esse e-mail. Escolha um e-mail exclusivo."
            )

        user = matching_users.first()
        if user is not None and not Startup.objects.filter(
            owner=user,
            is_test_workspace=True,
        ).exists():
            raise CommandError(
                "A conta ja existe e nao pertence a um ambiente de teste. "
                "Escolha outro e-mail."
            )

        if user is None:
            user = User(
                username=email,
                email=email,
                first_name="Teste",
            )

        try:
            validate_password(password, user)
        except ValidationError as error:
            raise CommandError(
                "A senha do ambiente de teste nao atende aos requisitos: "
                + " ".join(error.messages)
            ) from error

        user.email = email
        user.first_name = "Teste"
        user.is_staff = True
        user.is_superuser = False
        user.set_password(password)
        user.save()

        startup = Startup.objects.filter(
            owner=user,
            is_test_workspace=True,
        ).first()
        if startup is None:
            startup = Startup.objects.create(
                owner=user,
                name="Startup de Teste",
                description=(
                    "Ambiente reiniciável para validar a jornada do Startup Quest."
                ),
                segment="Software",
                problem=(
                    "Pequenos negócios perdem tempo organizando tarefas e "
                    "decisões em ferramentas separadas."
                ),
                audience="Donos de pequenos negócios em fase de validação.",
                initial_goal="Validar o problema com clientes reais.",
                is_test_workspace=True,
            )
            ensure_journey(startup)
            sync_mission_catalog(startup)

        self.stdout.write(
            self.style.SUCCESS(
                f"Ambiente de teste pronto para {email} (startup {startup.pk})."
            )
        )
