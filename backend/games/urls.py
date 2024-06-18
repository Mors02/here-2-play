from django.urls import path
from . import views

urlpatterns = [
    path("games/", views.GameList.as_view(), name="game-list"),
    path("your-games/", views.GameListCreate.as_view(), name="your-game-list"),
    path("games/delete/<int:pk>/", views.GameDelete.as_view(), name="game-delete")
]
