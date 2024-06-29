from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from authentication.serializers import DeveloperSerializer
from authentication.models import User
from orders.models import GamesBought
from games.models import VisitedGame, Game
from games.serializers import GameSerializer
from friendlist.models import GameReport, UserReport
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, F, ExpressionWrapper, IntegerField, Avg, FloatField
import math

H2P_CUT = 1/10

def f(x):
    return 100 / (1 + (math.e / 1.8) ** (-0.08 * (x - 200)))

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


class AdminStatsView(APIView):
    #permission_classes = (permissions.IsAdminUser,)
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        year = request.data["year"]
        stats = {'purchases': 0, 'earnings': 0, 'registrations': 0, 'reports': 0, 'games': 0}
        statsByMonth = [{**stats, 'month': month} for month in ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']]
        total = {**stats}

        allUsers = User.objects.filter(date_joined__year=year)
        for user in allUsers:
            total['registrations'] += 1
            month = int(user.date_joined.strftime('%m'))-1
            statsByMonth[month]['registrations'] += 1
        
        allGames = Game.objects.filter(upload_date__year=year)
        for game in allGames:
            total['games'] += 1
            month = int(game.upload_date.strftime('%m'))-1
            statsByMonth[month]['games'] += 1
        
        allGameReports = GameReport.objects.filter(report_date__year=year)
        for report in allGameReports:
            total['reports'] += 1
            month = int(report.report_date.strftime('%m'))-1
            statsByMonth[month]['reports'] += 1

        allUserReports = UserReport.objects.filter(report_date__year=year)
        for report in allUserReports:
            total['reports'] += 1
            month = int(report.report_date.strftime('%m'))-1
            statsByMonth[month]['reports'] += 1

        allGamesBought = GamesBought.objects.filter(created_at__year=year)
        for purchase in allGamesBought:
            total['earnings'] += float(purchase.price) * H2P_CUT
            total['purchases'] += 1
            month = int(game.upload_date.strftime('%m'))-1
            statsByMonth[month]['earnings'] += float(purchase.price) * H2P_CUT
            statsByMonth[month]['purchases'] += 1
        return Response({"monthly": statsByMonth, "year": total}, status=200)


class MostSoldGamesView(APIView):
    permission_classes = (permissions.AllowAny,)

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
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request):
        games = Game.objects.filter(
            upload_date__gte=timezone.now()-timedelta(days=30)
        ).annotate(
            avg_rating=Avg('reviews_game__rating')
        ).annotate(
            review_count=Count('reviews_game')
        ).annotate(
            weighted_avg=ExpressionWrapper(F('avg_rating')*f(F('review_count')), output_field=FloatField())
        ).order_by('-weighted_avg')[:5]
        games = GameSerializer(games, many=True).data
        return Response(games, status=200)
