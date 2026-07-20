from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .mission_catalog import MISSION_DEFINITIONS, MissionDefinition, validate_catalog
from .mission_engine import (
    complete_mission_record,
    evaluate_mission,
    reconcile_mission_states,
    recommendation_reason,
    select_recommended_mission,
    sync_mission_catalog,
)
from .mission_submissions import SubmissionValidationError, apply_mission_submission
from .mission_serializers import serialize_mission_detail
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

    def test_generic_evidence_string_uses_title_when_interviewee_is_absent(self):
        user = User.objects.create_user(username="generic-evidence@example.com")
        startup = Startup.objects.create(owner=user, name="Aurora Labs")
        mission = Mission.objects.create(
            startup=startup,
            key="generic",
            phase="Descoberta",
            title="Missao generica",
            objective="Registrar um entregavel.",
            why_it_matters="Preservar contexto.",
            instructions=[],
            completion_criteria="Entregavel registrado.",
        )
        evidence = MissionEvidence.objects.create(
            mission=mission,
            evidence_type=MissionEvidence.Type.DOCUMENT,
            title="Problema refinado",
        )

        self.assertEqual(str(evidence), "Missao generica - Problema refinado")


class MissionCatalogTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="catalog@example.com", password="123")
        self.startup = Startup.objects.create(owner=self.user, name="Aurora Labs")

    def complete_prerequisites(self, *keys):
        sync_mission_catalog(self.startup)
        self.startup.missions.filter(key__in=keys).update(
            status=Mission.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        reconcile_mission_states(self.startup)

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

    def test_detail_serializer_evaluates_mission_only_once(self):
        sync_mission_catalog(self.startup)
        mission = self.startup.missions.get(key="customer_interviews_5")
        by_key = {item.key: item for item in self.startup.missions.all()}

        with patch(
            "startups.mission_serializers.evaluate_mission",
            wraps=evaluate_mission,
        ) as evaluator:
            payload = serialize_mission_detail(mission, by_key=by_key)

        self.assertEqual(payload["key"], mission.key)
        evaluator.assert_called_once_with(mission)

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

    def test_problem_submission_updates_startup_journey_and_unlocks_audience(self):
        self.complete_prerequisites("customer_interviews_5")
        mission = self.startup.missions.get(key="refine_problem_with_evidence")

        mutation = apply_mission_submission(
            self.startup,
            mission,
            {
                "problemStatement": "Restaurantes pequenos perdem margem quando compram ingredientes sem visibilidade do estoque.",
                "evidenceSummary": "Quatro de cinco entrevistados relataram compras duplicadas e descarte semanal de ingredientes.",
            },
        )

        self.startup.refresh_from_db()
        problem_step = self.startup.journey_steps.get(key=Startup.Stage.PROBLEM)
        audience_mission = self.startup.missions.get(key="validate_priority_audience")
        self.assertTrue(mutation.completed_now)
        self.assertEqual(mutation.evidence.submission_key, "primary")
        self.assertEqual(self.startup.problem, mutation.evidence.details["problemStatement"])
        self.assertEqual(problem_step.answer, self.startup.problem)
        self.assertEqual(audience_mission.status, Mission.Status.AVAILABLE)

    def test_problem_submission_rejects_shallow_content(self):
        self.complete_prerequisites("customer_interviews_5")
        mission = self.startup.missions.get(key="refine_problem_with_evidence")

        with self.assertRaises(SubmissionValidationError) as caught:
            apply_mission_submission(
                self.startup,
                mission,
                {"problemStatement": "Problema curto", "evidenceSummary": "Pouca evidencia"},
            )

        self.assertIn("problemStatement", caught.exception.field_errors)
        self.assertIn("evidenceSummary", caught.exception.field_errors)
        self.assertFalse(mission.evidences.exists())

    def test_audience_submission_updates_audience_and_records_decision(self):
        self.complete_prerequisites(
            "customer_interviews_5", "refine_problem_with_evidence"
        )
        mission = self.startup.missions.get(key="validate_priority_audience")

        mutation = apply_mission_submission(
            self.startup,
            mission,
            {
                "audienceStatement": "Donos de restaurantes independentes com uma unidade e controle manual de estoque.",
                "observedSignals": "O grupo relatou perda semanal, decide as compras e consegue testar uma rotina nova rapidamente.",
                "decision": "adjust",
            },
        )

        self.startup.refresh_from_db()
        audience_step = self.startup.journey_steps.get(key=Startup.Stage.AUDIENCE)
        self.assertEqual(
            self.startup.audience, mutation.evidence.details["audienceStatement"]
        )
        self.assertEqual(audience_step.answer, self.startup.audience)
        self.assertEqual(mutation.evidence.details["decision"], "adjust")
        self.assertEqual(mutation.mission.status, Mission.Status.COMPLETED)

    def test_audience_completion_releases_value_and_alternatives_in_parallel(self):
        self.complete_prerequisites(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )

        value = self.startup.missions.get(key="reframe_value_proposition")
        alternatives = self.startup.missions.get(key="map_current_alternatives")
        self.assertEqual(value.status, Mission.Status.AVAILABLE)
        self.assertEqual(alternatives.status, Mission.Status.AVAILABLE)
        self.assertEqual(select_recommended_mission(self.startup).key, value.key)

    def test_value_submission_updates_and_completes_current_value_step(self):
        self.complete_prerequisites(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )
        mission = self.startup.missions.get(key="reframe_value_proposition")

        mutation = apply_mission_submission(
            self.startup,
            mission,
            {
                "valueProposition": "Ajudamos restaurantes independentes a enxergar o estoque antes de comprar e reduzir perdas semanais.",
                "rationale": "A promessa combina o público validado, a compra duplicada e o resultado observado nas entrevistas.",
            },
        )

        value_step = self.startup.journey_steps.get(key=Startup.Stage.VALUE)
        differentiators = self.startup.journey_steps.get(
            key=Startup.Stage.DIFFERENTIATORS
        )
        self.assertEqual(value_step.status, JourneyStep.Status.DONE)
        self.assertEqual(differentiators.status, JourneyStep.Status.CURRENT)
        self.assertEqual(
            value_step.answer, mutation.evidence.details["valueProposition"]
        )

    def test_completed_value_submission_can_be_revised_without_reopening_or_new_xp(self):
        self.complete_prerequisites(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )
        mission = self.startup.missions.get(key="reframe_value_proposition")
        original = apply_mission_submission(
            self.startup,
            mission,
            {
                "valueProposition": "Ajudamos restaurantes independentes a enxergar o estoque antes de comprar e reduzir perdas semanais.",
                "rationale": "A promessa combina o público validado, a compra duplicada e o resultado observado nas entrevistas.",
            },
        )
        evidence_count = mission.evidences.count()
        event_count = self.startup.activity_events.count()
        awarded_xp = sum(
            self.startup.activity_events.values_list("xp_awarded", flat=True)
        )

        revised = apply_mission_submission(
            self.startup,
            mission,
            {
                "valueProposition": "Ajudamos restaurantes independentes a antecipar compras duplicadas e preservar margem toda semana.",
                "rationale": "A revisão torna explícito o ganho financeiro prioritário confirmado nas entrevistas com os compradores.",
            },
        )

        self.startup.refresh_from_db()
        value_step = self.startup.journey_steps.get(key=Startup.Stage.VALUE)
        mission.refresh_from_db()
        revised.evidence.refresh_from_db()
        self.assertEqual(revised.evidence.pk, original.evidence.pk)
        self.assertEqual(
            revised.evidence.details["valueProposition"],
            "Ajudamos restaurantes independentes a antecipar compras duplicadas e preservar margem toda semana.",
        )
        self.assertEqual(
            revised.evidence.details["rationale"],
            "A revisão torna explícito o ganho financeiro prioritário confirmado nas entrevistas com os compradores.",
        )
        self.assertEqual(
            value_step.answer, revised.evidence.details["valueProposition"]
        )
        self.assertEqual(value_step.status, JourneyStep.Status.DONE)
        self.assertEqual(self.startup.current_stage, Startup.Stage.DIFFERENTIATORS)
        self.assertEqual(mission.status, Mission.Status.COMPLETED)
        self.assertEqual(mission.evidences.count(), evidence_count)
        self.assertEqual(self.startup.activity_events.count(), event_count)
        self.assertEqual(
            sum(self.startup.activity_events.values_list("xp_awarded", flat=True)),
            awarded_xp,
        )
        self.assertFalse(revised.evidence_created)
        self.assertFalse(revised.completed_now)

    def test_alternatives_submission_does_not_advance_an_unrelated_journey_step(self):
        self.complete_prerequisites(
            "customer_interviews_5",
            "refine_problem_with_evidence",
            "validate_priority_audience",
        )
        ensure_journey(self.startup)
        value_step = self.startup.journey_steps.get(key=Startup.Stage.VALUE)
        differentiators = self.startup.journey_steps.get(
            key=Startup.Stage.DIFFERENTIATORS
        )
        mission = self.startup.missions.get(key="map_current_alternatives")

        mutation = apply_mission_submission(
            self.startup,
            mission,
            {
                "alternatives": "Caderno, planilha, memória do comprador e conferência visual feita somente no momento da compra.",
                "limitations": "As alternativas dependem de disciplina manual e não mostram duplicidade antes do pedido ao fornecedor.",
                "opportunity": "Oferecer visibilidade simples e preventiva sem exigir um ERP completo do restaurante.",
            },
        )

        value_step.refresh_from_db()
        differentiators.refresh_from_db()
        self.assertEqual(value_step.status, JourneyStep.Status.CURRENT)
        self.assertEqual(differentiators.status, JourneyStep.Status.PENDING)
        self.assertEqual(differentiators.answer, "")
        self.assertEqual(
            mutation.evidence.details["opportunity"],
            "Oferecer visibilidade simples e preventiva sem exigir um ERP completo do restaurante.",
        )
