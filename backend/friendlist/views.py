from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .serializer import UserReportSerializer
from authentication.models import User
import pytz
from django.utils import timezone

class UserReportsView(viewsets.ModelViewSet):

    def get_permissions(self):
        if (self.action in ['create']):
            permission_classes = [IsAuthenticated]
        elif (self.action in ['list', 'retrieve']):
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        data = request.data
        user = request.user
        user_reported = User.objects.get(username=data["userReported"]["username"])
        clean_data = {"user": user.pk, 
                      "user_reported": user_reported.pk, 
                      "cause": data["selected"],
                      "report_date": timezone.now()}
        serializer = UserReportSerializer(data=clean_data)
        if (serializer.is_valid(raise_exception=True)):
            #print(serializer.data)
            #serializer.create(clean_data=clean_data)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response("ERR_SERVER_ERROR", status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        pass

    def list(self, request, pk=None):
        pass

