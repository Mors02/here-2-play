from rest_framework import serializers
from .models import Game, Discount, GameAttachment, Category, Review, Tag, GameTags

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class GameAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttachment
        fields = ["id", "image", "game"]
    
class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "percentage", "start_date", "end_date"]

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class GameTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)

    class Meta:
        model = GameTags
        fields = '__all__'

    def createOrUpdate(self, data):
        try:
            gameTag = GameTags.objects.get(game=data["game"], tag=data["tag"])
            gameTag.count += 1
            return gameTag
        except GameTags.DoesNotExist:    
            gameTag = GameTags(**data)
            gameTag.save()
            return gameTag

class GameSerializer(serializers.ModelSerializer):
    attachments = GameAttachmentSerializer(source="game_attachments_game", many=True, read_only=True)
    discounts = DiscountSerializer(source="discounts_game", many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    publisher = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ["id", "title", "description", "upload_date", "publisher", "price", 'image', 'uploaded_file', 'attachments', 'discounts', 'category', 'tags']
        extra_kargs = {"publisher": {"read_only": True}}

    def get_publisher(self, obj):
        from authentication.serializers import UserInfoSerializer
        return UserInfoSerializer(obj.publisher).data
    
    def get_tags(self, obj):
        top_tags = obj.game_tags_game.order_by('-count')[:4]
        return GameTagSerializer(top_tags, many=True).data

class ReviewSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Review
        fields = ["id", "user", "game", "rating", "body"]

    def create(self, data):
        review = Review(**data)
        review.save()
        return review
    
