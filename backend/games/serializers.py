from rest_framework import serializers
from .models import Game, Discount, GameAttachment, Review, Tag

class GameAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttachment
        fields = ["id", "image", "game"]
    
class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "percentage", "start_date", "end_date"]

class GameSerializer(serializers.ModelSerializer):
    attachments = GameAttachmentSerializer(source="game_attachments_game", many=True, read_only=True)
    discounts = DiscountSerializer(source="discounts_game", many=True, read_only=True)
    publisher = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ["id", "title", "description", "upload_date", "publisher", "price", 'image', 'uploaded_file', 'attachments', 'discounts']
        extra_kargs = {"publisher": {"read_only": True}}

    def get_publisher(self, obj):
        from authentication.serializers import UserInfoSerializer
        return UserInfoSerializer(obj.publisher).data

class ReviewSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Review
        fields = ["id", "user", "game", "rating", "body"]

    def create(self, data):
        review = Review(**data)
        review.save()
        return review
    
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'