from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserEditSerializer, UserRegisterSerializer, UserLoginSerializer, UserSerializer, UserInfoSerializer, UserInfoWithGamesSerializer
from rest_framework import permissions, status
from django.contrib.auth.backends import ModelBackend
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Role, UserProfile
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import User

# Classe per la registrazione degli utenti
class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)
    emailRegex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

    def post(self, request):
        clean_data = request.data 
        role = Role.objects.get(slug=clean_data["role_slug"])
        if (request.data["password"] != request.data["confirmPassword"]):
            return Response("ERR_INVALID_PASSWORD", status = status.HTTP_400_BAD_REQUEST)
        #if (re.fullmatch(self.emailRegex, request.data["email"])):
        #    return Response(status = status.HTTP_400_BAD_REQUEST)
        
        try:
            validation = validate_password(request.data["password"])
        except:
            return Response("ERR_INSECURE_PASSWORD", status = status.HTTP_400_BAD_REQUEST)
        
            

        clean_data = {"password": request.data["password"], "email": request.data["email"], "username": request.data["username"]}
        
        serializer = UserRegisterSerializer(data = clean_data)
        if serializer.is_valid(raise_exception = True):
            
            user = serializer.create(clean_data, role)
            if user:
                return Response(serializer.data, status = status.HTTP_201_CREATED)
            else:
                return Response("ERR_ALREADY_EXISTS", status = status.HTTP_400_BAD_REQUEST)
        return Response("ERR_BAD_REQUEST", status = status.HTTP_400_BAD_REQUEST)

class ChangeRole(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        user = request.user
        devRole = Role.objects.get(slug="developer")
        profile = UserProfile.objects.get(user_id=request.user.pk)
        #serializer = UserSerializer(profile) 
        profile.role_id = devRole.pk
        profile.save()
        print(profile)
        #print(serializer.data)
        return Response(status=status.HTTP_200_OK)
        #return Response("ERR_PROFILE_UNKNOWN", status=status.HTTP_400_BAD_REQUEST)

# Classe per il login degli utenti
class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):

        data = request.data #TODO: VALIDATE DATA
        serializer = UserLoginSerializer(data = data)
        
        if serializer.is_valid(raise_exception = True):
            user = serializer.check_user(clean_data = data)
            if (user is None):
                return Response("ERR_WRONG_CREDENTIALS", status = status.HTTP_401_UNAUTHORIZED)
            login(request, user, 'authentication.views.EmailBackend')
            token = RefreshToken.for_user(user)
            return Response({"user": serializer.data, "refresh": str(token), "access": str(token.access_token)}, status = status.HTTP_200_OK)

# Classe per il logout degli utenti
class UserLogout(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            logout(request)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_404_NOT_FOUND)        

# Classe per recuperare le info degli utenti
class UserView(APIView):    
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user_id=request.user.pk)
            serializer = UserSerializer(profile)        
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response('ERR_USER_NOT_FOUND', status=status.HTTP_404_NOT_FOUND)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_permissions(self):
        if (self.action in ["update", 'destroy']):
            permission_classes = (permissions.IsAuthenticated,)
        else:
            permission_classes = (permissions.AllowAny,)
        
        return [permission() for permission in permission_classes]
    
    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(id=pk)
            serializer = UserInfoWithGamesSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    def destroy(self, request, pk=None):
        try:
            User.objects.get(id=pk).delete()
            return Response(status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        data = request.data
        print(request.data)
        serializer = UserEditSerializer(data={"username": data["username"], 
                                              "password": request.user.password, 
                                              "pk": request.user.pk,
                                              "username": data["username"],
                                              "first_name": data["first_name"],
                                              "last_name": data["last_name"],
                                              "email": data["email"],
                                              "profile_picture": data["profile_picture"]},
                                        context={"user": request.user, 
                                                 "message": "", 
                                                 "changedPassword": False})
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user=request.user, data=request.data)

            if (serializer.context["message"] != ""):
                return Response(serializer.context["message"], status=status.HTTP_400_BAD_REQUEST)
            
            if (serializer.context["changedPassword"]):
                logout(request)
            #login(request, serializer.context["user"], 'authentication.views.EmailBackend')
            return Response({"user": serializer.data, "force_relogin": serializer.context["changedPassword"]}, status=status.HTTP_200_OK)

class IsAdminView(APIView):
    def get(self, request):
        user = User.objects.get(id=request.user.pk)
        return Response(user.is_superuser, status=status.HTTP_200_OK)

# Classe per autenticare con la mail gli utenti
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