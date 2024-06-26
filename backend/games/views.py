from django.shortcuts import render
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from orders.serializers import GamesBoughtSerializer
from orders.models import GamesBought
from .models import Game, GameAttachment, Discount, Review, Tag, Category, Bundle, BundleGames, VisitedGame
from .serializers import GameSerializer, GameAttachmentSerializer, ReviewSerializer, TagSerializer, GameTagSerializer, CategorySerializer, BundleSerializer, BundleGamesSerializer, VisitedGameSerializer, CreateBundleSerializer, CreateReviewSerializer
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from authentication.models import User
from django.utils import timezone
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum

class DiscountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def create(self, request, pk):
        start = parse_date(request.data['discount_start'])
        end = parse_date(request.data['discount_end'])

        if end < start:
            return Response('ERR_INVALID_DATES', status=status.HTTP_400_BAD_REQUEST)
        
        if int(request.data['discount_percentage']) <= 0 or int(request.data['discount_percentage']) > 100:
            return Response('ERR_INVALID_PERCENTAGE', status=status.HTTP_400_BAD_REQUEST)
        
        if end - start > 30:
            return Response('ERR_DISCOUNT_EXCEEDED_30_DAYS', status=status.HTTP_400_BAD_REQUEST)

        active_discount = Discount.objects.filter(game_id=pk).filter(end_date__gt=start)

        if active_discount:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        discount = Discount(
            percentage=request.data['discount_percentage'],
            start_date=start,
            end_date=end,
            game_id=pk
        )

        discount.save()
        
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        discount = Discount.objects.get(pk=pk)

        if discount.game.publisher.id == request.user.id:
            discount.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

class ReviewViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def retrieve(self, request, pk=None):
        try:
            user = request.user
            review = Review.objects.get(user_id=user.pk, game_id=pk)
            revData = ReviewSerializer(review).data
            return Response(revData, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response("", status=status.HTTP_204_NO_CONTENT)          
    
    def create(self, request, pk=None):
        data = request.data
        if data["rating"] < 0.5 or data["rating"] > 5:
            return Response("ERR_NO_RATING", status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=request.user.pk)
            game = Game.objects.get(id=pk)
            
            gamesBought = GamesBought.objects.get(user=user, game=game)
            #create the tags or update the old ones
            tags=data["tags"]
            print(tags)
            for tag in tags:
                tagObj = Tag.objects.get(id=tag["id"])
                tagSerializer = GameTagSerializer(data={"tag": tag["id"], "game": game.pk, "count": 0})
                if (tagSerializer.is_valid(raise_exception=True)):
                    print(tagSerializer.data)
                    tagSerializer.createOrUpdate({"tag": tagObj, "game": game, "count": 1})

            #save the review        
            serializer = CreateReviewSerializer(data={**data, 'user': user.pk, 'game': game.pk})
            if (serializer.is_valid(raise_exception=True)):
                serializer.create(data={'body': data['body'], 'rating': data['rating'], 'user': user, 'game': game})
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Game.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_400_BAD_REQUEST)
        except GamesBought.DoesNotExist:
            return Response("ERR_GAME_NOT_OWNED", status=status.HTTP_400_BAD_REQUEST)
        return Response("ERR_SERVER_ERROR", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def partial_update(self, request, pk=None, rev_pk=None):
        try:
            data = request.data
            review = Review.objects.get(id=rev_pk)
            if data["rating"] < 0.5 or data["rating"] > 5:
                return Response("ERR_NO_RATING", status=status.HTTP_400_BAD_REQUEST)
            review.rating = data["rating"]
            review.body = data["body"]
            review.save()
            revData = ReviewSerializer(review).data
            return Response(revData, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)  
        pass

class BundleViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['list', 'retrieve']):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        pass

    def retrieve(self, request, pk=None):
        try:
            bundle = Bundle.objects.get(id=pk)
            bundleData = BundleSerializer(bundle).data
            return Response(bundleData, status=status.HTTP_200_OK)
        except Bundle.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        data = request.data
        if (int(data["discount"]) < 0 or int(data["discount"]) > 100):
            return Response("ERR_INVALID_PERCENTAGE", status=status.HTTP_400_BAD_REQUEST)
        filtered_data = {**{key: value for key, value in data.items() if key != "games"}, "user": request.user}
        serializer = CreateBundleSerializer(data=filtered_data)
        if (serializer.is_valid(raise_exception=True)):
            bundle = serializer.create(filtered_data)
            
            for game in data["games"]:
                try: 
                    gameObj = Game.objects.get(id=game)
                    print(bundle)
                    gameSerializer = BundleGamesSerializer(data={"game": gameObj, "bundle": bundle.pk})
                    if (gameSerializer.is_valid(raise_exception=True)):
                        gameSerializer.create({"game": gameObj, "bundle": bundle})
                    print(serializer.data)
                except Game.DoesNotExist:
                    return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_201_CREATED)
        
        return Response("ERR_STUPID", status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        pass

class GameViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['list', 'retrieve', 'game_bundles']):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        request = request.GET.dict()
        data = Game.objects.all()

        if 'title' in request:
            data = data.filter(title__icontains=request['title'])
        if 'category' in request:
            data = data.filter(category_id=request['category'])
        if 'order' in request:
            data = data.order_by(request['order'])

        serialized_data = GameSerializer(data, many=True).data
        copy = serialized_data[:]

        if 'start' in request and 'end' in request:
            for obj in copy:
                final_price = float(obj['price'])
                if (len(obj['discounts']) > 0):
                    final_price = float(obj['price']) - (float(obj['price']) * int(obj['discounts'][0]['percentage']) / 100)
                if final_price < float(request['start']) or final_price > float(request['end']):
                    serialized_data.remove(obj)

        if 'tag' in request:
            serialized_data = [obj for obj in serialized_data if int(request['tag']) in [tag['tag']['id'] for tag in obj['tags']]]

        return Response(serialized_data)
    
    def retrieve(self, request, pk=None):
        game = get_object_or_404(Game, pk=pk)
        game_serializer = GameSerializer(game)
        
        return Response(game_serializer.data, status=status.HTTP_200_OK)
    
    def create(self, request):
        game = Game(
                title=request.data["title"], 
                description=request.data["description"],
                publisher_id=self.request.user.pk,
                price=request.data["price"],
                image=request.data["image"],
                uploaded_file=request.data["file"],
                category_id=request.data["category_id"]
            )
        game.save()

        attachments = request.FILES.getlist('attachments')
        for attachment in attachments:
            game_attachment = GameAttachment(
                    image=attachment,
                    game_id=game.id
                )
            game_attachment.save()

        if game:
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        game = get_object_or_404(Game, pk=pk)
        print(request.data)
        if game.publisher.id != request.user.id:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        game.title = request.data['title']
        game.description = request.data['description']
        game.price = request.data['price']
        game.category_id = request.data['category_id']

        if 'image' in request.data:
            game.image = request.data['image']

        if 'file' in request.data:
            game.uploaded_file = request.data['file']

        game.save()

        if 'attachments' in request.FILES:
            attachments = request.FILES.getlist('attachments')
            for attachment in attachments:
                game_attachment = GameAttachment(
                        image=attachment,
                        game_id=game.id
                    )
                game_attachment.save()

        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        game = Game.objects.get(id=pk)
        if request.user.id == game.publisher.id or request.user.is_superuser:
            game.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    
    def statistics(self, request, pk=None, type='all-time'):
        game = Game.objects.get(pk=pk)
        limited = type == 'last-30-days'

        if request.user.pk != game.publisher.pk:
            return Response('ERR_UNAUTHORIZED', status=status.HTTP_401_UNAUTHORIZED)
        
        reviews = Review.objects.filter(game_id=pk)
        registered_visits = VisitedGame.objects.filter(game_id=pk)
        anonymous_visits = VisitedGame.objects.filter(game_id=pk)
        purchases = GamesBought.objects.filter(game_id=pk)

        if limited:
            reviews = reviews.filter(created_at__gte=timezone.now()-timedelta(days=30))
            registered_visits = registered_visits.filter(visited_at__gte=timezone.now()-timedelta(days=30))    
            anonymous_visits = anonymous_visits.filter(visited_at__gte=timezone.now()-timedelta(days=30))
            purchases = purchases.filter(created_at__gte=timezone.now()-timedelta(days=30))

        reviews = ReviewSerializer(reviews.order_by('-created_at'), many=True).data
        registered_visits = registered_visits.exclude(user_id__isnull=True).count()
        anonymous_visits = anonymous_visits.filter(user_id__isnull=True).count()
        amount_gain = purchases.aggregate(Sum('price'))
        purchases = purchases.count()
        
        return Response({'reviews': reviews, 'registered_visits': registered_visits, 'anonymous_visits': anonymous_visits, 'purchases': purchases, 'amount_gain': amount_gain}, status=status.HTTP_200_OK)

    def user_owns(self, request, pk=None):
        try:
            user_id = request.user.pk
            game = Game.objects.get(id=pk)
            user_owns = GamesBought.objects.get(user_id=user_id, game_id=game.pk)
            return Response(GamesBoughtSerializer(user_owns).data, status=status.HTTP_200_OK)
        except Game.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        except GamesBought.DoesNotExist:
            return Response(False, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def game_bundles(self, request, pk=None):
        try:
            game = Game.objects.get(id=pk)
            bundles = [bundle.bundle for bundle in BundleGames.objects.filter(game_id=pk).select_related('bundle')]
            bundles = BundleSerializer(bundles, many=True).data
            return Response(bundles, status=200)
        except Game.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)

