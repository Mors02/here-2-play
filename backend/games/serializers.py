from rest_framework import serializers
from .models import Game, Discount, GameAttachment

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "title", "description", "upload_date", "publisher", "discount", "price", 'image_url']
        extra_kargs = {"publisher": {"read_only": True}}
    
    def create(self, clean_data):
        game = Game(
                title=clean_data["title"], 
                description=clean_data["description"],
                publisher_id=clean_data["publisher"],
                price=clean_data["price"],
                image_url=clean_data["image_url"]
            )
        game.save()
        return game

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "percentage", "start_date", "end_date"]

class GameAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttachment
        fields = ["id", "image"]