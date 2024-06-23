from django.db import models
from authentication.models import User
from games.models import Game

class UserReport(models.Model):
    class Meta:
        db_table = "user_reports"

    HARASSMENT = "ha"
    SPAM = "sp"
    BOT = "bo"
    SCAM = "sc"
    OTHER = "ot"

    USER_CHOICES = [
        (HARASSMENT, "Molestie"),
        (SPAM, "Spam"),
        (BOT, "È un bot"),
        (SCAM, "È un truffatore"),
        (OTHER, "Altro")
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    user_reported = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_reported")
    report_date = models.DateTimeField()
    cause = models.CharField(max_length=2, choices=USER_CHOICES, default=OTHER)

class GameReport(models.Model):
    class Meta:
        db_table = "game_reports"

    EXPLICIT = "ex"
    HATE_SPEECH = "ha"
    RACISM = "ra"
    SCAM = "sc"
    OTHER = "ot"

    GAME_CHOICES = [
        (EXPLICIT, "Contenuti sessuali espliciti"),
        (HATE_SPEECH, "Incitazione all'odio"),
        (RACISM, "Razzismo"),
        (SCAM, "È una truffa"),
        (OTHER, "Altro")
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="game_report_user")
    game_reported = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="game_reported")
    report_date = models.DateTimeField()
    cause = models.CharField(max_length=2, choices=GAME_CHOICES, default=OTHER)

class FriendRequest(models.Model):
    class Meta:
        db_table = "friend_requests"

    PENDING = "pen"
    ACCEPTED = "acc"
    DENIED = "den"

    STATUSES = [
        (PENDING, "In attesa"),
        (ACCEPTED, "Accettata"),
        (DENIED, "Rifiutata")
    ]

    user_requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="request_user_requester")
    user_requested = models.ForeignKey(User, on_delete=models.CASCADE, related_name="request_user_requested")
    date = models.DateTimeField()
    status = models.CharField(max_length=3, choices=STATUSES, default=PENDING)

class Friendship(models.Model):
    class Meta:
        db_table = "friendships"

    userA = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user_A")
    userB = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user_B")