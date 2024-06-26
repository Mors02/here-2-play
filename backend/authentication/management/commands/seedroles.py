from django.core.management.base import BaseCommand, CommandError
from authentication.models import Role

class Command(BaseCommand):
    help = "crea i campi di default per tags"

    def handle(self, *args, **options):
        try:
            role = Role.objects.get(slug="developer")
            raise CommandError("Tabella \'Ruoli\' già popolata.")
        except Role.DoesNotExist:
            roles = [
                {"slug": "developer", "name": "Developer"},
                {"slug": "player", "name": "Giocatore"},
                {"slug": "admin", "name": "Moderatore"},
            ]
            
            for role in roles:
                roleObj = Role(**role)
                roleObj.save()
            self.stdout.write(self.style.SUCCESS('Ruoli creati.'))