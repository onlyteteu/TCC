from django.db import migrations, models


ESTIMATED_MINUTES_BY_KEY = {
    "customer_interviews_5": 150,
    "refine_problem_with_evidence": 20,
    "validate_priority_audience": 20,
    "reframe_value_proposition": 15,
    "map_current_alternatives": 25,
}


def backfill_estimated_minutes(apps, schema_editor):
    mission_model = apps.get_model("startups", "Mission")
    for key, minutes in ESTIMATED_MINUTES_BY_KEY.items():
        mission_model.objects.filter(key=key).update(estimated_minutes=minutes)


class Migration(migrations.Migration):
    dependencies = [("startups", "0007_mission_catalog_v2")]

    operations = [
        migrations.AddField(
            model_name="mission",
            name="estimated_minutes",
            field=models.PositiveSmallIntegerField(default=15),
        ),
        migrations.RunPython(backfill_estimated_minutes, migrations.RunPython.noop),
    ]
