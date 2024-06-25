from django.db import models
from django.contrib.auth import get_user_model

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