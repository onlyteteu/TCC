from django.contrib.auth import get_user_model
from django.test import TestCase

from .mission_catalog import MISSION_DEFINITIONS, MissionDefinition, validate_catalog
from .mission_engine import sync_mission_catalog
from .models import ActivityEvent, Mission, MissionEvidence, Startup

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

    def test_catalog_rejects_a_dependency_cycle(self):
        first = MissionDefinition.minimal("first", prerequisites=("second",))
        second = MissionDefinition.minimal("second", prerequisites=("first",))

        with self.assertRaisesMessage(ValueError, "ciclo"):
            validate_catalog((first, second))
