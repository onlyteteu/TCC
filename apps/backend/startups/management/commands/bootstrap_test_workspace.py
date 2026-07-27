import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

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

        user, _ = User.objects.get_or_create(
            username=email,
            defaults={"email": email},
        )
        user.email = email
        user.first_name = "Teste"
        user.is_staff = True
        user.is_superuser = False
        user.set_password(password)
        user.save(
            update_fields=[
                "email",
                "first_name",
                "is_staff",
                "is_superuser",
                "password",
            ]
        )

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
