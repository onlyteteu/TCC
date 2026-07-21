from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from accounts.tokens import issue_auth_token

from .mission_engine import reconcile_mission_states, sync_mission_catalog
from .models import (
    ActivityEvent,
    Learning,
    Mission,
    MissionEvidence,
    Startup,
    ensure_journey,
)

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
        self.assertEqual(payload["catalogVersion"], 3)
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

    def test_problem_refinement_detail_returns_interviews_as_source_evidence(self):
        interviews = self.startup.missions.get(key="customer_interviews_5")
        for index in range(5):
            MissionEvidence.objects.create(
                mission=interviews,
                evidence_type=MissionEvidence.Type.INTERVIEW,
                title=f"Entrevista {index + 1}",
                summary=f"Restaurante {index + 1} relatou compra duplicada.",
                interviewee_name=f"Pessoa {index + 1}",
                interviewee_profile="Dono de restaurante",
                context="Controle semanal de estoque",
                notes="Comprou ingredientes que ainda estavam guardados.",
                occurred_on=timezone.localdate(),
            )
        self.complete_directly("customer_interviews_5")

        response = self.client.get(
            f"/api/startups/{self.startup.pk}/missions/"
            "refine_problem_with_evidence/",
            **self.auth,
        )

        self.assertEqual(response.status_code, 200)
        mission_payload = response.json()["mission"]
        self.assertIn("sourceEvidences", mission_payload)
        source = mission_payload["sourceEvidences"]
        self.assertEqual(len(source), 5)
        self.assertEqual(source[0]["intervieweeName"], "Pessoa 1")

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

    def test_legacy_interview_routes_reject_every_structured_action_without_side_effects(self):
        ensure_journey(self.startup)
        structured_actions = (
            Mission.ActionType.PROBLEM_REFINEMENT,
            Mission.ActionType.AUDIENCE_VALIDATION,
            Mission.ActionType.VALUE_PROPOSITION,
            Mission.ActionType.ALTERNATIVES_MAP,
        )
        interview_body = {
            "intervieweeName": "Pessoa entrevistada",
            "notes": "Relato suficientemente detalhado para uma entrevista valida.",
        }
        learning_body = {
            "content": "Padrao recorrente observado nas conversas.",
            "impact": "O problema precisa ser refinado com esse contexto.",
            "nextAction": "Revisar o entregavel estruturado.",
            "confidence": "high",
        }

        prerequisite_keys = {
            Mission.ActionType.PROBLEM_REFINEMENT: ("customer_interviews_5",),
            Mission.ActionType.AUDIENCE_VALIDATION: (
                "customer_interviews_5",
                "refine_problem_with_evidence",
            ),
            Mission.ActionType.VALUE_PROPOSITION: (
                "customer_interviews_5",
                "refine_problem_with_evidence",
                "validate_priority_audience",
            ),
            Mission.ActionType.ALTERNATIVES_MAP: (
                "customer_interviews_5",
                "refine_problem_with_evidence",
                "validate_priority_audience",
            ),
        }

        for action_type in structured_actions:
            self.complete_directly(*prerequisite_keys[action_type])
            mission = self.startup.missions.get(action_type=action_type)
            self.assertEqual(mission.status, Mission.Status.AVAILABLE)
            initial_status = mission.status
            initial_started_at = mission.started_at
            initial_completed_at = mission.completed_at
            initial_evidence_count = MissionEvidence.objects.count()
            initial_learning_count = Learning.objects.count()
            initial_event_count = ActivityEvent.objects.count()
            initial_xp = sum(
                ActivityEvent.objects.values_list("xp_awarded", flat=True)
            )
            initial_journey = list(
                self.startup.journey_steps.order_by("order").values_list(
                    "key", "status", "answer", "completed_at"
                )
            )

            for _ in range(2):
                evidence_response = self.client.post(
                    f"/api/startups/{self.startup.pk}/missions/{mission.key}/evidence/",
                    data=interview_body,
                    content_type="application/json",
                    **self.auth,
                )
                learning_response = self.client.post(
                    f"/api/startups/{self.startup.pk}/missions/{mission.key}/learning/",
                    data=learning_body,
                    content_type="application/json",
                    **self.auth,
                )

                self.assertEqual(evidence_response.status_code, 409)
                self.assertEqual(learning_response.status_code, 409)

            mission.refresh_from_db()
            self.assertEqual(mission.status, initial_status)
            self.assertEqual(mission.started_at, initial_started_at)
            self.assertEqual(mission.completed_at, initial_completed_at)
            self.assertEqual(MissionEvidence.objects.count(), initial_evidence_count)
            self.assertEqual(Learning.objects.count(), initial_learning_count)
            self.assertEqual(ActivityEvent.objects.count(), initial_event_count)
            self.assertEqual(
                sum(ActivityEvent.objects.values_list("xp_awarded", flat=True)),
                initial_xp,
            )
            self.assertEqual(
                list(
                    self.startup.journey_steps.order_by("order").values_list(
                        "key", "status", "answer", "completed_at"
                    )
                ),
                initial_journey,
            )

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
