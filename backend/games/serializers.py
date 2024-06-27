from rest_framework import serializers
from .models import Game, Discount, GameAttachment, Category, Review, Tag, GameTags, Bundle, BundleGames, VisitedGame
from django.utils.dateparse import parse_date
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
    user = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "user", "game", "rating", "body", "created_at"]

    def create(self, data):
        review = Review(**data)
        review.save()
        return review
    
    def get_user(self, obj):
        from authentication.serializers import UserInfoSerializer
        from django.contrib.auth.models import User
        
        user = User.objects.get(pk=obj.user_id)
        return UserInfoSerializer(user).data
    
class BundleGamesSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    class Meta:
        model = BundleGames
        fields = '__all__'
    
    def create(self, data):
        bundleGame = BundleGames(**data)
        bundleGame.save()
        return bundleGame

class BundleSerializer(serializers.ModelSerializer):
    games = BundleGamesSerializer(source="bundle_games_bundle", many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    publisher = serializers.SerializerMethodField()

    class Meta:
        model = Bundle
        fields = ['games', 'id', 'name', 'description', 'discount', 'total_price', 'discounted_price', 'publisher']

    def create(self, data):
        bundle = Bundle(**data)
        bundle.save()
        return bundle
    
    def get_publisher(self, obj):
        from authentication.serializers import UserInfoSerializer
        return UserInfoSerializer(obj.user).data
    
    def get_total_price(self, obj):
        sum = 0
        games = obj.bundle_games_bundle.all()        
        for bundleGame in games:
            game = GameSerializer(bundleGame.game).data
            if len(game["discounts"]) > 0:
                disc = float(game["price"]) * int(game["discounts"][0]["percentage"]) / 100
                sum += (float(game["price"]) - disc)
            else:
                sum += float(game["price"])
            #sum += (game.game.details.price * game.game.details.discounts[0].percentage / 100)
        return sum 
    
    def get_discounted_price(self, obj):
        total_price = self.get_total_price(obj)
        total_price = total_price - (total_price * obj.discount / 100)
        return total_price

class VisitedGameSerializer(serializers.ModelSerializer):
    game = serializers.SerializerMethodField()

    class Meta:
        model = VisitedGame
        fields = ['game', 'user', 'visited_at']
    
    def get_game(self, obj):
        game = Game.objects.get(id=obj.game_id)
        return GameSerializer(game).data