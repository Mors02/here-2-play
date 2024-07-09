from django.utils import timezone
from datetime import timedelta
from django.test import TestCase
from django.test.client import Client
from authentication.models import Role, User, UserProfile
from games.models import Game, Bundle, BundleGames, Discount
from orders.models import GamesBought, Order

class OrderViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        # User a cui appartiene l'ordine
        Role.objects.create(name="Developer", slug='developer')

        user = User.objects.create(username="Test", email="test@email.it")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        user = User.objects.create(username="Test2", email="test2@email.it")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        # Creiamo un gioco non scontato
        Game.objects.create(title="Gioco di test", description="gioco di test", price=10, publisher_id=user.pk)

        # Creiamo un bundle
        bundle = Bundle.objects.create(name="Bundle di prova", description="bundle di prova", discount=25, user_id=user.pk)
        # Creiamo un gioco per il bundle
        game = Game.objects.create(title="Gioco di test 2", description="gioco di test 2", price=20, publisher_id=user.pk)
        BundleGames.objects.create(game_id=game.pk, bundle_id=bundle.pk)

        # Creiamo un gioco scontato
        game = Game.objects.create(title="Gioco di test 3", description="gioco di test 3", price=30, publisher_id=user.pk)
        Discount.objects.create(game_id=game.pk, percentage=50, start_date=timezone.now(), end_date=timezone.now()+timedelta(days=5))

    # Proviamo ad aggiungere un gioco da utenti anonimi
    def test_add_game_order_as_anonymous(self):
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 401)

    # Proviamo ad aggiungere un bundle da utenti anonimi
    def test_add_bundle_order_as_anonymous(self):
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 401)

    # Creiamo un ordine come user
    def test_add_game_order_as_user(self):
        user = User.objects.get(id=2)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 201)

        # Controlliamo che l'ultimo ordine non esista dall'altro utente
        user = User.objects.get(id=1)
        self.client.force_login(user)
        
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 204)

        # Completiamo un ordine di un altro user
        res = self.client.post('/api/orders/1/', {'method': 'pay'})
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.content, b'"ERR_NOT_PERMITTED"')

        # Completiamo un ordine con l'utente corretto
        user = User.objects.get(id=2)
        self.client.force_login(user)

        res = self.client.post('/api/orders/1/', {'method': 'pay'})
        self.assertEqual(res.status_code, 200)

        # Controlliamo se il prezzo è corretto
        game1 = GamesBought.objects.get(id=1)
        self.assertEqual(game1.price, 10)

        # Controlliamo che il carrello sia vuoto
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 204)

    # Aggiungiamo gioco esistente all'ordine
    def test_add_existing_game_to_order(self):
        user = User.objects.get(id=1)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 201)

        # Controlliamo che l'ordine esista
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 200)

        # Aggiungiamo un gioco già dentro l'ordine
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.content, b'"ERR_ALREADY_IN_CART"')

    # Aggiungiamo gioco inesistente all'ordine
    def test_add_inexisting_game_to_order(self):
        user = User.objects.get(id=1)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-game/', {"game_id": 12})
        self.assertEqual(res.status_code, 404)

    # Aggiungiamo un bundle esistente all'ordine
    def test_add_existing_bundle_to_order(self):
        user = User.objects.get(id=1)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 201)

        # Aggiungiamo un bundle già dentro l'ordine
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.content, b'"ERR_ALREADY_IN_CART"')

        # Completiamo l'ordine
        res = self.client.post('/api/orders/1/', {'method': 'pay'})
        self.assertEqual(res.status_code, 200)

        # Controlliamo il prezzo scontato
        game = GamesBought.objects.get(id=1)
        # 20 - 20 * 25% = 15 
        self.assertEqual(game.price, 15)

    # Aggiungiamo un bundle inesistente all'ordine
    def test_add_inexisting_bundle_to_order(self):
        user = User.objects.get(id=1)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 12})
        self.assertEqual(res.status_code, 404)

    # Aggiungiamo un gioco con lo sconto all'ordine
    def test_add_game_order_with_discount(self):
        user = User.objects.get(id=1)
        self.client.force_login(user)

        res = self.client.post('/api/orders/add-game/', {"game_id": 3})
        self.assertEqual(res.status_code, 201)

        # Completiamo l'ordine
        res = self.client.post('/api/orders/1/', {'method': 'pay'})
        self.assertEqual(res.status_code, 200)

        # Controlliamo il prezzo scontato
        game = GamesBought.objects.get(id=1)
        # 30 - 30 * 50% = 15
        self.assertEqual(game.price, 15)
        