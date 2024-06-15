from django.urls import path
from . import views


urlpatterns = [
    path('is-authenticated/', views.is_user_authenticated, name="is_auth"),
    path('login/', views.login, name="login")
]