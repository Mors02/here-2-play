from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# Create your views here.

class GameViewSet(viewsets.ModelViewSet):

    def get_permissions(self):
        if (self.action in ['create']):
            permission_classes = [IsAuthenticated]
        elif (self.action in ['list', 'retrieve']):
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        pass

    def retrieve(self, request):
        pass

    def list(self, request):
        pass

