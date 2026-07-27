from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.tokens import issue_auth_token

from .models import Startup

User = get_user_model()


class TestWorkspaceCapabilityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test-owner@example.com",
            email="test-owner@example.com",
            password="test-password",
        )

    def today(self, startup):
        return self.client.get(
            f"/api/startups/{startup.pk}/today/",
            HTTP_AUTHORIZATION=f"Bearer {issue_auth_token(self.user)}",
        )

    def test_regular_startup_is_not_a_test_workspace_by_default(self):
        startup = Startup.objects.create(owner=self.user, name="Comum")

        self.assertFalse(startup.is_test_workspace)

    def test_today_allows_staff_owner_to_reset_test_workspace(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        startup = Startup.objects.create(
            owner=self.user,
            name="Startup de Teste",
            is_test_workspace=True,
        )

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": True})

    def test_today_denies_regular_owner_even_for_test_workspace(self):
        startup = Startup.objects.create(
            owner=self.user,
            name="Startup de Teste",
            is_test_workspace=True,
        )

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": False})

    def test_today_denies_staff_owner_for_regular_startup(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        startup = Startup.objects.create(owner=self.user, name="Comum")

        response = self.today(startup)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["testWorkspace"], {"canReset": False})
