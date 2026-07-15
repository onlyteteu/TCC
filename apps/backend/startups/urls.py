from django.urls import path

from .views import (
    complete_mission,
    create_startup,
    journey,
    journey_step,
    list_startups,
    mission_evidence,
    mission_learning,
    open_startup,
    startup_detail,
    today,
)

urlpatterns = [
    path("startups/", list_startups),
    path("startups/create/", create_startup),
    path("startups/<int:startup_id>/open/", open_startup),
    path("startups/<int:startup_id>/", startup_detail),
    path("startups/<int:startup_id>/today/", today),
    path(
        "startups/<int:startup_id>/missions/<str:mission_key>/evidence/",
        mission_evidence,
    ),
    path(
        "startups/<int:startup_id>/missions/<str:mission_key>/learning/",
        mission_learning,
    ),
    path(
        "startups/<int:startup_id>/missions/<str:mission_key>/complete/",
        complete_mission,
    ),
    path("startups/<int:startup_id>/journey/", journey),
    path("startups/<int:startup_id>/journey/<str:step_key>/", journey_step),
]
