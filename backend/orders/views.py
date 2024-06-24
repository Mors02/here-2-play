from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from games.serializers import GameSerializer
from games.models import Game
from authentication.models import User
from .models import Order, GameInOrder, GamesBought
from .serializers import OrderSerializer, GameInOrderSerializer, GamesBoughtSerializer
from django.utils import timezone
# Create your views here.

class OrderView(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=["post"])
    def complete_order(self, request, pk=None):
        orderObj = Order.objects.get(id=pk)
        order = OrderSerializer(orderObj).data
        orderObj.status = Order.COMPLETED
        orderObj.order_date = timezone.now()
        orderObj.payment_method = request.data["method"]

        for game in order["games"]:
            print(game)
            try:
                gameObj = Game.objects.get(id=game["game"])
            except Game.DoesNotExist:
                return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
            clean_data = {"game": game["game"], "user": request.user.pk}
            serializer = GamesBoughtSerializer(data=clean_data)
            if (serializer.is_valid(raise_exception=True)):
                gameInLibrary = serializer.create(data={"game": gameObj, "user": request.user})
            else:
                return Response("ERR_STUPID", status=status.HTTP_400_BAD_REQUEST)

        orderObj.save()
        return Response(status=status.HTTP_200_OK)
        

    @action(detail=False, methods=['get'])
    def retrieve_last_order(self, request):
        user = User.objects.get(id=request.user.pk)
        order = lastOrderOfUser(user)
        print(order)
        if (order == {}):
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(order, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def add_game(self, request):
        user = User.objects.get(id=request.user.pk)
        game = Game.objects.get(pk=request.data["game_id"])        
        game = GameSerializer(game).data
        order = lastOrderOfUser(user)
        if (order == {}):
            #order doesnt exist, create one
            orderSerializer = OrderSerializer(data={"user_id": user.pk})
            if(orderSerializer.is_valid(raise_exception=True)):
                order = orderSerializer.create(data={"user_id": user.pk})
                order = OrderSerializer(order).data
        #by now we should have an order, so we add the game to the order        
        gameData = {"order": order["id"], "game": game["id"]}
        gameAddedSerializer = GameInOrderSerializer(data=gameData, context={"message": ""})
        try:
            #check if the game is already bought
            alreadyBought = GamesBought.objects.get(user=user.pk, game=game["id"])
            return Response("ERR_ALREADY_BOUGHT", status=status.HTTP_400_BAD_REQUEST)
        except GamesBought.DoesNotExist:
            if (gameAddedSerializer.is_valid()):            
                gameAdded = gameAddedSerializer.create(gameData)           
                return Response(status=status.HTTP_201_CREATED)
          
        return Response("ERR_ALREADY_IN_CART", status=status.HTTP_400_BAD_REQUEST)

class GameInOrderView(viewsets.ModelViewSet):
     def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
     
     def destroy(self, request, pk=None):
        try:
            game = GameInOrder.objects.get(id=pk)
            game.delete()
            return Response(status=status.HTTP_200_OK)
        except:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)

def lastOrderOfUser(user):
    try:
        order = Order.objects.get(user_id=user.pk, status=Order.PENDING)
        return OrderSerializer(order).data
    except Order.DoesNotExist:
        return {}
    except Order.MultipleObjectsReturned:
        orders = Order.objects.filter(user_id=user.pk, status=Order.PENDING)
        return OrderSerializer(orders[0]).data