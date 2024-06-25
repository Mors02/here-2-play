from django.core.management.base import BaseCommand, CommandError
from games.models import Tag

class Command(BaseCommand):
    help = "crea i campi di default per tags"

    def handle(self, *args, **options):
        try:
            tag = Tag.objects.get(slug="good_story")
            raise CommandError("Tabella \'Tag\' già popolata.")
        except Tag.DoesNotExist:
            tags = [
                {"slug": "good_story", "name": "Trama affascinante"},
                {"slug": "good_chars", "name": "Ottimi personaggi"},
                {"slug": "new_gameplay", "name": "Gameplay innovativo"},
                {"slug": "good_ambience", "name": "Ambientazione interessante"},
                {"slug": "dark_ambience", "name": "Ambientazione scura"},
                {"slug": "medieval", "name": "Medioevale"},
                {"slug": "futuristic", "name": "Futuristico"},
                {"slug": "plot_twist", "name": "Plot Twist"},
                {"slug": "inclusive", "name": "Inclusivo"},
                {"slug": "funny", "name": "Divertente"},
                {"slug": "sad", "name": "Deprimente"},
                {"slug": "emotional", "name": "Emotivo"},
            ]
            
            for tag in tags:
                tagObj = Tag(**tag)
                tagObj.save()
            self.stdout.write(self.style.SUCCESS('Tags creati.'))