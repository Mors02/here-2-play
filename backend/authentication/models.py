from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Role(models.Model):
    class Meta:
        db_table = "roles"

    slug = models.CharField(max_length=30)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    class Meta:
        db_table = "user_profiles"

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)