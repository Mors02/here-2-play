from django.urls import path
from .views import DeveloperStatsView, MostSoldGamesView, BestRatedGamesView

urlpatterns = [    
    path('stats/dev/', DeveloperStatsView.as_view(), name='developer_stats'),
    path('stats/most-sold/', MostSoldGamesView.as_view()),
    path('stats/best-rated/', BestRatedGamesView.as_view()),
]