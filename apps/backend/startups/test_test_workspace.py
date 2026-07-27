from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.tokens import issue_auth_token

from .mission_engine import sync_mission_catalog
from .models import (
    ActivityEvent,
    JourneyStep,
    Learning,
    Mission,
    MissionEvidence,
    Startup,
    ensure_journey,
)

User = get_user_model()


class TestWorkspaceCapabilityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test-owner@example.com",
            email="test-owner@example.com",
            password="test-password",
        )

    def today(self, startup):
        return self.client.get(
            f"/api/startups/{startup.pk}/today/",
            HTTP_AUTHORIZATION=f"Bearer {issue_auth_token(self.user)}",
        )

    def test_regular_startup_is_not_a_test_workspace_by_default(self):
        startup = Startup.objects.create(owner=self.user, name="Comum")

        self.assertFalse(startup.is_test_workspace)

    def test_today_allows_staff_owner_to_reset_test_workspace(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        startup = Startup.objects.create(
            owner=self.user,
            name="Startup de Teste",
            is_test_workspace=True,
        )

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": True})

    def test_today_denies_regular_owner_even_for_test_workspace(self):
        startup = Startup.objects.create(
            owner=self.user,
            name="Startup de Teste",
            is_test_workspace=True,
        )

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": False})

    def test_today_denies_staff_owner_for_regular_startup(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        startup = Startup.objects.create(owner=self.user, name="Comum")

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": False})


class TestWorkspaceResetServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="reset-owner@example.com",
            email="reset-owner@example.com",
            password="test-password",
        )
        self.startup = Startup.objects.create(
            owner=self.user,
            name="Startup de Teste",
            description="Ambiente reiniciável.",
            segment="SaaS",
            problem="Pequenos negócios perdem decisões.",
            audience="Donos de pequenos negócios.",
            initial_goal="Validar o problema.",
            current_stage=Startup.Stage.DIFFERENTIATORS,
            is_test_workspace=True,
        )
        ensure_journey(self.startup)
        sync_mission_catalog(self.startup)

        JourneyStep.objects.filter(
            startup=self.startup,
            key=Startup.Stage.VALUE,
        ).update(
            answer="Valor construído durante o teste.",
            status=JourneyStep.Status.DONE,
        )
        self.mission = self.startup.missions.get(key="customer_interviews_5")
        self.mission.status = Mission.Status.IN_PROGRESS
        self.mission.save(update_fields=["status", "updated_at"])
        self.evidence = MissionEvidence.objects.create(
            mission=self.mission,
            evidence_type=MissionEvidence.Type.INTERVIEW,
            interviewee_name="Cliente 01",
            context="Conversa de teste.",
            notes="Sinal observado.",
        )
        Learning.objects.create(
            startup=self.startup,
            mission=self.mission,
            content="Padrão de teste.",
            impact="Mudança de teste.",
            next_action="Próxima ação de teste.",
        )
        ActivityEvent.objects.create(
            startup=self.startup,
            kind=ActivityEvent.Kind.INTERVIEW_RECORDED,
            description="Entrevista registrada.",
            xp_awarded=10,
            dedupe_key="test-event",
        )

    def derived_counts(self):
        return {
            "activities": ActivityEvent.objects.filter(startup=self.startup).count(),
            "evidences": MissionEvidence.objects.filter(
                mission__startup=self.startup
            ).count(),
            "journey_steps": JourneyStep.objects.filter(startup=self.startup).count(),
            "learnings": Learning.objects.filter(startup=self.startup).count(),
            "missions": Mission.objects.filter(startup=self.startup).count(),
        }

    def test_reset_preserves_startup_and_rebuilds_first_mission_baseline(self):
        from .test_workspace import reset_test_workspace

        original_id = self.startup.pk

        reset_startup = reset_test_workspace(startup_id=self.startup.pk)

        reset_startup.refresh_from_db()
        self.assertEqual(reset_startup.pk, original_id)
        self.assertEqual(
            {
                "name": reset_startup.name,
                "description": reset_startup.description,
                "segment": reset_startup.segment,
                "problem": reset_startup.problem,
                "audience": reset_startup.audience,
                "initial_goal": reset_startup.initial_goal,
            },
            {
                "name": "Startup de Teste",
                "description": "Ambiente reiniciável.",
                "segment": "SaaS",
                "problem": "Pequenos negócios perdem decisões.",
                "audience": "Donos de pequenos negócios.",
                "initial_goal": "Validar o problema.",
            },
        )
        self.assertEqual(reset_startup.current_stage, Startup.Stage.VALUE)
        self.assertEqual(reset_startup.journey_steps.count(), 8)
        self.assertEqual(
            reset_startup.journey_steps.filter(status=JourneyStep.Status.DONE).count(),
            2,
        )
        self.assertEqual(reset_startup.missions.count(), 5)
        self.assertEqual(
            reset_startup.missions.get(key="customer_interviews_5").status,
            Mission.Status.AVAILABLE,
        )
        self.assertFalse(
            MissionEvidence.objects.filter(mission__startup=reset_startup).exists()
        )
        self.assertFalse(Learning.objects.filter(startup=reset_startup).exists())
        self.assertFalse(ActivityEvent.objects.filter(startup=reset_startup).exists())

    def test_reset_rolls_back_every_deletion_when_catalog_rebuild_fails(self):
        from .test_workspace import reset_test_workspace

        before = self.derived_counts()

        with patch(
            "startups.test_workspace.sync_mission_catalog",
            side_effect=RuntimeError("catalog unavailable"),
        ):
            with self.assertRaisesRegex(RuntimeError, "catalog unavailable"):
                reset_test_workspace(startup_id=self.startup.pk)

        self.assertEqual(self.derived_counts(), before)
        self.assertTrue(
            MissionEvidence.objects.filter(pk=self.evidence.pk).exists()
        )


class TestWorkspaceResetApiTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="staff-owner@example.com",
            email="staff-owner@example.com",
            password="test-password",
            is_staff=True,
        )
        self.token = issue_auth_token(self.owner)
        self.startup = Startup.objects.create(
            owner=self.owner,
            name="Startup de Teste",
            problem="Problema preservado.",
            audience="Público preservado.",
            is_test_workspace=True,
        )
        ensure_journey(self.startup)
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        mission.status = Mission.Status.IN_PROGRESS
        mission.save(update_fields=["status", "updated_at"])
        MissionEvidence.objects.create(
            mission=mission,
            evidence_type=MissionEvidence.Type.INTERVIEW,
            interviewee_name="Cliente 01",
            notes="Evidência a remover.",
        )
        Learning.objects.create(
            startup=self.startup,
            mission=mission,
            content="Aprendizado a remover.",
            impact="Impacto.",
            next_action="Ação.",
        )
        ActivityEvent.objects.create(
            startup=self.startup,
            kind=ActivityEvent.Kind.INTERVIEW_RECORDED,
            description="Entrevista registrada.",
            xp_awarded=10,
            dedupe_key="api-test-event",
        )

    def post_reset(self, *, startup=None, token=None, confirmation="RESET_TEST_WORKSPACE"):
        target = startup or self.startup
        credentials = token if token is not None else self.token
        return self.client.post(
            f"/api/startups/{target.pk}/test-reset/",
            data={"confirmation": confirmation},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {credentials}",
        )

    def test_reset_requires_authentication(self):
        response = self.client.post(
            f"/api/startups/{self.startup.pk}/test-reset/",
            data={"confirmation": "RESET_TEST_WORKSPACE"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)

    def test_reset_hides_another_owners_startup(self):
        other = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="test-password",
            is_staff=True,
        )

        response = self.post_reset(token=issue_auth_token(other))

        self.assertEqual(response.status_code, 404)

    def test_reset_rejects_regular_owner(self):
        regular = User.objects.create_user(
            username="regular@example.com",
            email="regular@example.com",
            password="test-password",
        )
        startup = Startup.objects.create(
            owner=regular,
            name="Teste sem permissão",
            is_test_workspace=True,
        )

        response = self.post_reset(
            startup=startup,
            token=issue_auth_token(regular),
        )

        self.assertEqual(response.status_code, 403)

    def test_reset_rejects_regular_startup_even_for_staff_owner(self):
        startup = Startup.objects.create(owner=self.owner, name="Startup comum")

        response = self.post_reset(startup=startup)

        self.assertEqual(response.status_code, 403)

    def test_reset_requires_exact_confirmation(self):
        response = self.post_reset(confirmation="reset")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["message"],
            "Confirme explicitamente o reinício do ambiente de teste.",
        )

    def test_reset_rejects_invalid_json(self):
        response = self.client.post(
            f"/api/startups/{self.startup.pk}/test-reset/",
            data="{",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["message"],
            "Nao foi possivel interpretar a requisicao.",
        )

    def test_reset_returns_first_mission_payload_and_foundation_xp(self):
        response = self.post_reset()

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(
            payload["message"],
            "Ambiente de teste reiniciado na primeira missão.",
        )
        self.assertEqual(payload["startup"]["id"], self.startup.pk)
        self.assertEqual(payload["mission"]["key"], "customer_interviews_5")
        self.assertEqual(payload["mission"]["status"], Mission.Status.AVAILABLE)
        self.assertEqual(payload["mission"]["evidenceCount"], 0)
        self.assertEqual(payload["gamification"]["xp"], 200)
        self.assertEqual(payload["recentActivities"], [])
        self.assertEqual(payload["testWorkspace"], {"canReset": True})

    def test_reset_is_repeatable_without_catalog_duplicates(self):
        first_response = self.post_reset()
        second_response = self.post_reset()

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(self.startup.missions.count(), 5)
        self.assertEqual(
            self.startup.missions.filter(key="customer_interviews_5").count(),
            1,
        )
