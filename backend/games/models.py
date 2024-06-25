from django.db import models
from authentication.models import User
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator

User = get_user_model()

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
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")

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

    def __str__(self):
        return (self.game.title + " - " + self.rating + " - " + self.body)
    
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

