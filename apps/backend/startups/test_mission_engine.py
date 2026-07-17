from django.contrib.auth import get_user_model
from django.test import TestCase

from .mission_catalog import MISSION_DEFINITIONS, MissionDefinition, validate_catalog
from .mission_engine import (
    complete_mission_record,
    evaluate_mission,
    recommendation_reason,
    select_recommended_mission,
    sync_mission_catalog,
)
from .models import ActivityEvent, Learning, Mission, MissionEvidence, Startup

User = get_user_model()


class MissionSchemaTests(TestCase):
    def test_mission_has_catalog_snapshot_fields(self):
        field_names = {field.name for field in Mission._meta.get_fields()}

        self.assertTrue(
            {
                "definition_version",
                "origin",
                "is_required",
                "priority",
                "prerequisite_keys",
                "action_type",
                "completion_rule",
                "requirement_config",
                "step_blueprint",
            }.issubset(field_names)
        )

    def test_evidence_has_generic_submission_fields(self):
        field_names = {field.name for field in MissionEvidence._meta.get_fields()}

        self.assertTrue({"title", "summary", "details", "submission_key"}.issubset(field_names))

    def test_activity_supports_generic_evidence_event(self):
        self.assertIn("evidence_recorded", ActivityEvent.Kind.values)


class MissionCatalogTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="catalog@example.com", password="123")
        self.startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

    def test_catalog_contains_the_five_approved_discovery_missions(self):
        self.assertEqual(
            [definition.key for definition in MISSION_DEFINITIONS],
            [
                "customer_interviews_5",
                "refine_problem_with_evidence",
                "validate_priority_audience",
                "reframe_value_proposition",
                "map_current_alternatives",
            ],
        )

    def test_sync_creates_five_missions_with_real_dependencies(self):
        missions = sync_mission_catalog(self.startup)

        self.assertEqual(len(missions), 5)
        by_key = {mission.key: mission for mission in missions}
        self.assertEqual(by_key["customer_interviews_5"].status, Mission.Status.AVAILABLE)
        self.assertEqual(
            by_key["refine_problem_with_evidence"].status,
            Mission.Status.LOCKED,
        )
        self.assertEqual(
            by_key["validate_priority_audience"].status,
            Mission.Status.LOCKED,
        )
        self.assertEqual(
            by_key["reframe_value_proposition"].prerequisite_keys,
            ["validate_priority_audience"],
        )
        self.assertEqual(
            by_key["map_current_alternatives"].prerequisite_keys,
            ["validate_priority_audience"],
        )

    def test_sync_preserves_started_mission_snapshot(self):
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        mission.status = Mission.Status.IN_PROGRESS
        mission.title = "Titulo preservado"
        mission.definition_version = 1
        mission.save()

        sync_mission_catalog(self.startup)
        mission.refresh_from_db()

        self.assertEqual(mission.title, "Titulo preservado")
        self.assertEqual(mission.definition_version, 1)

    def test_recommendation_prefers_in_progress_over_available(self):
        sync_mission_catalog(self.startup)
        first = self.startup.missions.get(key="customer_interviews_5")
        second = self.startup.missions.get(key="refine_problem_with_evidence")
        first.status = Mission.Status.IN_PROGRESS
        first.save(update_fields=["status", "updated_at"])
        second.status = Mission.Status.AVAILABLE
        second.save(update_fields=["status", "updated_at"])

        recommended = select_recommended_mission(self.startup)

        self.assertEqual(recommended.key, "customer_interviews_5")
        self.assertIn("continue", recommendation_reason(recommended).lower())

    def test_interview_evaluation_requires_five_interviews_and_learning(self):
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        for number in range(5):
            MissionEvidence.objects.create(
                mission=mission,
                evidence_type=MissionEvidence.Type.INTERVIEW,
                interviewee_name=f"Pessoa {number}",
                notes="Relato suficientemente detalhado para a entrevista.",
            )
        Learning.objects.create(
            startup=self.startup,
            mission=mission,
            content="Padrao encontrado",
            impact="Impacto na proposta",
            next_action="Refinar o problema",
        )

        evaluation = evaluate_mission(mission)

        self.assertEqual(evaluation.progress, 100)
        self.assertTrue(evaluation.can_complete)

    def test_completion_unlocks_only_satisfied_dependents_and_is_idempotent(self):
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        for number in range(5):
            MissionEvidence.objects.create(
                mission=mission,
                evidence_type=MissionEvidence.Type.INTERVIEW,
                interviewee_name=f"Pessoa {number}",
                notes="Relato suficientemente detalhado para a entrevista.",
            )
        Learning.objects.create(
            startup=self.startup,
            mission=mission,
            content="Padrao encontrado",
            impact="Impacto na proposta",
            next_action="Refinar o problema",
        )

        _, completed_now = complete_mission_record(mission)
        _, completed_again = complete_mission_record(mission)

        second = self.startup.missions.get(key="refine_problem_with_evidence")
        third = self.startup.missions.get(key="validate_priority_audience")
        self.assertTrue(completed_now)
        self.assertFalse(completed_again)
        self.assertEqual(second.status, Mission.Status.AVAILABLE)
        self.assertEqual(third.status, Mission.Status.LOCKED)
        self.assertEqual(
            ActivityEvent.objects.filter(kind=ActivityEvent.Kind.MISSION_COMPLETED).count(),
            1,
        )

    def test_catalog_rejects_a_dependency_cycle(self):
        first = MissionDefinition.minimal("first", prerequisites=("second",))
        second = MissionDefinition.minimal("second", prerequisites=("first",))

        with self.assertRaisesMessage(ValueError, "ciclo"):
            validate_catalog((first, second))
