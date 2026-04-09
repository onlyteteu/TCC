from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.tokens import issue_auth_token

from .models import Startup

User = get_user_model()


class StartupApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="startup-owner@example.com",
            email="startup-owner@example.com",
            first_name="Mateus",
            password="123",
        )
        self.token = issue_auth_token(self.user)

    def test_authenticated_user_can_list_only_own_startups(self):
        other_user = User.objects.create_user(
            username="other-owner@example.com",
            email="other-owner@example.com",
            first_name="Outro",
            password="123",
        )

        own_startup = Startup.objects.create(owner=self.user, name="Aurora Labs")
        Startup.objects.create(owner=other_user, name="AtlasPay")

        response = self.client.get(
            "/api/startups/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["startups"]), 1)
        self.assertEqual(payload["startups"][0]["id"], own_startup.pk)
        self.assertEqual(payload["startups"][0]["name"], "Aurora Labs")

    def test_authenticated_user_can_create_named_startup(self):
        response = self.client.post(
            "/api/startups/create/",
            data={
                "name": "Aurora Labs",
                "deferNaming": False,
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["startup"]["name"], "Aurora Labs")
        self.assertEqual(Startup.objects.filter(owner=self.user, name="Aurora Labs").count(), 1)

    def test_authenticated_user_can_create_startup_without_name(self):
        response = self.client.post(
            "/api/startups/create/",
            data={
                "name": "",
                "deferNaming": True,
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["startup"]["name"], "Startup sem nome")
        self.assertEqual(Startup.objects.filter(owner=self.user, name="Startup sem nome").count(), 1)

    def test_create_startup_requires_name_when_defer_option_is_off(self):
        response = self.client.post(
            "/api/startups/create/",
            data={
                "name": "",
                "deferNaming": False,
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.json()["fieldErrors"])
