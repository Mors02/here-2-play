from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from authentication.serializers import DeveloperSerializer, UserInfoSerializer
from authentication.models import User
from orders.models import GamesBought
from games.models import VisitedGame, Game
from games.serializers import GameSerializer
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, F, ExpressionWrapper, IntegerField, Avg
from friendlist.models import Friendship
from orders.serializers import GamesBoughtSerializer
from rest_framework.permissions import IsAuthenticated

class DeveloperStatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        user = User.objects.get(id=request.user.pk)
        userInfo = DeveloperSerializer(user).data
        year = request.data["year"]
        
        allCopies = {game["id"]: list(GamesBought.objects.filter(game_id=game["id"], created_at__year=year)) for game in userInfo["games"]}
        allVisits = {game["id"]: list(VisitedGame.objects.filter(game_id=game["id"], visited_at__year=year)) for game in userInfo["games"]}
        #print(allVisits)
        stats = {'purchases': 0, 'earnings': 0, 'visits': 0}
        statsByMonth = [{**stats, 'month': month} for month in ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']]
        total = {**stats}
        for (id, purchases) in allCopies.items():
            #print(purchases)
            total['purchases'] += len(purchases)
            total['earnings'] += sum([game.price for game in purchases])
            for purchase in purchases:
                #make it an index
                month = int(purchase.created_at.strftime('%m'))-1
                statsByMonth[month]["purchases"] += 1
                statsByMonth[month]["earnings"] += purchase.price

        for (id, visits) in allVisits.items():
            total['visits'] += len(visits)
            for visit in visits:
                month = int(visit.visited_at.strftime('%m'))-1
                statsByMonth[month]["visits"] += 1
        
        return Response({"monthly": statsByMonth, "year": total}, status=200)

class MostSoldGamesView(APIView):
    def get(self, request):
        games = Game.objects.annotate(
            num_purchases=Count('games_bought_game', filter=Q(games_bought_game__created_at__gte=timezone.now()-timedelta(days=30)))
        ).annotate(
            num_visits=Count('visited_games_game', filter=Q(visited_games_game__visited_at__gte=timezone.now()-timedelta(days=30)))
        ).annotate(
            total_interactions=ExpressionWrapper(F('num_visits')+F('num_purchases')*8, output_field=IntegerField())
        ).order_by('-total_interactions')[:5]
        games = GameSerializer(games, many=True).data
        return Response(games, status=200)
    
class BestRatedGamesView(APIView):
    def get(self, request):
        games = Game.objects.filter(
            upload_date__gte=timezone.now()-timedelta(days=30)
        ).annotate(
            avg_rating=Avg('reviews_game__rating')
        ).order_by('-avg_rating')[:5]
        games = GameSerializer(games, many=True).data
        return Response(games, status=200)
    
class GameRecommendedFromFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friendships = Friendship.objects.filter(userA=request.user.pk).values_list('userB', flat=True)
        friends = User.objects.filter(id__in=friendships)

        user_game_ids = GamesBought.objects.filter(user=request.user.pk).values_list('game_id', flat=True)

        games_recommended_by_friends = Game.objects.filter(games_bought_game__user__in=friends).exclude(id__in=user_game_ids).annotate(purchase_count=Count('id')).order_by('-purchase_count')[:5]

        games = GameSerializer(games_recommended_by_friends, many=True).data

        return Response(games, status=status.HTTP_200_OK)

class RecommendationFromMostSimilarFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friendships = Friendship.objects.filter(userA=request.user.pk).values_list('userB', flat=True)

        user_game_ids = GamesBought.objects.filter(user=request.user.pk).values_list('game_id', flat=True)

        friends_with_common_games = GamesBought.objects.filter(
            user__in=friendships,
            game_id__in=user_game_ids
        ).values('user').annotate(common_game_count=Count('game')).order_by('-common_game_count')

        if friends_with_common_games:
            most_similar_friend = User.objects.get(id=friends_with_common_games[0]['user'])

            games = Game.objects.filter(games_bought_game__user=most_similar_friend).order_by('-games_bought_game__created_at').exclude(games_bought_game__user_id=request.user.pk)
            
            games = GameSerializer(games, many=True).data

            most_similar_friend = UserInfoSerializer(most_similar_friend).data

            return Response({'games': games, 'friend': most_similar_friend}, status=status.HTTP_200_OK)
        return Response(None, status=status.HTTP_200_OK)