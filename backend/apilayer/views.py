from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def is_user_authenticated(request):
    return Response({'message': request.user.is_authenticated})

@api_view(['POST'])
def login(request):
    print(request.data)
    return Response({'message': 'pierino'})
