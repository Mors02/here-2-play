from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/', include('games.urls')),
    path('api/', include('friendlist.urls')),
    path('api/', include('orders.urls')),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name="token_refresh")
]
