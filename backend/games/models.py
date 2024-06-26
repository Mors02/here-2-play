from django.db import models
from authentication.models import User
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name

class Game(models.Model):
    def covers(instance, filename):
        return 'game_covers/{filename}'.format(filename=filename)
    
    def files(instance, filename):
        return 'game_files/{filename}'.format(filename=filename)

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=5, decimal_places=2)
    upload_date = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to=covers, default=None)
    uploaded_file = models.FileField(upload_to=files, default=None)
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_publisher")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True, related_name="games_category")

    class Meta:
        db_table = "games"

    def __str__(self):
        return self.title + " - " + self.description + " - " + str(self.price)
    
class GameAttachment(models.Model):
    def attachments(instance, filename):
        return 'game_attachments/{filename}'.format(filename=filename)
    
    image = models.ImageField(upload_to=attachments, default=None)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="game_attachments_game")

    class Meta:
        db_table = "game_attachments"

class Discount(models.Model):
    percentage = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='discounts_game')

    class Meta:
        db_table = "discounts"
    
    def __str__(self):
        return str(self.percentage)
    
class Review(models.Model):
    rating = models.FloatField(validators=[MaxValueValidator(5), MinValueValidator(0.5)])
    body = models.TextField(max_length=500, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_user")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="reviews_game")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (self.game.title + " - " + str(self.rating) + " - " + self.body)
    
    class Meta:
        db_table = "reviews"
        unique_together = ('game', 'user')

class Tag(models.Model):
    slug = models.TextField(max_length=50)
    name = models.TextField(max_length=50)

    def __str__(self):
        return (self.name)
    
    class Meta:
        db_table = "tags"

class GameTags(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="game_tags_game")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="game_tags_tag")
    count = models.PositiveIntegerField()

    class Meta:
        db_table = "game_tags"
    
    def __str__(self):
        return (self.tag +" -> "+ self.game.title)
    
class Bundle(models.Model):
    name = models.TextField(max_length=50)
    description = models.TextField(max_length=300)
    discount = models.PositiveSmallIntegerField(validators=[MaxValueValidator(100)])
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bundles_user")

    class Meta:
        db_table = "bundles"

    def __str__(self):
        return (self.name + " - " + self.description)

class BundleGames(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="bundle_games_game")
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name="bundle_games_bundle")

    class Meta:
        db_table = "bundle_games"

    def __str__(self):
        return (self.bundle.name + " - " + self.game.title)
    
class VisitedGame(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='visited_games_game')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visited_games_user', blank=True, null=True)
    visited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "visited_games"

    def __str__(self):
        return str(self.user.pk) + " has visited " + self.game.title + " on " + self.visited_at.strftime("%H:%M:%S")