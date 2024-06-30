from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Role(models.Model):
    class Meta:
        db_table = "roles"

    DEVELOPER = 1
    PLAYER = 0

    slug = models.CharField(max_length=30)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    def pfps(instance, filename):
        return 'profile_pictures/{filename}'.format(filename=filename)

    DEFAULT_PFP = 'profile_pictures/default.jpeg'    

    class Meta:
        db_table = "user_profiles"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_profile_user")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_profile_role")
    profile_picture = models.ImageField(upload_to=pfps, default=DEFAULT_PFP)