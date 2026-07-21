from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from accounts.tokens import issue_auth_token

from .models import ActivityEvent, JourneyStep, Learning, Mission, MissionEvidence, Startup

User = get_user_model()


class StartupApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="startup-owner@example.com",
            email="startup-owner@example.com",
            first_name="Mateus",
            password="123",
        )
        self.token = issue_auth_token(self.user)

    def startup_payload(self, **overrides):
        payload = {
            "name": "Aurora Labs",
            "deferNaming": False,
            "description": "Um app que ajuda restaurantes pequenos a controlar estoque.",
            "segment": "Alimentacao",
            "problem": "Restaurantes pequenos compram ingrediente duplicado por falta de controle.",
            "audience": "Donos de restaurantes pequenos que usam caderno ou planilha.",
        }
        payload.update(overrides)
        return payload

    def test_create_marks_startup_as_opened(self):
        response = self.client.post(
            "/api/startups/create/",
            data=self.startup_payload(),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 201)
        startup = Startup.objects.get(pk=response.json()["startup"]["id"])
        self.assertIsNotNone(startup.last_opened_at)
        self.assertIsNotNone(response.json()["startup"]["lastOpenedAt"])

    def test_list_orders_startups_by_last_opened_at(self):
        now = timezone.now()
        older = Startup.objects.create(
            owner=self.user,
            name="Antiga",
            last_opened_at=now - timedelta(days=2),
        )
        recent = Startup.objects.create(
            owner=self.user,
            name="Recente",
            last_opened_at=now - timedelta(minutes=5),
        )

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in response.json()["startups"]],
            [recent.pk, older.pk],
        )

    def test_list_places_never_opened_startups_last(self):
        now = timezone.now()
        never_opened = Startup.objects.create(owner=self.user, name="Nunca aberta")
        opened = Startup.objects.create(
            owner=self.user,
            name="Aberta",
            last_opened_at=now - timedelta(days=30),
        )

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(
            [item["id"] for item in response.json()["startups"]],
            [opened.pk, never_opened.pk],
        )

    def test_list_uses_primary_key_as_final_order_tiebreaker(self):
        timestamp = timezone.now()
        first = Startup.objects.create(owner=self.user, name="Primeira", last_opened_at=timestamp)
        second = Startup.objects.create(owner=self.user, name="Segunda", last_opened_at=timestamp)
        Startup.objects.filter(pk__in=[first.pk, second.pk]).update(
            created_at=timestamp,
            updated_at=timestamp,
        )

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(
            [item["id"] for item in response.json()["startups"]],
            [second.pk, first.pk],
        )

    def test_list_uses_updated_at_when_there_is_no_activity_event(self):
        startup = Startup.objects.create(owner=self.user, name="Sem atividade")

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        startup.refresh_from_db()

        self.assertEqual(
            response.json()["startups"][0]["lastActivityAt"],
            startup.updated_at.isoformat(),
        )

    def test_owner_can_mark_startup_as_opened(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.post(
            f"/api/startups/{startup.pk}/open/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        startup.refresh_from_db()
        self.assertIsNotNone(startup.last_opened_at)
        self.assertEqual(response.json()["startup"]["id"], startup.pk)

    def test_user_cannot_mark_another_users_startup_as_opened(self):
        other_user = User.objects.create_user(
            username="open-other@example.com",
            email="open-other@example.com",
            password="123",
        )
        startup = Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.post(
            f"/api/startups/{startup.pk}/open/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_delete_returns_next_recent_startup(self):
        now = timezone.now()
        fallback = Startup.objects.create(
            owner=self.user,
            name="Fallback",
            last_opened_at=now - timedelta(hours=1),
        )
        active = Startup.objects.create(
            owner=self.user,
            name="Ativa",
            last_opened_at=now,
        )

        response = self.client.delete(
            f"/api/startups/{active.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["nextStartupId"], fallback.pk)

    def test_update_startup_accepts_initial_goal(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"initialGoal": "Validar o problema com cinco entrevistas."},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        startup.refresh_from_db()
        self.assertEqual(startup.initial_goal, "Validar o problema com cinco entrevistas.")
        self.assertEqual(
            response.json()["startup"]["initialGoal"],
            "Validar o problema com cinco entrevistas.",
        )

    def test_update_startup_accepts_initial_goal_at_model_limit(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")
        goal = "x" * 255

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"initialGoal": goal},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["startup"]["initialGoal"], goal)

    def test_update_startup_rejects_initial_goal_over_model_limit(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"initialGoal": "x" * 256},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("initialGoal", response.json()["fieldErrors"])

    def test_authenticated_user_can_list_only_own_startups(self):
        other_user = User.objects.create_user(
            username="other-owner@example.com",
            email="other-owner@example.com",
            first_name="Outro",
            password="123",
        )

        own_startup = Startup.objects.create(owner=self.user, name="Aurora Labs")
        Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["startups"]), 1)
        self.assertEqual(payload["startups"][0]["id"], own_startup.pk)
        self.assertEqual(payload["startups"][0]["name"], "Aurora Labs")

    def test_authenticated_user_can_create_named_startup(self):
        response = self.client.post(
            "/api/startups/create/",
            data=self.startup_payload(),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["startup"]["name"], "Aurora Labs")
        self.assertEqual(payload["startup"]["description"], self.startup_payload()["description"])
        self.assertEqual(payload["startup"]["segment"], "Alimentacao")
        self.assertEqual(payload["startup"]["problem"], self.startup_payload()["problem"])
        self.assertEqual(payload["startup"]["audience"], self.startup_payload()["audience"])
        self.assertEqual(Startup.objects.filter(owner=self.user, name="Aurora Labs").count(), 1)

    def test_authenticated_user_can_create_startup_without_name(self):
        response = self.client.post(
            "/api/startups/create/",
            data=self.startup_payload(
                name="",
                deferNaming=True,
            ),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["startup"]["name"], "Startup sem nome")
        self.assertEqual(Startup.objects.filter(owner=self.user, name="Startup sem nome").count(), 1)

    def test_create_startup_requires_name_when_defer_option_is_off(self):
        response = self.client.post(
            "/api/startups/create/",
            data={
                "name": "",
                "deferNaming": False,
                "description": self.startup_payload()["description"],
                "segment": self.startup_payload()["segment"],
                "problem": self.startup_payload()["problem"],
                "audience": self.startup_payload()["audience"],
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.json()["fieldErrors"])

    def test_create_startup_requires_onboarding_fields(self):
        response = self.client.post(
            "/api/startups/create/",
            data=self.startup_payload(
                description="",
                segment="",
                problem="",
                audience="",
            ),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        field_errors = response.json()["fieldErrors"]
        self.assertIn("description", field_errors)
        self.assertIn("segment", field_errors)
        self.assertIn("problem", field_errors)
        self.assertIn("audience", field_errors)

    def test_authenticated_user_can_delete_own_startup(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.delete(
            f"/api/startups/{startup.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["deletedStartupId"], startup.pk)
        self.assertFalse(Startup.objects.filter(pk=startup.pk).exists())

    def test_authenticated_user_can_fetch_own_startup(self):
        startup = Startup.objects.create(
            owner=self.user,
            name="Aurora Labs",
            description="Controle de estoque para restaurantes.",
        )

        response = self.client.get(
            f"/api/startups/{startup.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["startup"]["id"], startup.pk)
        self.assertEqual(payload["startup"]["name"], "Aurora Labs")
        self.assertEqual(payload["startup"]["description"], "Controle de estoque para restaurantes.")

    def test_user_cannot_fetch_startup_from_another_account(self):
        other_user = User.objects.create_user(
            username="other-owner-get@example.com",
            email="other-owner-get@example.com",
            first_name="Outro",
            password="123",
        )
        startup = Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.get(
            f"/api/startups/{startup.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_authenticated_user_can_rename_own_startup(self):
        startup = Startup.objects.create(owner=self.user, name="Startup sem nome")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"name": "Aurora Labs"},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["startup"]["name"], "Aurora Labs")
        startup.refresh_from_db()
        self.assertEqual(startup.name, "Aurora Labs")

    def test_update_startup_accepts_partial_fields(self):
        startup = Startup.objects.create(
            owner=self.user,
            name="Aurora Labs",
            description="Descricao antiga",
            segment="Alimentacao",
        )

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"description": "Descricao nova"},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        startup.refresh_from_db()
        self.assertEqual(startup.description, "Descricao nova")
        self.assertEqual(startup.name, "Aurora Labs")
        self.assertEqual(startup.segment, "Alimentacao")

    def test_update_startup_rejects_empty_name(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"name": "   "},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.json()["fieldErrors"])
        startup.refresh_from_db()
        self.assertEqual(startup.name, "Aurora Labs")

    def test_update_startup_rejects_payload_without_fields(self):
        startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)

    def test_user_cannot_update_startup_from_another_account(self):
        other_user = User.objects.create_user(
            username="other-owner-patch@example.com",
            email="other-owner-patch@example.com",
            first_name="Outro",
            password="123",
        )
        startup = Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.patch(
            f"/api/startups/{startup.pk}/",
            data={"name": "Invadida"},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 404)
        startup.refresh_from_db()
        self.assertEqual(startup.name, "AtlasPay")

    def test_user_cannot_delete_startup_from_another_account(self):
        other_user = User.objects.create_user(
            username="other-owner@example.com",
            email="other-owner@example.com",
            first_name="Outro",
            password="123",
        )
        startup = Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.delete(
            f"/api/startups/{startup.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(Startup.objects.filter(pk=startup.pk).exists())


class JourneyApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="journey-owner@example.com",
            email="journey-owner@example.com",
            first_name="Mateus",
            password="123",
        )
        self.token = issue_auth_token(self.user)

    def create_startup_via_api(self):
        response = self.client.post(
            "/api/startups/create/",
            data={
                "name": "Aurora Labs",
                "deferNaming": False,
                "description": "Controle de estoque para restaurantes.",
                "segment": "Alimentacao",
                "problem": "Compra duplicada de ingredientes.",
                "audience": "Donos de restaurantes pequenos.",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        return response.json()["startup"]["id"]

    def test_journey_is_seeded_on_startup_creation(self):
        startup_id = self.create_startup_via_api()
        steps = JourneyStep.objects.filter(startup_id=startup_id).order_by("order")

        self.assertEqual(steps.count(), 8)
        self.assertEqual(steps[0].key, Startup.Stage.PROBLEM)
        self.assertEqual(steps[0].status, JourneyStep.Status.DONE)
        self.assertEqual(steps[0].answer, "Compra duplicada de ingredientes.")
        self.assertEqual(steps[1].status, JourneyStep.Status.DONE)
        self.assertEqual(steps[2].key, Startup.Stage.VALUE)
        self.assertEqual(steps[2].status, JourneyStep.Status.CURRENT)
        self.assertEqual(
            Startup.objects.get(pk=startup_id).current_stage, Startup.Stage.VALUE
        )

    def test_journey_is_seeded_lazily_for_existing_startup(self):
        startup = Startup.objects.create(
            owner=self.user,
            name="Startup antiga",
            problem="Dor antiga.",
            audience="Publico antigo.",
        )

        response = self.client.get(
            f"/api/startups/{startup.pk}/journey/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["journey"]), 8)
        self.assertEqual(payload["progress"], 25)

    def test_journey_payload_adds_chapters_current_milestone_and_summary(self):
        startup_id = self.create_startup_via_api()

        response = self.client.get(
            f"/api/startups/{startup_id}/journey/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["journey"]), 8)
        self.assertEqual(payload["progress"], 25)
        self.assertEqual(len(payload["chapters"]), 4)
        self.assertEqual(payload["currentMilestone"]["key"], Startup.Stage.VALUE)
        self.assertEqual(
            payload["currentMilestone"]["mission"]["key"],
            "reframe_value_proposition",
        )
        self.assertEqual(
            [item["key"] for item in payload["strategicSummary"]],
            ["problem", "audience"],
        )

    def test_completing_current_step_opens_next_door(self):
        startup_id = self.create_startup_via_api()

        response = self.client.patch(
            f"/api/startups/{startup_id}/journey/value/",
            data={"answer": "Reduzimos desperdicio em 30% sem planilhas.", "complete": True},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        steps_by_key = {step["key"]: step for step in payload["journey"]}
        self.assertEqual(steps_by_key["value"]["status"], "done")
        self.assertEqual(steps_by_key["differentiators"]["status"], "current")
        self.assertEqual(payload["progress"], 38)
        self.assertEqual(
            Startup.objects.get(pk=startup_id).current_stage,
            Startup.Stage.DIFFERENTIATORS,
        )

    def test_cannot_complete_step_with_empty_answer(self):
        startup_id = self.create_startup_via_api()

        response = self.client.patch(
            f"/api/startups/{startup_id}/journey/value/",
            data={"answer": "   ", "complete": True},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("answer", response.json()["fieldErrors"])

    def test_cannot_answer_locked_step(self):
        startup_id = self.create_startup_via_api()

        response = self.client.patch(
            f"/api/startups/{startup_id}/journey/mvp/",
            data={"answer": "Tentativa de pular etapas.", "complete": True},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 409)

    def test_editing_done_step_syncs_startup_field(self):
        startup_id = self.create_startup_via_api()

        response = self.client.patch(
            f"/api/startups/{startup_id}/journey/problem/",
            data={"answer": "Dor refinada com mais contexto."},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        startup = Startup.objects.get(pk=startup_id)
        self.assertEqual(startup.problem, "Dor refinada com mais contexto.")
        step = JourneyStep.objects.get(startup_id=startup_id, key="problem")
        self.assertEqual(step.answer, "Dor refinada com mais contexto.")
        self.assertEqual(step.status, JourneyStep.Status.DONE)

    def test_account_progress_reflects_journey_state(self):
        startup_id = self.create_startup_via_api()

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        progress = response.json()["accountProgress"]
        # fundacao conclui problema e publico: 2 etapas = 200 XP, nivel 1
        self.assertEqual(progress["xp"], 200)
        self.assertEqual(progress["level"], 1)
        unlocked = {a["key"] for a in progress["achievements"] if a["unlocked"]}
        self.assertEqual(unlocked, {"founder", "named"})

        # concluir proposta de valor destrava "primeira porta" e sobe nivel
        self.client.patch(
            f"/api/startups/{startup_id}/journey/value/",
            data={"answer": "Promessa central da startup.", "complete": True},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        progress = response.json()["accountProgress"]
        self.assertEqual(progress["xp"], 300)
        self.assertEqual(progress["level"], 2)
        unlocked = {a["key"] for a in progress["achievements"] if a["unlocked"]}
        self.assertIn("first_door", unlocked)

    def test_account_progress_for_empty_account(self):
        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        progress = response.json()["accountProgress"]
        self.assertEqual(progress["xp"], 0)
        self.assertEqual(progress["level"], 1)
        self.assertEqual(progress["unlockedCount"], 0)

    def test_journey_requires_owner(self):
        other_user = User.objects.create_user(
            username="other-journey@example.com",
            email="other-journey@example.com",
            first_name="Outro",
            password="123",
        )
        startup = Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.get(
            f"/api/startups/{startup.pk}/journey/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 404)


class MissionApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mission-owner@example.com",
            email="mission-owner@example.com",
            first_name="Mateus",
            password="123",
        )
        self.token = issue_auth_token(self.user)
        self.startup = Startup.objects.create(
            owner=self.user,
            name="Aurora Labs",
            description="Controle de estoque para restaurantes.",
            segment="Alimentacao",
            problem="Compra duplicada de ingredientes.",
            audience="Donos de restaurantes pequenos.",
        )

    @property
    def auth(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def today_url(self):
        return f"/api/startups/{self.startup.pk}/today/"

    def evidence_url(self):
        return (
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/evidence/"
        )

    def learning_url(self):
        return (
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/learning/"
        )

    def complete_url(self):
        return (
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/complete/"
        )

    def add_interview(self, number):
        return self.client.post(
            self.evidence_url(),
            data={
                "intervieweeName": f"Pessoa {number}",
                "intervieweeProfile": "Dono de restaurante pequeno",
                "context": "Conversa de 20 minutos por video",
                "notes": (
                    "A pessoa relatou compras duplicadas e perda de ingredientes toda semana."
                ),
            },
            content_type="application/json",
            **self.auth,
        )

    def add_required_interviews(self):
        for number in range(1, 6):
            response = self.add_interview(number)
            self.assertEqual(response.status_code, 201)

    def add_learning(self):
        return self.client.post(
            self.learning_url(),
            data={
                "content": "A falta de visibilidade do estoque causa compras duplicadas recorrentes.",
                "impact": "A proposta deve priorizar visibilidade simples antes de automacoes.",
                "nextAction": "Refinar a proposta de valor com esse padrao.",
                "confidence": "high",
            },
            content_type="application/json",
            **self.auth,
        )

    def test_today_seeds_a_real_mission(self):
        response = self.client.get(self.today_url(), **self.auth)

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["user"]["firstName"], "Mateus")
        self.assertEqual(payload["mission"]["key"], "customer_interviews_5")
        self.assertEqual(payload["mission"]["status"], "available")
        self.assertEqual(payload["mission"]["requiredEvidenceCount"], 5)
        self.assertEqual(payload["mission"]["evidenceCount"], 0)
        self.assertEqual(payload["missionState"], "active")
        self.assertEqual(
            payload["mission"]["recommendationReason"],
            "Comece por evid\u00eancias reais antes de avan\u00e7ar para a solu\u00e7\u00e3o.",
        )
        self.assertEqual(payload["journey"]["progress"], 25)
        self.assertFalse(payload["nextUnlock"]["available"])
        self.assertEqual(Mission.objects.filter(startup=self.startup).count(), 5)

    def test_recording_interview_requires_real_notes(self):
        response = self.client.post(
            self.evidence_url(),
            data={"intervieweeName": "Pessoa 1", "notes": "curto"},
            content_type="application/json",
            **self.auth,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("notes", response.json()["fieldErrors"])
        self.assertEqual(MissionEvidence.objects.count(), 0)

    def test_recording_interview_awards_xp_and_keeps_streak(self):
        response = self.add_interview(1)

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["mission"]["status"], "in_progress")
        self.assertEqual(payload["mission"]["evidenceCount"], 1)
        self.assertEqual(payload["gamification"]["xp"], 210)
        self.assertEqual(payload["gamification"]["currentStreak"], 1)
        self.assertEqual(payload["gamification"]["streakStatus"], "maintained")
        self.assertEqual(ActivityEvent.objects.count(), 1)
        self.assertEqual(ActivityEvent.objects.get().xp_awarded, 10)

    def test_learning_waits_for_required_interviews(self):
        self.add_interview(1)

        response = self.add_learning()

        self.assertEqual(response.status_code, 409)
        self.assertEqual(Learning.objects.count(), 0)

    def test_complete_mission_requires_interviews_and_learning(self):
        self.add_required_interviews()

        response = self.client.post(self.complete_url(), data={}, **self.auth)

        self.assertEqual(response.status_code, 409)
        self.assertFalse(response.json()["mission"]["requirements"][1]["completed"])
        self.assertEqual(
            Mission.objects.get(key="customer_interviews_5").status,
            Mission.Status.IN_PROGRESS,
        )

    def test_complete_mission_awards_reward_and_unlocks_next_step(self):
        self.add_required_interviews()
        learning_response = self.add_learning()
        self.assertEqual(learning_response.status_code, 201)

        response = self.client.post(self.complete_url(), data={}, **self.auth)

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["mission"]["key"], "refine_problem_with_evidence")
        self.assertEqual(payload["mission"]["status"], "available")
        self.assertEqual(payload["gamification"]["xp"], 425)
        self.assertEqual(payload["gamification"]["level"], 2)
        self.assertEqual(payload["celebration"]["xpAwarded"], 150)
        self.assertEqual(
            payload["celebration"]["unlocked"],
            "Refine o problema com evid\u00eancias",
        )
        unlocked = {
            achievement["key"]
            for achievement in payload["gamification"]["achievements"]
            if achievement["unlocked"]
        }
        self.assertIn("five_interviews", unlocked)
        self.assertIn("first_learning", unlocked)
        self.assertIn("first_mission", unlocked)

    def test_completing_mission_twice_does_not_duplicate_reward(self):
        self.add_required_interviews()
        self.add_learning()
        first = self.client.post(self.complete_url(), data={}, **self.auth)
        second = self.client.post(self.complete_url(), data={}, **self.auth)

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            ActivityEvent.objects.filter(kind=ActivityEvent.Kind.MISSION_COMPLETED).count(),
            1,
        )
        self.assertEqual(second.json()["gamification"]["xp"], 425)

    def test_today_marks_the_initial_arc_complete(self):
        self.client.get(self.today_url(), **self.auth)
        Mission.objects.filter(startup=self.startup).update(
            status=Mission.Status.COMPLETED,
            completed_at=timezone.now(),
        )

        response = self.client.get(self.today_url(), **self.auth)

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsNone(payload["mission"])
        self.assertEqual(payload["missionState"], "arc_complete")
        self.assertEqual(payload["nextUnlock"]["title"], "Pr\u00f3xima trilha")
        self.assertFalse(payload["nextUnlock"]["available"])

    def test_mission_endpoints_require_startup_owner(self):
        other_user = User.objects.create_user(
            username="other-mission-owner@example.com",
            email="other-mission-owner@example.com",
            password="123",
        )
        other_token = issue_auth_token(other_user)

        today_response = self.client.get(
            self.today_url(),
            HTTP_AUTHORIZATION=f"Bearer {other_token}",
        )
        evidence_response = self.client.post(
            self.evidence_url(),
            data={
                "intervieweeName": "Pessoa",
                "notes": "Uma entrevista que nao deveria ser registrada nesta startup.",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {other_token}",
        )

        self.assertEqual(today_response.status_code, 404)
        self.assertEqual(evidence_response.status_code, 404)
        self.assertEqual(MissionEvidence.objects.count(), 0)
