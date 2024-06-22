from django.urls import path
from . import views
from .views import UserReportsView

urlpatterns = [
    path('reports/', UserReportsView.as_view({'get': 'list', "post": "create"}), name="reports"),
    path('reports/<int:pk>', UserReportsView.as_view({"get": "retrieve"}), name="reports-retrieve")
]