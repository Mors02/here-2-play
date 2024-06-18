from django.urls import path
from . import views

urlpatterns = [
    path("games/", views.GameListCreate.as_view(), name="game-list"),
    path("games/delete/<int:pk>/", views.GameDelete.as_view(), name="game-delete")
]
