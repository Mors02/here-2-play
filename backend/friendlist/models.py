from django.db import models
from authentication.models import User

class UserReport(models.Model):
    HARASSMENT = "ha"
    SPAM = "sp"
    BOT = "bo"
    SCAM = "sc"
    OTHER = "ot"

    CHOICES = {
        (HARASSMENT, "Molestie"),
        (SPAM, "Spam"),
        (BOT, "È un bot"),
        (SCAM, "È un truffatore"),
        (OTHER, "Altro")
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    user_reported = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_reported")
    report_date = models.DateTimeField()
    cause = models.CharField(max_length=2, choices=CHOICES, default=OTHER)