from django.test import TestCase

from .models import ActivityEvent, Mission, MissionEvidence


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
