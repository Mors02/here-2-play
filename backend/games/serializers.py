from rest_framework import serializers
from .models import Game, Discount, GameAttachment, Category, Review, Tag, GameTags
from django.utils.dateparse import parse_date
from django.db.models import Avg
import datetime

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
    discounts = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    publisher = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ["id", "title", "description", "upload_date", "publisher", "price", 'image', 'uploaded_file', 'attachments', 'discounts', 'category', 'tags', 'reviews', 'average_rating']
        extra_kargs = {"publisher": {"read_only": True}}

    def get_publisher(self, obj):
        from authentication.serializers import UserInfoSerializer
        return UserInfoSerializer(obj.publisher).data
    
    def get_discounts(self, obj):
        discounts = DiscountSerializer(obj.discounts_game, many=True).data

        for discount in discounts:
            today = datetime.date.today()
            if today < parse_date(discount['start_date']) and today > parse_date(discount['end_date']):
                discounts.remove(discount)

        return discounts
    
    def get_tags(self, obj):
        top_tags = obj.game_tags_game.order_by('-count')[:4]
        return GameTagSerializer(top_tags, many=True).data
    
    def get_reviews(self, obj):
        reviews = obj.reviews_game.all()
        return ReviewSerializer(reviews, many=True).data
    
    def get_average_rating(self, obj):
        reviews = obj.reviews_game.all()

        if len(reviews) > 0:
            sum = 0
            for obj in reviews:
                sum += obj.rating
            average = sum / len(reviews)
            return average
        return 0

class ReviewSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Review
        fields = ["id", "user", "game", "rating", "body"]

    def create(self, data):
        review = Review(**data)
        review.save()
        return review
    
