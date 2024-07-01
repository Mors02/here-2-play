from django.contrib import admin
from games.models import Tag, Category

admin.site.register(Tag)
admin.site.register(Category)
admin.site.site_url = 'http://localhost:3000/admin'