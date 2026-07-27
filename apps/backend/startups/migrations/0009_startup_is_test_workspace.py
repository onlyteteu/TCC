from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("startups", "0008_mission_estimated_minutes"),
    ]

    operations = [
        migrations.AddField(
            model_name="startup",
            name="is_test_workspace",
            field=models.BooleanField(default=False),
        ),
    ]
