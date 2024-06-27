from django.db import models
from games.models import Game, Bundle
from authentication.models import User
from django.core.validators import MinValueValidator

class Order(models.Model):        
    PENDING = "pen"
    COMPLETED = "com"
    PAYPAL = "pay"
    CARD = "car"
    SATISPAY = "sat"
    NOT_CHOSEN = "not"

    STATUSES = [
        (PENDING, "In corso"),
        (COMPLETED, "Completato")
    ]

    PAYMENT_METHODS = [
        (PAYPAL, "Paypal"),
        (CARD, "Carta di credito"),
        (SATISPAY, "Satispay"),
        (NOT_CHOSEN, "Non scelto")
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="order_user")
    status = models.TextField(max_length=3, choices=STATUSES, default=PENDING)
    order_date = models.DateTimeField(default=None, blank=True, null=True)
    payment_method = models.TextField(max_length=3, choices=PAYMENT_METHODS, default=NOT_CHOSEN)

    class Meta:
        db_table = "orders"        

class GameInOrder(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="order_games_game")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_games_order")

    class Meta:
        db_table = "order_games"
        unique_together = ('game', 'order')

class BundleInOrder(models.Model):
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name="order_bundles_bundle")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_bundles_order")

    class Meta:
        db_table = "order_bundles"
        unique_together = ('bundle', 'order')

class GamesBought(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="games_bought_game")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_bought_user")
    created_at = models.DateTimeField(auto_now_add=True)
    hidden = models.BooleanField(default=False)
    price = models.FloatField(validators=[MinValueValidator(0)])

    class Meta:
        db_table = "user_games"
        unique_together = ('game', 'user')


