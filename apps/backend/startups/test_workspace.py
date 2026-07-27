from django.db import transaction

from .mission_engine import sync_mission_catalog
from .models import ActivityEvent, JourneyStep, Learning, Mission, Startup, ensure_journey


@transaction.atomic
def reset_test_workspace(*, startup_id):
    startup = Startup.objects.select_for_update().get(pk=startup_id)

    Learning.objects.filter(startup=startup).delete()
    Mission.objects.filter(startup=startup).delete()
    JourneyStep.objects.filter(startup=startup).delete()
    ActivityEvent.objects.filter(startup=startup).delete()

    ensure_journey(startup)
    sync_mission_catalog(startup)
    startup.refresh_from_db()
    return startup
