from django.contrib import admin
from authentication.models import UserProfile

admin.site.register(UserProfile)
admin.site.site_url = 'http://localhost:3000/admin'
