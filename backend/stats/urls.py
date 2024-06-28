from django.urls import path
from .views import DeveloperStatsView, MostSoldGamesView

urlpatterns = [    
    path('stats/dev', DeveloperStatsView.as_view(), name='developer_stats'),
    path('stats/most-sold', MostSoldGamesView.as_view())
]