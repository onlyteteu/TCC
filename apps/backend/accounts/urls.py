from django.urls import path

from .views import current_user, login_view, logout_view, register_view

urlpatterns = [
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("me/", current_user, name="current_user"),
    path("logout/", logout_view, name="logout"),
]

