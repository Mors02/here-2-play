from django.urls import path
from .views import DeveloperStatsView

urlpatterns = [    
    path('stats/dev', DeveloperStatsView.as_view(), name='developer_stats'),
]