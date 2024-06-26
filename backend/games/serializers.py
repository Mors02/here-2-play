from rest_framework import serializers
from .models import Game, Discount, GameAttachment, Category, Review, Tag, GameTags, Bundle, BundleGames

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

    class Meta:
        model = Bundle
        fields = ['games', 'id', 'name', 'description', 'discount', 'total_price', 'discounted_price']

    def create(self, data):
        bundle = Bundle(**data)
        bundle.save()
        return bundle
    
    def get_total_price(self, obj):
        sum = 0
        games = obj.bundle_games_bundle.all()        
        for bundleGame in games:
            print(bundleGame.game)
            if len(bundleGame.game.discounts_game.all()) > 0:
                print(bundleGame.game.price * bundleGame.game.discounts[0].percentage / 100)
            #sum += (game.game.details.price * game.game.details.discounts[0].percentage / 100)
        return sum 
    
    def get_discounted_price(self, obj):
        return 0

