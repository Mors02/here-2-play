from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate, logout
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Role
from games.models import VisitedGame
from django.contrib.auth.models import User
from orders.serializers import GamesBoughtSerializer, GameSerializer
from games.serializers import BundleSerializer, VisitedGameSerializer, PartialGameSerializer

UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def create(self, clean_data, role):
        alreadyRegistered = User.objects.filter(email=clean_data["email"]).exists()
        if (alreadyRegistered):
            return None
        else:
            #se non trova lo user allora lo creiamo

            user = User.objects.create_user(
                email = clean_data["email"],                 
                username = clean_data["username"],
                password = clean_data["password"]
            )
            profile = UserProfile(
                user=user,
                role=role                
            )
            profile.save()
            #user.set_password(clean_data["password"])
            user.save()
            return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def check_user(self, clean_data):        
            user = authenticate(username = clean_data["email"], password = clean_data["password"])
            if not user:
                return None
            return user

class UserEditSerializer(serializers.Serializer):    
    email = serializers.EmailField()
    first_name = serializers.CharField(allow_null=True, allow_blank=True)
    last_name = serializers.CharField(allow_null=True, allow_blank=True)
    profile_picture = serializers.ImageField(allow_null=True, required=False)

    def edit(self, user, data):   
        if (type(data["email"]) != str or type(data["username"]) != str or type(data["first_name"]) != str or type(data["last_name"]) != str):
            self.context["message"] = "ERR_INVALID_TYPE"
        #check if new email is already used
        try:
            alreadyRegistered = User.objects.filter(email=data["email"]).get()
        except:
            #no user found, go on with the validation
            alreadyRegistered = user
        #and its not our user
        if (alreadyRegistered.pk != user.pk):
            self.context["message"] = "ERR_ALREADY_REGISTERED"
        
        #check if new username is already used
        try:
            alreadyRegistered = User.objects.filter(username=data["username"]).get()
        except:
            alreadyRegistered = user
        #and its not our user
        if (alreadyRegistered.pk != user.pk):
            self.context["message"] = "ERR_ALREADY_REGISTERED"
            
        if ("oldPassword" in data and data["oldPassword"] != ""):
            #check if oldPassword is correct
            correctUser = authenticate(username = user.email, password = data["oldPassword"])
                
            #if is None then error
            if (correctUser is None):
                self.context["message"] = "ERR_WRONG_CREDENTIALS"
              
            #check if new password is not equal to confirm new password
            if (data["newPassword"] != data["confirmNewPassword"]):
                self.context["message"] = "ERR_DIFFERENT_PASSWORDS"

            #check if new password is secure
            try:
                validate_password(data["newPassword"])
            except:
                self.context["message"] = "ERR_INSECURE_PASSWORD"

        if (self.context["message"] == ""):
            editedUser = User.objects.filter(pk=user.pk).get()
            editedUser.username = data["username"]
            editedUser.email = data["email"]
            editedUser.first_name = data["first_name"]
            editedUser.last_name = data["last_name"]
            if ("newPassword" in data):
                self.context["changedPassword"] = True
                editedUser.set_password(data["newPassword"])        
            editedUser.save()

            #change pfp
            if ("profile_picture" in data):
                profile = UserProfile.objects.get(user_id=user.pk)
                profile.profile_picture = data["profile_picture"]
                profile.save()

            self.context["user"] = editedUser
            return editedUser
        #user = authenticate(username = clean_data["email"], password=clean_data["password"])
        #print(user)

        return None

class UserInfoWithGamesSerializer(serializers.ModelSerializer):
    games = GamesBoughtSerializer(source="games_bought_user", many=True, read_only=True)
    published_games = GameSerializer(source="games_publisher", many=True, read_only=True)
    profile_picture = serializers.SerializerMethodField()
    bundles = BundleSerializer(source="bundles_user", many=True, read_only=True)
    recently_visited_games = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ["username", "email", "id", "games", "role", "date_joined", "published_games", "profile_picture", "bundles", "recently_visited_games", "is_superuser"]

    def get_profile_picture(self, obj):
        return obj.user_profile_user.profile_picture.url
    
    def get_role(self, obj):
        return obj.user_profile_user.role.slug
    
    def get_recently_visited_games(self, obj):
        visits = VisitedGame.objects.filter(user_id=obj.id).order_by('-visited_at')[:8]
        return VisitedGameSerializer(visits, many=True).data

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'   

class UserSerializer(serializers.ModelSerializer):
    user = UserInfoWithGamesSerializer()
    role = RoleSerializer()

    class Meta:
        model = UserProfile
        #fields = ("email", "username", "first_name", "last_name", "role")
        fields = ["user", "role", "profile_picture"]

class UserInfoSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    def get_profile_picture(self, obj):
        return obj.user_profile_user.profile_picture.url

    class Meta:
        model = UserModel
        fields = ["username", "date_joined", "id", "profile_picture"]

class DeveloperSerializer(serializers.ModelSerializer):
    games = PartialGameSerializer(source="games_publisher", many=True, read_only=True)

    class Meta:
        model = UserModel
        fields = ["username", 'id', 'games']