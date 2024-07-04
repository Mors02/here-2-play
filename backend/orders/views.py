from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from games.serializers import GameSerializer, BundleSerializer
from games.models import Game, Bundle
from authentication.models import User
from .models import Order, GameInOrder, GamesBought, BundleInOrder
from .serializers import OrderSerializer, GameInOrderSerializer, GamesBoughtSerializer, BundleInOrderSerializer
from django.utils import timezone
# Create your views here.

class OrderView(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=["post"])
    def complete_order(self, request, pk=None):
        try:
            orderObj = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        
        if (orderObj.user_id != request.user.pk):
            return Response("ERR_NOT_PERMITTED", status=status.HTTP_401_UNAUTHORIZED)

        order = OrderSerializer(orderObj).data
        orderObj.status = Order.COMPLETED
        orderObj.order_date = timezone.now()
        orderObj.payment_method = request.data["method"]

        for game in order["games"]:
            try:
                gameObj = Game.objects.get(id=game["game"])
            except Game.DoesNotExist:
                return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
            if len(game["details"]["discounts"]) > 0:
                price = float(game["details"]["price"]) - (float(game["details"]["price"]) * float(game["details"]["discounts"][0]["percentage"]) /100)
            else:
                price = game["details"]["price"]
            clean_data = {"game": game["game"], "user": request.user.pk, "price": price}
            serializer = GamesBoughtSerializer(data=clean_data)
            if (serializer.is_valid(raise_exception=True)):
                gameInLibrary = serializer.create(data={"game": gameObj, "user": request.user, "price": price})
            else:
                return Response("ERR_STUPID", status=status.HTTP_400_BAD_REQUEST)
        
        for bundle in order["bundles"]:
            for game in bundle["details"]["games"]:
                try:
                    gameObj = Game.objects.get(id=game["game"]["id"])
                except Game.DoesNotExist:
                    return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
                              
                #eventual game discount
                if len(game["game"]["discounts"]) > 0:
                    price = float(game["game"]["price"]) - (float(game["game"]["price"]) * float(game["game"]["discounts"][0]["percentage"])/100)
                else:
                    price = game["game"]["price"]

                #bundle discount
                price = float(price) - (float(price) * float(bundle["details"]["discount"]) / 100)
                
                try:
                    #se il gioco è già in possesso allora lo salto
                    gameAlreadyBought = GamesBought.objects.get(user_id=request.user.pk, game_id=game["game"]["id"])
                except GamesBought.DoesNotExist:
                    clean_data = {"game": game["game"]["id"], "user": request.user.pk, "price": price}
                    serializer = GamesBoughtSerializer(data=clean_data)
                    if (serializer.is_valid(raise_exception=True)):
                        gameInLibrary = serializer.create(data={"game": gameObj, "user": request.user, "price": price})
                    else:
                        return Response("ERR_STUPID", status=status.HTTP_400_BAD_REQUEST)
                
        
        orderObj.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def retrieve_last_order(self, request):
        user = User.objects.get(id=request.user.pk)
        order = lastOrderOfUser(user)
        if (order == {}):
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(order, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def add_game(self, request):
        user = User.objects.get(id=request.user.pk)
        try:
            game = Game.objects.get(pk=request.data["game_id"])        
        except Game.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
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
    
    @action(detail=False, methods=['post'])
    def add_bundle(self, request):
        user = User.objects.get(id=request.user.pk)
        try:
            bundle = Bundle.objects.get(pk=request.data["bundle_id"])        
        except Bundle.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        
        bundle = BundleSerializer(bundle).data
        order = lastOrderOfUser(user)
        if (order == {}):
            #order doesnt exist, create one
            orderSerializer = OrderSerializer(data={"user_id": user.pk})
            if(orderSerializer.is_valid(raise_exception=True)):
                order = orderSerializer.create(data={"user_id": user.pk})
                order = OrderSerializer(order).data
        #by now we should have an order, so we add the bundle to the order        
        bundleData = {"order": order["id"], "bundle": bundle["id"]}
        bundleAddedSerializer = BundleInOrderSerializer(data=bundleData, context={"message": ""})
        if (bundleAddedSerializer.is_valid()):            
            bundleAdded = bundleAddedSerializer.create(bundleData)           
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
        
class BundleInOrderView(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
     
    def destroy(self, request, pk=None):
        try:
            bundle = BundleInOrder.objects.get(id=pk)
            bundle.delete()
            return Response(status=status.HTTP_200_OK)
        except:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        
class GamesBoughtViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def update(self, request, pk):
        if not 'playTime' in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        game = GamesBought.objects.get(user_id=request.user.pk, game_id=pk)
        game.play_time += int(request.data['playTime'])
        game.save()
        
        return Response(status=status.HTTP_200_OK)

def lastOrderOfUser(user):
    try:
        order = Order.objects.get(user_id=user.pk, status=Order.PENDING)
        return OrderSerializer(order).data
    except Order.DoesNotExist:
        return {}
    except Order.MultipleObjectsReturned:
        orders = Order.objects.filter(user_id=user.pk, status=Order.PENDING)
        return OrderSerializer(orders[0]).data
    
