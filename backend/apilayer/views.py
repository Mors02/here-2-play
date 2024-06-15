from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.backends import ModelBackend

@api_view(['GET'])
def is_user_authenticated(request):
    return Response({'message': request.user.is_authenticated})

@api_view(['POST'])
def login(request):
    print(request.data)
    email = request.data["email"]
    password = request.data["password"]
    user = authenticate(username=email, password=password)
    if (user is not None):
        print("Autenticato")
        return Response({"result": True})
    else:
        return Response({"result": False})

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None