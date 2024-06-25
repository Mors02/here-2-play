from django.core.management.base import BaseCommand, CommandError
from games.models import Category

class Command(BaseCommand):
    def handle(self, *args, **options):
        alreadyPopulated = Category.objects.all().count()

        if alreadyPopulated > 0:
            raise CommandError('Sono già presenti delle categorie')
        
        categories = [
            {'name': 'Action', 'slug': 'action'},
            {'name': 'Casual', 'slug': 'casual'},
            {'name': 'Adventure RPG', 'slug': 'adventure_rpg'},
            {'name': 'Puzzle', 'slug': 'puzzle'},
            {'name': 'Strategy', 'slug': 'strategy'},
            {'name': 'Racing', 'slug': 'racing'},
            {'name': 'Tower Defense', 'slug': 'tower_defense'},
            {'name': 'Rogue-Like', 'slug': 'rogue_like'},
            {'name': 'Turn-Based', 'slug': 'turn_based'},
            {'name': 'Sandbox & Physics', 'slug': 'sandbox_physics'},
        ]

        for value in categories:
            category = Category(**value)
            category.save()

        self.stdout.write(self.style.SUCCESS('Categorie aggiunte!'))