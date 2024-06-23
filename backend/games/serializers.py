from rest_framework import serializers
from .models import Game, Discount, GameAttachment

class GameAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttachment
        fields = ["id", "image_url", "game"]
    
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "title", "description", "upload_date", "publisher", "discount", "price", 'image_url']
        extra_kargs = {"publisher": {"read_only": True}}

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "percentage", "start_date", "end_date"]