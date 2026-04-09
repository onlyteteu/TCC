from django.urls import path

from .views import create_startup, list_startups

urlpatterns = [
    path("startups/", list_startups),
    path("startups/create/", create_startup),
]
