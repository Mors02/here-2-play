from django.urls import path
from .views import DeveloperStatsView, MostSoldGamesView, BestRatedGamesView, GameRecommendedFromFriendView, RecommendationFromMostSimilarFriendView, AdminStatsView

urlpatterns = [    
    path('stats/dev/', DeveloperStatsView.as_view(), name='developer_stats'),
    path('stats/admin/', AdminStatsView.as_view(), name='admin_stats'),
    path('stats/most-sold/', MostSoldGamesView.as_view()),
    path('stats/best-rated/', BestRatedGamesView.as_view()),
    path('stats/recommended-from-friends/', GameRecommendedFromFriendView.as_view()),
    path('stats/recommendations-from-most-similar-friend/', RecommendationFromMostSimilarFriendView.as_view()),
]