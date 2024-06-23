from django.urls import path
from . import views
from .views import UserReportsView, GameReportsView

urlpatterns = [
    path('reports/user/', UserReportsView.as_view({'get': 'list', "post": "create"}), name="user-reports"),
    path('report/user/<int:pk>', UserReportsView.as_view({"get": "retrieve"}), name="user-reports-pk"),
    path('reports/game/', GameReportsView.as_view({'get': 'list', "post": "create"}), name="game-reports"),
    path('report/game/<int:pk>', GameReportsView.as_view({"get": "retrieve"}), name="game-reports-pk")
]