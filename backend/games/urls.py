from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('games/', views.GameViewSet.as_view({'get': 'list'})),
    path('games/<int:pk>/', views.GameViewSet.as_view({'delete': 'destroy', 'put': 'update', 'get': 'retrieve',})),
    path('games/create/', views.GameViewSet.as_view({'post': 'create'})),

    path('your-games/', views.YourGameList.as_view()),

    path('games/<int:pk>/attachments/', views.GameAttachmentViewSet.as_view({'get': 'list'})),
    path('attachments/<int:pk>/', views.GameAttachmentViewSet.as_view({'delete': 'destroy'})),

    path('games/<int:pk>/discounts/', views.DiscountViewSet.as_view({'post': 'create'})),
    path('discounts/<int:pk>/', views.DiscountViewSet.as_view({'delete': 'destroy'})),
]
