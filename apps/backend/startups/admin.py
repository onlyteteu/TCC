from django.contrib import admin

from .models import ActivityEvent, Learning, Mission, MissionEvidence, Startup


@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "segment", "current_stage", "created_at")
    search_fields = (
        "name",
        "description",
        "segment",
        "problem",
        "audience",
        "owner__username",
        "owner__email",
    )
    list_filter = ("current_stage", "segment", "owner")


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ("title", "startup", "phase", "status", "xp_reward", "updated_at")
    list_filter = ("status", "mission_type", "phase")
    search_fields = ("title", "startup__name", "startup__owner__email")


@admin.register(MissionEvidence)
class MissionEvidenceAdmin(admin.ModelAdmin):
    list_display = ("interviewee_name", "mission", "evidence_type", "occurred_on")
    list_filter = ("evidence_type", "occurred_on")
    search_fields = ("interviewee_name", "interviewee_profile", "notes", "mission__title")


@admin.register(Learning)
class LearningAdmin(admin.ModelAdmin):
    list_display = ("startup", "mission", "confidence", "created_at")
    list_filter = ("confidence", "created_at")
    search_fields = ("content", "impact", "next_action", "startup__name")


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ("description", "startup", "kind", "xp_awarded", "occurred_at")
    list_filter = ("kind", "occurred_at")
    search_fields = ("description", "startup__name", "dedupe_key")
