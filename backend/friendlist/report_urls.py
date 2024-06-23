from django.urls import path
from . import views
from .views import UserReportsView, GameReportsView

urlpatterns = [
    path('user/', UserReportsView.as_view({'get': 'list', "post": "create"}), name="user_reports"),
    path('user/<int:pk>', UserReportsView.as_view({"get": "retrieve"}), name="user_reports_pk"),
    path('game/', GameReportsView.as_view({'get': 'list', "post": "create"}), name="game_reports"),
    path('game/<int:pk>', GameReportsView.as_view({"get": "retrieve"}), name="game_reports_pk"),
]