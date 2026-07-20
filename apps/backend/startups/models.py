from django.conf import settings
from django.db import models
from django.utils import timezone


class Startup(models.Model):
    class Stage(models.TextChoices):
        PROBLEM = "problem", "Definicao do problema"
        AUDIENCE = "audience", "Publico-alvo"
        VALUE = "value", "Proposta de valor"
        DIFFERENTIATORS = "differentiators", "Diferenciais"
        VALIDATION = "validation", "Validacao inicial"
        BUSINESS_MODEL = "business_model", "Modelo de negocio"
        MVP = "mvp", "Planejamento do MVP"
        GOALS = "goals", "Metas iniciais"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="startups",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    segment = models.CharField(max_length=120, blank=True)
    problem = models.TextField(blank=True)
    audience = models.TextField(blank=True)
    current_stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.PROBLEM,
    )
    initial_goal = models.CharField(max_length=255, blank=True)
    last_opened_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Startup"
        verbose_name_plural = "Startups"

    def __str__(self) -> str:
        return self.name


JOURNEY_SEQUENCE = [
    Startup.Stage.PROBLEM,
    Startup.Stage.AUDIENCE,
    Startup.Stage.VALUE,
    Startup.Stage.DIFFERENTIATORS,
    Startup.Stage.VALIDATION,
    Startup.Stage.BUSINESS_MODEL,
    Startup.Stage.MVP,
    Startup.Stage.GOALS,
]


class JourneyStep(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        CURRENT = "current", "Etapa atual"
        DONE = "done", "Concluida"

    startup = models.ForeignKey(
        Startup,
        on_delete=models.CASCADE,
        related_name="journey_steps",
    )
    key = models.CharField(max_length=20, choices=Startup.Stage.choices)
    answer = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    order = models.PositiveSmallIntegerField()
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["startup", "key"], name="unique_step_per_startup"),
        ]
        verbose_name = "Etapa da jornada"
        verbose_name_plural = "Etapas da jornada"

    def __str__(self) -> str:
        return f"{self.startup.name} - {self.get_key_display()}"


class Mission(models.Model):
    class Origin(models.TextChoices):
        CATALOG = "catalog", "Catalogo"
        DYNAMIC = "dynamic", "Dinamica"

    class ActionType(models.TextChoices):
        INTERVIEWS = "interviews", "Entrevistas"
        PROBLEM_REFINEMENT = "problem_refinement", "Refinamento do problema"
        AUDIENCE_VALIDATION = "audience_validation", "Validacao do publico"
        VALUE_PROPOSITION = "value_proposition", "Proposta de valor"
        ALTERNATIVES_MAP = "alternatives_map", "Mapa de alternativas"

    class CompletionRule(models.TextChoices):
        INTERVIEWS_AND_LEARNING = "interviews_learning", "Entrevistas e aprendizado"
        PRIMARY_SUBMISSION = "primary_submission", "Entregavel principal"

    class Status(models.TextChoices):
        LOCKED = "locked", "Bloqueada"
        AVAILABLE = "available", "Disponivel"
        IN_PROGRESS = "in_progress", "Em andamento"
        COMPLETED = "completed", "Concluida"

    class Type(models.TextChoices):
        MAIN = "main", "Missao principal"
        WEEKLY = "weekly", "Missao semanal"
        QUICK = "quick", "Tarefa rapida"
        EXPERIMENT = "experiment", "Experimento"
        LEARNING = "learning", "Aprendizado"
        MANAGEMENT = "management", "Gestao recorrente"

    startup = models.ForeignKey(
        Startup,
        on_delete=models.CASCADE,
        related_name="missions",
    )
    key = models.CharField(max_length=60)
    mission_type = models.CharField(max_length=20, choices=Type.choices, default=Type.MAIN)
    phase = models.CharField(max_length=60)
    title = models.CharField(max_length=180)
    objective = models.TextField()
    why_it_matters = models.TextField()
    instructions = models.JSONField(default=list)
    completion_criteria = models.TextField()
    contextual_tip = models.TextField(blank=True)
    required_evidence_count = models.PositiveSmallIntegerField(default=0)
    xp_reward = models.PositiveIntegerField(default=0)
    definition_version = models.PositiveSmallIntegerField(default=1)
    origin = models.CharField(max_length=20, choices=Origin.choices, default=Origin.CATALOG)
    is_required = models.BooleanField(default=True)
    priority = models.PositiveSmallIntegerField(default=100)
    prerequisite_keys = models.JSONField(default=list, blank=True)
    action_type = models.CharField(
        max_length=30,
        choices=ActionType.choices,
        default=ActionType.INTERVIEWS,
    )
    completion_rule = models.CharField(
        max_length=30,
        choices=CompletionRule.choices,
        default=CompletionRule.INTERVIEWS_AND_LEARNING,
    )
    requirement_config = models.JSONField(default=dict, blank=True)
    step_blueprint = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.LOCKED,
    )
    order = models.PositiveSmallIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["startup", "key"],
                name="unique_mission_per_startup",
            ),
        ]
        verbose_name = "Missao"
        verbose_name_plural = "Missoes"

    def __str__(self) -> str:
        return f"{self.startup.name} - {self.title}"


