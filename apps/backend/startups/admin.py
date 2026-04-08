from django.contrib import admin

from .models import Startup


@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ("name", "segment", "current_stage", "created_at")
    search_fields = ("name", "segment")
    list_filter = ("current_stage", "segment")
