from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from accounts.tokens import issue_auth_token

from .mission_engine import reconcile_mission_states, sync_mission_catalog
from .models import ActivityEvent, Mission, MissionEvidence, Startup

User = get_user_model()


class MissionV2ApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mission-v2@example.com", password="123"
        )
        self.token = issue_auth_token(self.user)
        self.startup = Startup.objects.create(
            owner=self.user,
            name="Aurora Labs",
            problem="Compra duplicada de ingredientes.",
            audience="Donos de restaurantes pequenos.",
        )
        sync_mission_catalog(self.startup)

    @property
    def auth(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def complete_directly(self, *keys):
        self.startup.missions.filter(key__in=keys).update(
            status=Mission.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        reconcile_mission_states(self.startup)

    def test_center_returns_one_recommendation_and_honest_locked_reasons(self):
        response = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/", **self.auth
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["catalogVersion"], 2)
        self.assertEqual(
            payload["arc"],
            {
                "key": "discovery",
                "title": "Descoberta",
                "completed": 0,
                "total": 5,
                "progress": 0,
            },
        )
        self.assertEqual(
            payload["recommendedMission"]["key"], "customer_interviews_5"
        )
        self.assertEqual(payload["availableMissions"], [])
        self.assertEqual(len(payload["lockedMissions"]), 4)
        self.assertTrue(payload["lockedMissions"][0]["lockedReasons"])

    def test_center_returns_value_as_focus_and_alternatives_as_available(self):
        self.complete_directly(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )

        response = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/", **self.auth
        )
        payload = response.json()

        self.assertEqual(
            payload["recommendedMission"]["key"], "reframe_value_proposition"
        )
        self.assertEqual(
            [mission["key"] for mission in payload["availableMissions"]],
            ["map_current_alternatives"],
        )
        self.assertEqual(
            [mission["key"] for mission in payload["completedMissions"]],
            [
                "customer_interviews_5",
                "refine_problem_with_evidence",
                "validate_priority_audience",
            ],
        )

    def test_detail_returns_full_instructions_and_evidence(self):
        response = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/",
            **self.auth,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("instructions", response.json()["mission"])
        self.assertIn("evidences", response.json()["mission"])

    def test_submission_is_idempotent_and_returns_the_next_recommendation(self):
        self.complete_directly("customer_interviews_5")
        url = (
            f"/api/startups/{self.startup.pk}/missions/"
            "refine_problem_with_evidence/submission/"
        )
        body = {
            "problemStatement": (
                "Restaurantes pequenos perdem margem quando compram ingredientes "
                "sem visibilidade do estoque."
            ),
            "evidenceSummary": (
                "Quatro de cinco entrevistados relataram compras duplicadas e "
                "descarte semanal de ingredientes."
            ),
        }

        first = self.client.post(
            url, data=body, content_type="application/json", **self.auth
        )
        second = self.client.post(
            url, data=body, content_type="application/json", **self.auth
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            MissionEvidence.objects.filter(submission_key="primary").count(), 1
        )
        self.assertEqual(
            ActivityEvent.objects.filter(
                kind=ActivityEvent.Kind.MISSION_COMPLETED
            ).count(),
            1,
        )
        self.assertEqual(
            first.json()["nextRecommendedMission"]["key"],
            "validate_priority_audience",
        )
        self.assertIn("celebration", first.json())
        self.assertNotIn("celebration", second.json())

    def test_another_user_cannot_read_center_detail_or_submit(self):
        other = User.objects.create_user(
            username="other-v2@example.com", password="123"
        )
        other_token = issue_auth_token(other)
        auth = {"HTTP_AUTHORIZATION": f"Bearer {other_token}"}
        center = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/", **auth
        )
        detail = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/customer_interviews_5/",
            **auth,
        )
        submission = self.client.post(
            f"/api/startups/{self.startup.pk}/missions/"
            "refine_problem_with_evidence/submission/",
            data={},
            content_type="application/json",
            **auth,
        )

        self.assertEqual(center.status_code, 404)
        self.assertEqual(detail.status_code, 404)
        self.assertEqual(submission.status_code, 404)

    def test_unknown_mission_returns_404_for_detail_and_submission(self):
        detail = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/not-a-mission/",
            **self.auth,
        )
        submission = self.client.post(
            f"/api/startups/{self.startup.pk}/missions/not-a-mission/submission/",
            data={},
            content_type="application/json",
            **self.auth,
        )

        self.assertEqual(detail.status_code, 404)
        self.assertEqual(submission.status_code, 404)

    def test_today_and_center_share_the_same_recommendation_and_progress(self):
        center = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/", **self.auth
        ).json()
        today = self.client.get(
            f"/api/startups/{self.startup.pk}/today/", **self.auth
        ).json()

        self.assertEqual(
            today["mission"]["key"], center["recommendedMission"]["key"]
        )
        self.assertEqual(
            today["mission"]["progress"],
            center["recommendedMission"]["progress"],
        )

    def test_today_reports_arc_complete_instead_of_a_false_lock(self):
        self.startup.missions.update(
            status=Mission.Status.COMPLETED,
            completed_at=timezone.now(),
        )

        today = self.client.get(
            f"/api/startups/{self.startup.pk}/today/", **self.auth
        ).json()

        self.assertIsNone(today["mission"])
        self.assertEqual(today["missionState"], "arc_complete")
        self.assertEqual(today["nextUnlock"]["key"], "next_arc")
        self.assertEqual(today["nextUnlock"]["title"], "Próxima trilha")
        self.assertFalse(today["nextUnlock"]["available"])