class MissionEvidence(models.Model):
    class Type(models.TextChoices):
        INTERVIEW = "interview", "Entrevista"
        EXPERIMENT = "experiment", "Resultado de experimento"
        DOCUMENT = "document", "Documento"
        METRIC = "metric", "Metrica"
        OTHER = "other", "Outra evidencia"

    mission = models.ForeignKey(
        Mission,
        on_delete=models.CASCADE,
        related_name="evidences",
    )
    evidence_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.INTERVIEW,
    )
    title = models.CharField(max_length=180, blank=True, default="")
    summary = models.TextField(blank=True, default="")
    details = models.JSONField(default=dict, blank=True)
    submission_key = models.CharField(max_length=80, blank=True, default="")
    interviewee_name = models.CharField(max_length=120, blank=True, default="")
    interviewee_profile = models.CharField(max_length=180, blank=True)
    context = models.CharField(max_length=300, blank=True)
    notes = models.TextField(blank=True, default="")
    occurred_on = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-occurred_on", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["mission", "submission_key"],
                condition=models.Q(submission_key__gt=""),
                name="unique_submission_key_per_mission",
            ),
        ]
        verbose_name = "Evidencia de missao"
        verbose_name_plural = "Evidencias de missao"

    def __str__(self) -> str:
        label = self.interviewee_name or self.title or self.get_evidence_type_display()
        return f"{self.mission.title} - {label}"


class Learning(models.Model):
    class Confidence(models.TextChoices):
        LOW = "low", "Baixa"
        MEDIUM = "medium", "Media"
        HIGH = "high", "Alta"

    startup = models.ForeignKey(
        Startup,
        on_delete=models.CASCADE,
        related_name="learnings",
    )
    mission = models.ForeignKey(
        Mission,
        on_delete=models.SET_NULL,
        related_name="learnings",
        null=True,
        blank=True,
    )
    content = models.TextField()
    impact = models.TextField()
    next_action = models.TextField()
    confidence = models.CharField(
        max_length=10,
        choices=Confidence.choices,
        default=Confidence.MEDIUM,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["startup", "mission"],
                name="unique_learning_per_mission",
            ),
        ]
        verbose_name = "Aprendizado"
        verbose_name_plural = "Aprendizados"

    def __str__(self) -> str:
        return self.content[:80]


class ActivityEvent(models.Model):
    class Kind(models.TextChoices):
        INTERVIEW_RECORDED = "interview_recorded", "Entrevista registrada"
        EVIDENCE_RECORDED = "evidence_recorded", "Evidencia registrada"
        LEARNING_RECORDED = "learning_recorded", "Aprendizado registrado"
        MISSION_COMPLETED = "mission_completed", "Missao concluida"
        JOURNEY_STEP_COMPLETED = "journey_step_completed", "Etapa concluida"
        DECISION_RECORDED = "decision_recorded", "Decisao registrada"
        GOAL_COMPLETED = "goal_completed", "Meta concluida"

    startup = models.ForeignKey(
        Startup,
        on_delete=models.CASCADE,
        related_name="activity_events",
    )
    kind = models.CharField(max_length=30, choices=Kind.choices)
    description = models.CharField(max_length=255)
    xp_awarded = models.PositiveIntegerField(default=0)
    dedupe_key = models.CharField(max_length=120)
    metadata = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["startup", "dedupe_key"],
                name="unique_activity_event_per_startup",
            ),
        ]
        verbose_name = "Atividade significativa"
        verbose_name_plural = "Atividades significativas"

    def __str__(self) -> str:
        return self.description


def ensure_journey(startup: Startup) -> None:
    """Garante que a startup tenha as 8 etapas da jornada.

    Startups criadas antes da jornada existir recebem as etapas na primeira leitura.
    Problema e publico ja chegam concluidos porque foram respondidos na fundacao.
    """
    if startup.journey_steps.exists():
        return

    from django.utils import timezone

    now = timezone.now()
    seeded_answers = {
        Startup.Stage.PROBLEM: startup.problem,
        Startup.Stage.AUDIENCE: startup.audience,
    }

    steps = []
    for order, key in enumerate(JOURNEY_SEQUENCE):
        if key in seeded_answers and seeded_answers[key].strip():
            status = JourneyStep.Status.DONE
            answer = seeded_answers[key]
            completed_at = now
        elif key == Startup.Stage.VALUE:
            status = JourneyStep.Status.CURRENT
            answer = ""
            completed_at = None
        else:
            status = JourneyStep.Status.PENDING
            answer = ""
            completed_at = None

        steps.append(
            JourneyStep(
                startup=startup,
                key=key,
                answer=answer,
                status=status,
                order=order,
                completed_at=completed_at,
            )
        )

    JourneyStep.objects.bulk_create(steps)

    current_step = startup.journey_steps.filter(status=JourneyStep.Status.CURRENT).first()
    if current_step and startup.current_stage != current_step.key:
        startup.current_stage = current_step.key
        startup.save(update_fields=["current_stage", "updated_at"])
