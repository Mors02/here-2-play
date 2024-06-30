from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegister.as_view(), name="register"),
    path('login/', views.UserLogin.as_view(), name="login"),
    path('logout/', views.UserLogout.as_view(), name="logout"),
    path('user/<int:pk>/', views.UserViewSet.as_view({'put': 'update', "get": "retrieve", 'delete': 'destroy'}), name='user-update'),        
    path('user/change-role/', views.ChangeRole.as_view(), name="change-role"),
    path('authuser/', views.UserView.as_view(), name='user'),
    path('user/is-admin', views.IsAdminView.as_view(), name='is_admin')
]