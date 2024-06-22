from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from .models import UserProfile
from django.contrib.auth.models import User

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
    pk = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()
    first_name = serializers.CharField(allow_null=True, allow_blank=True)
    last_name = serializers.CharField(allow_null=True, allow_blank=True)

    def edit(self, user, data):     
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
        

        if ("oldPassword" in data and data["oldPassword"] is not None):
            #check if oldPassword is correct
            correctUser = authenticate(username = user.email, password = data["oldPassword"])
            print("CORRECT USER")
            print(correctUser)
            #if is None then error
            if (correctUser is None):
                self.context["message"] = "ERR_WRONG_CREDENTIALS"
            
            #check if new password is not equal to confirm new password
            if (data["newPassword"] != data["confirmNewPassword"]):
                self.context["message"] = "ERR_DIFFERENT_PASSWORDS"

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
            self.context["user"] = editedUser
            return editedUser
        #user = authenticate(username = clean_data["email"], password=clean_data["password"])
        #print(user)

        return None
        

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        #fields = ("email", "username", "first_name", "last_name", "role")
        fields = ["user", "role"]
        depth = 1  

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["username", "date_joined"]