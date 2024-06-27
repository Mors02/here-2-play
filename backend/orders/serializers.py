from rest_framework import serializers
from .models import GameInOrder, Order, GamesBought, BundleInOrder
from games.serializers import GameSerializer, BundleSerializer
    
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
    
class BundleInOrderSerializer(serializers.ModelSerializer):
    details = BundleSerializer(source="bundle", read_only=True)

    class Meta:
        model = BundleInOrder
        fields = ["id", "bundle", "details", "order"]

    def create(self, data):
        try:
            bundle = BundleInOrder.objects.get(order_id=data["order"], bundle_id=data["bundle"])
            return None
        except BundleInOrder.DoesNotExist:
            bundle = BundleInOrder(order_id=data["order"], bundle_id=data["bundle"])
            bundle.save()
        return bundle

class OrderSerializer(serializers.ModelSerializer):
    games = GameInOrderSerializer(source="order_games_order", many=True, read_only=True)
    bundles = BundleInOrderSerializer(source="order_bundles_order", many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['user_id', 'id', 'games', 'bundles', 'order_date', 'payment_method', 'status']

    def create(self, data):
        order = Order(user_id=data["user_id"])
        order.save()
        return order

class GamesBoughtSerializer(serializers.ModelSerializer):
    details = GameSerializer(source="game", read_only=True)
    
    class Meta:
        model = GamesBought
        fields = ["user", "details", "id", "game", "created_at"]

    def create(self, data):
        gameInLib = GamesBought(
            user = data["user"],
            game = data["game"]
        )
        gameInLib.save()
        return gameInLib