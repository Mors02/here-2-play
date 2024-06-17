from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from django.contrib.auth.backends import ModelBackend

# Classe per la registrazione degli utenti
class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        clean_data = request.data #TODO: VALIDATE DATA
        serializer = UserRegisterSerializer
        if serializer.is_valid(raise_exception = True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(status = status.HTTP_400_BAD_REQUEST)

# Classe per il login degli utenti
class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data = request.data #TODO: VALIDATE DATA
        serializer = UserLoginSerializer(data = data)
        
        if serializer.is_valid(raise_exception = True):
            user = serializer.check_user(clean_data = data)
            if (user is None):
                return Response(None, status = 420)
            login(request, user, 'authentication.views.EmailBackend')
            return Response(serializer.data, status = status.HTTP_200_OK)

# Classe per il logout degli utenti
class UserLogout(APIView):
    def get(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

# Classe per recuperare le info degli utenti
class UserView(APIView):    
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        print(serializer.data)
        return Response({'user': serializer.data}, status = status.HTTP_200_OK)

class EmailBackend(ModelBackend):
    def authenticate(self, request, username = None, password = None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email = username)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None