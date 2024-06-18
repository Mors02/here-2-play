from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        def create(self, clean_data):
            user = User.objects.create_user(
                email=clean_data["email"], 
                password=clean_data["password"],
                username=clean_data["username"]
            )
            user.save()
            return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    def check_user(self, clean_data):
        user = authenticate(username=clean_data["email"], password=clean_data["password"])
        if not user:
            return None
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "username")