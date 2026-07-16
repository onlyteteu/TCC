from .mission_catalog import MISSION_DEFINITIONS
from .models import Mission


def reconcile_mission_states(startup):
    missions = list(startup.missions.order_by("order", "key"))
    by_key = {mission.key: mission for mission in missions}

    for mission in missions:
        if mission.status in {Mission.Status.IN_PROGRESS, Mission.Status.COMPLETED}:
            continue
        prerequisites_complete = all(
            by_key.get(key) is not None and by_key[key].status == Mission.Status.COMPLETED
            for key in mission.prerequisite_keys
        )
        desired = Mission.Status.AVAILABLE if prerequisites_complete else Mission.Status.LOCKED
        if mission.status != desired:
            mission.status = desired
            mission.save(update_fields=["status", "updated_at"])

    return list(startup.missions.order_by("order", "key"))


def sync_mission_catalog(startup):
    for definition in MISSION_DEFINITIONS:
        snapshot = definition.snapshot()
        mission, created = Mission.objects.get_or_create(
            startup=startup,
            key=definition.key,
            defaults={**snapshot, "status": Mission.Status.LOCKED},
        )
        may_refresh_snapshot = (
            not created
            and mission.started_at is None
            and mission.completed_at is None
            and mission.status in {Mission.Status.LOCKED, Mission.Status.AVAILABLE}
        )
        if may_refresh_snapshot:
            changed = []
            for field, value in snapshot.items():
                if getattr(mission, field) != value:
                    setattr(mission, field, value)
                    changed.append(field)
            if changed:
                mission.save(update_fields=[*changed, "updated_at"])

    return reconcile_mission_states(startup)
