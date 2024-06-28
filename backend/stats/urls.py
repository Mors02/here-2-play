from django.urls import path
from .views import DeveloperStatsView, MostSoldGamesView, BestRatedGamesView, BestByCategoryView

urlpatterns = [    
    path('stats/dev/', DeveloperStatsView.as_view(), name='developer_stats'),
    path('stats/most-sold/', MostSoldGamesView.as_view()),
    path('stats/best-rated/', BestRatedGamesView.as_view()),
    path('stats/by-category', BestByCategoryView.as_view())
]