class YourGameList(generics.ListAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = Game.objects.filter(publisher=self.request.user)
        serializer = GameSerializer(data, many=True)
        return Response(serializer.data)
    
class GameAttachmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request, pk=None):
        data = GameAttachment.objects.filter(game_id=pk)
        serializer = GameAttachmentSerializer(data, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        attachment = GameAttachment.objects.get(id=pk)

        if attachment.game.publisher.id != request.user.id:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        attachment.delete()
        return Response(status=status.HTTP_200_OK)
    
class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        data = Category.objects.all()
        serializer = CategorySerializer(data, many=True)
        return Response(serializer.data)

class TagViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['destroy', 'create']):
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        tags = TagSerializer(Tag.objects.all(), many=True).data
        return Response(tags, status=status.HTTP_200_OK)

    def create(self, request):
        pass

    def destroy(self, request, pk=None):
        pass

class VisitedGameViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        print(request.data)
        if request.user.is_authenticated:
            exist = VisitedGame.objects.filter(game_id=request.data['game']).filter(user_id=request.user.pk).count()

            print(exist)
            if exist > 0:
                return self.update(request=request, pk=request.data['game'])

            visit = VisitedGame(
                game_id=request.data['game'],
                user_id=request.user.pk
            )
        else:
            visit = VisitedGame(
                game_id=request.data['game'],
                user_id=None
            )
        visit.save()

        return Response(status=status.HTTP_201_CREATED)

    def update(self, request, pk):
        visit = VisitedGame.objects.get(game_id=pk, user_id=request.user.pk)

        visit.visited_at = timezone.now()
        visit.save()

        return Response(status=status.HTTP_200_OK)