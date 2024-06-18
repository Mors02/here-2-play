from django.shortcuts import render
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from .models import Game
from .serializers import GameSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny

class GameList(generics.ListAPIView):
    serializer_class = GameSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Game.objects.all()

class GameListCreate(generics.ListCreateAPIView):
    serializer_class = GameSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        clean_data = {"title": request.data["title"], "description": request.data["description"], "publisher": self.request.user.pk, "price": request.data["price"]} #TODO: VALIDATE DATA
        print(clean_data)
        serializer = GameSerializer(data=clean_data)
        if serializer.is_valid(raise_exception = True):
            game = serializer.create(clean_data)
            if game:
                return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(status = status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        games = Game.objects.filter(publisher=self.request.user)
        print(games[0])
        return games
    
    def perform_create(self, serializer):
        if (serializer.is_valid()):
            serializer.save(publisher=self.request.user)
        else:
            print(serializer.errors)

class GameDelete(generics.DestroyAPIView):
    serializer_class = GameSerializer
    authentication_classes = (SessionAuthentication,)

    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(publisher=user)