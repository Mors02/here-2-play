from django.urls import path
from .consumers import WSConsumerChat

ws_urlpatterns = [
    path("chat/<str:room>", WSConsumerChat.as_asgi()),
]