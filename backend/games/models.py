from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Discount(models.Model):
    percentage = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = "discounts"
    
    def __str__(self):
        return self.percentage

class Game(models.Model):
    def upload_to(instance, filename):
        return 'game_covers/{filename}'.format(filename=filename)

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=5, decimal_places=2)
    upload_date = models.DateTimeField(auto_now_add=True)
    image_url = models.ImageField(upload_to=upload_to, default=None)
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")
    discount = models.ForeignKey(Discount, blank=True, null=True, on_delete=models.CASCADE)

    class Meta:
        db_table = "games"

    def __str__(self):
        return self.title + " - " + self.description + " - " + str(self.price)
    
class GameAttachment(models.Model):
    def upload_to(instance, filename):
        return 'game_attachments/{filename}'.format(filename=filename)
    
    image_url = models.ImageField(upload_to=upload_to, default=None)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    class Meta:
        db_table = "game_attachments"