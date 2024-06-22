from django.shortcuts import render
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import Game
from .serializers import GameSerializer
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

class GameViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['list', 'retrieve']):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        data = Game.objects.all()
        serializer = GameSerializer(data, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        data = Game.objects.get(pk=pk)
        serializer = GameSerializer(data)
        return Response(serializer.data)
    
    def create(self, request):
        clean_data = {"title": request.data["title"], "description": request.data["description"], "publisher": self.request.user.pk, "price": request.data["price"]} #TODO: VALIDATE DATA
        print(clean_data)
        serializer = GameSerializer(data=clean_data)
        if serializer.is_valid(raise_exception = True):
            game = serializer.create(clean_data)
            if game:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        ...

    def destroy(self, request, pk=None):
        ...

class YourGameList(generics.ListAPIView):
    serializer_class = GameSerializer
    authentication_classes = (SessionAuthentication,)

    def get_queryset(self):
        return Game.objects.filter(published=self.request.user)