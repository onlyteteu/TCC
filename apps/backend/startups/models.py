from django.conf import settings
from django.db import models


class Startup(models.Model):
    class Stage(models.TextChoices):
        PROBLEM = "problem", "Definicao do problema"
        AUDIENCE = "audience", "Publico-alvo"
        VALUE = "value", "Proposta de valor"
        VALIDATION = "validation", "Validacao inicial"
        MVP = "mvp", "Planejamento do MVP"

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
    current_stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.PROBLEM,
    )
    initial_goal = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Startup"
        verbose_name_plural = "Startups"

    def __str__(self) -> str:
        return self.name
