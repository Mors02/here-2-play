from rest_framework import serializers
from .models import GameInOrder, Order, GamesBought
from games.serializers import GameSerializer
    
class GameInOrderSerializer(serializers.ModelSerializer):
    details = GameSerializer(source="game", read_only=True)

    class Meta:
        model = GameInOrder
        fields = ["id", "game", "order", "details"]

    def create(self, data):
        try:
            game = GameInOrder.objects.get(order_id=data["order"], game_id=data["game"])
            return None
        except GameInOrder.DoesNotExist:
            game = GameInOrder(order_id=data["order"], game_id=data["game"])
            game.save()
        return game

class OrderSerializer(serializers.ModelSerializer):
    games = GameInOrderSerializer(source="order_games_order", many=True, read_only=True)

    class Meta:
        model = Order
        #'games', 
        fields = ['user_id', 'id', 'games', 'order_date', 'payment_method', 'status']

    def create(self, data):
        order = Order(user_id=data["user_id"])
        order.save()
        return order

class GamesBoughtSerializer(serializers.ModelSerializer):
    details = GameSerializer(source="game", read_only=True)
    
    class Meta:
        model = GamesBought
        fields = ["user", "details", "id", "game"]

    def create(self, data):
        gameInLib = GamesBought(
            user = data["user"],
            game = data["game"]
        )
        gameInLib.save()
        return gameInLib