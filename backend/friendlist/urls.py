from django.urls import path, include
from . import views
from .views import FriendRequestView, FriendshipView

urlpatterns = [
    path('reports/', include('friendlist.report_urls')),
    path('friend-requests/', FriendRequestView.as_view({'get': 'list', 'post': 'create'}), name='friend_request'),
    path('friend-requests/<int:pk>', FriendRequestView.as_view({'patch': 'partial_update'}), name='friend_request_pk'),
    path('friends/', FriendshipView.as_view({'get': 'list'}), name="friendship"),
    path('friends/<int:pk>/', FriendshipView.as_view({'delete': 'destroy'}), name="friendship_pk")
]