from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('games/', views.GameViewSet.as_view({'get': 'list'})),
    path('games/<int:pk>/', views.GameViewSet.as_view({'delete': 'destroy', 'put': 'update', 'get': 'retrieve'})),
    path('games/<int:pk>/statistics/<slug:type>/', views.GameViewSet.as_view({'get': 'statistics'})),
    path('games/create/', views.GameViewSet.as_view({'post': 'create'})),
    path('games/<int:pk>/owned', views.GameViewSet.as_view({'get': 'user_owns'})),
    path('games/<int:pk>/bundles', views.GameViewSet.as_view({'get': 'game_bundles'})),

    path('your-games/', views.YourGameList.as_view()),

    path('games/<int:pk>/attachments/', views.GameAttachmentViewSet.as_view({'get': 'list'})),
    path('attachments/<int:pk>/', views.GameAttachmentViewSet.as_view({'delete': 'destroy'})),

    path('games/<int:pk>/discounts/', views.DiscountViewSet.as_view({'post': 'create'})),
    path('discounts/<int:pk>/', views.DiscountViewSet.as_view({'delete': 'destroy'})),

    path('categories/', views.CategoryViewSet.as_view({'get': 'list'})),
    
    path('games/<int:pk>/reviews/', views.ReviewViewSet.as_view({'post': 'create', 'get': 'retrieve'})),
    path('games/<int:pk>/reviews/<int:rev_pk>', views.ReviewViewSet.as_view({'patch': 'partial_update'})),

    path('tags/', views.TagViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('tags/<int:pk>/', views.TagViewSet.as_view({'delete', 'destroy'})),

    path('bundles/', views.BundleViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('bundles/<int:pk>/', views.BundleViewSet.as_view({'delete': 'destroy', 'get': 'retrieve'})),

    path('visit/game/', views.VisitedGameViewSet.as_view({'post': 'create'})),
]
