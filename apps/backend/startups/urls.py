from django.urls import path

from .views import create_startup, delete_startup, list_startups

urlpatterns = [
    path("startups/", list_startups),
    path("startups/create/", create_startup),
    path("startups/<int:startup_id>/", delete_startup),
]
