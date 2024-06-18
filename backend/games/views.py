from django.shortcuts import render
from rest_framework import generics
from .models import Game
from .serializers import GameSerializer
from rest_framework.permissions import IsAuthenticated

class GameListCreate(generics.ListCreateAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Game.objects.filter(publisher=self.request.user)
    
    def perform_create(self, serializer):
        if (serializer.is_valid()):
            serializer.save(publisher=self.request.user)
        else:
            print(serializer.errors)

class GameDelete(generics.DestroyAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(publisher=user)