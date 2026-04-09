from django.test import TestCase


class AuthenticationFlowTests(TestCase):
    def test_user_can_register_login_and_fetch_profile(self):
        register_response = self.client.post(
            "/api/auth/register/",
            data={
                "name": "Mateus Alves",
                "email": "mateus@example.com",
                "password": "senha-forte-123",
                "confirmPassword": "senha-forte-123",
            },
            content_type="application/json",
        )

        self.assertEqual(register_response.status_code, 201)
        register_payload = register_response.json()
        self.assertEqual(register_payload["user"]["name"], "Mateus Alves")
        self.assertEqual(register_payload["user"]["email"], "mateus@example.com")
        self.assertIn("token", register_payload)

        login_response = self.client.post(
            "/api/auth/login/",
            data={
                "email": "mateus@example.com",
                "password": "senha-forte-123",
            },
            content_type="application/json",
        )

        self.assertEqual(login_response.status_code, 200)
        login_token = login_response.json()["token"]

        profile_response = self.client.get(
            "/api/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {login_token}",
        )

        self.assertEqual(profile_response.status_code, 200)
        self.assertEqual(profile_response.json()["user"]["email"], "mateus@example.com")

    def test_register_rejects_mismatched_password_confirmation(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "name": "Pessoa Teste",
                "email": "teste@example.com",
                "password": "senha-forte-123",
                "confirmPassword": "senha-diferente-123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirmPassword", response.json()["fieldErrors"])

    def test_register_accepts_short_password_when_confirmation_matches(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "name": "Senha Curta",
                "email": "senha-curta@example.com",
                "password": "1",
                "confirmPassword": "1",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["user"]["email"], "senha-curta@example.com")
