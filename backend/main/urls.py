from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework_simplejwt import views as jwt_views
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/', include('games.urls')),
    path('api/', include('friendlist.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('stats.urls')),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name="token_refresh")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
