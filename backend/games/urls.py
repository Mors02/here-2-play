from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('games/', views.GameViewSet.as_view({'get': 'list'})),
    path('games/<int:pk>/', views.GameViewSet.as_view({'get': 'retrieve'})),
    path("your-games/", views.YourGameList.as_view()),
]
