from django.contrib.auth import get_user_model
from django.test import TestCase

from .journey_service import build_journey_context
from .models import JourneyStep, Startup, ensure_journey


User = get_user_model()


class JourneyContextTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username="journey-context@example.com")
        self.startup = Startup.objects.create(
            owner=user,
            name="Estoca",
            problem="Compras duplicadas reduzem a margem.",
            audience="Restaurantes pequenos com estoque manual.",
        )
        ensure_journey(self.startup)

    def test_groups_eight_steps_into_four_derived_chapters(self):
        context = build_journey_context(
            self.startup,
            list(self.startup.journey_steps.all()),
        )

        self.assertEqual(
            [chapter["key"] for chapter in context["chapters"]],
            ["foundation", "proposal", "validation", "construction"],
        )
        self.assertEqual(
            [chapter["title"] for chapter in context["chapters"]],
            ["Fundamento", "Proposta", "Validação", "Construção"],
        )
        self.assertEqual(
            [chapter["status"] for chapter in context["chapters"]],
            ["done", "current", "locked", "locked"],
        )
        self.assertEqual(
            sum(len(chapter["steps"]) for chapter in context["chapters"]),
            8,
        )

    def test_current_value_milestone_links_the_versioned_mission(self):
        context = build_journey_context(
            self.startup,
            list(self.startup.journey_steps.all()),
        )

        milestone = context["currentMilestone"]
        self.assertEqual(milestone["key"], Startup.Stage.VALUE)
        self.assertEqual(milestone["chapterKey"], "proposal")
        self.assertEqual(
            milestone["mission"]["key"],
            "reframe_value_proposition",
        )
        self.assertEqual(
            milestone["mission"]["href"],
            f"/painel/startup/{self.startup.pk}/missoes/reframe_value_proposition",
        )
        self.assertEqual(milestone["mission"]["estimatedMinutes"], 15)
        self.assertEqual(milestone["mission"]["xpReward"], 100)

    def test_strategic_summary_reuses_foundation_answers(self):
        context = build_journey_context(
            self.startup,
            list(self.startup.journey_steps.all()),
        )

        self.assertEqual(
            context["strategicSummary"],
            [
                {
                    "key": "problem",
                    "label": "Problema",
                    "value": "Compras duplicadas reduzem a margem.",
                    "field": "problem",
                },
                {
                    "key": "audience",
                    "label": "Público-alvo",
                    "value": "Restaurantes pequenos com estoque manual.",
                    "field": "audience",
                },
            ],
        )

    def test_current_step_without_catalog_mission_has_honest_message(self):
        self.startup.journey_steps.filter(
            key__in=[Startup.Stage.VALUE, Startup.Stage.DIFFERENTIATORS]
        ).update(status=JourneyStep.Status.DONE)
        self.startup.journey_steps.filter(key=Startup.Stage.VALIDATION).update(
            status=JourneyStep.Status.CURRENT
        )

        context = build_journey_context(
            self.startup,
            list(self.startup.journey_steps.all()),
        )

        milestone = context["currentMilestone"]
        self.assertIsNone(milestone["mission"])
        self.assertEqual(
            milestone["message"],
            "A missão deste marco ainda não foi liberada.",
        )
