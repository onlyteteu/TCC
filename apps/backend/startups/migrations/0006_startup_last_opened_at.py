from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("startups", "0005_mission_learning_missionevidence_activityevent_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="startup",
            name="last_opened_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]
