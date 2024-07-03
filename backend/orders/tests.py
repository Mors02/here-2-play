from django.utils import timezone
from datetime import timedelta
from django.test import TestCase
from django.test.client import Client
from authentication.models import Role, User, UserProfile
from games.models import Game, Bundle, BundleGames, Discount
from orders.models import GamesBought, Order
# Create your tests here.
class OrderViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        #user a cui appartiene l'ordine
        role = Role.objects.create(name="Developer", slug='developer')
        user = User.objects.create(username="Test", email="test@email.it")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        user = User.objects.create(username="Test2", email="test2@email.it")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        #creiamo un gioco non scontato
        Game.objects.create(title="Gioco di test", description="gioco di test", price=10, publisher_id=user.pk)

        #creiamo un bundle
        bundle = Bundle.objects.create(name="Bundle di prova", description="bundle di prova", discount=25, user_id=user.pk)
        #creiamo un gioco per il bundle
        game = Game.objects.create(title="Gioco di test 2", description="gioco di test 2", price=20, publisher_id=user.pk)
        BundleGames.objects.create(game_id=game.pk, bundle_id=bundle.pk)

        #creiamo un gioco scontato
        game = Game.objects.create(title="Gioco di test 3", description="gioco di test 3", price=30, publisher_id=user.pk)
        Discount.objects.create(game_id=game.pk, percentage=50, start_date=timezone.now(), end_date=timezone.now()+timedelta(days=5))

    def test_create_order(self):
        user = User.objects.get(id=2)

        #proviamo ad aggiungere un gioco da utenti anonimi
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 401)

        #proviamo ad aggiungere un bundle da utenti anonimi
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 401)

        self.client.force_login(user)

        #creiamo un ordine di un altro utente
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 201)

        user = User.objects.get(id=1)
        self.client.force_login(user)
        
        #controlliamo che l'ultimo ordine non esista
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 204)
                
        #aggiungiamo gioco esistente all'ordine
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 201)

        #aggiungiamo gioco inesistente all'ordine
        res = self.client.post('/api/orders/add-game/', {"game_id": 12})
        self.assertEqual(res.status_code, 404)

        #controlliamo che l'ordine esista
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 200)

        #aggiungiamo un bundle esistente all'ordine
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 201)

        #aggiungiamo un bundle inesistente all'ordine
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 12})
        self.assertEqual(res.status_code, 404)

        #aggiungiamo un gioco già dentro l'ordine
        res = self.client.post('/api/orders/add-game/', {"game_id": 1})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.content, b'"ERR_ALREADY_IN_CART"')

        #aggiungiamo un bundle già dentro l'ordine
        res = self.client.post('/api/orders/add-bundle/', {"bundle_id": 1})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.content, b'"ERR_ALREADY_IN_CART"')

        #aggiungiamo un gioco con lo sconto all'ordine
        res = self.client.post('/api/orders/add-game/', {"game_id": 3})
        self.assertEqual(res.status_code, 201)

        #completiamo un ordine di un altro user
        res = self.client.post('/api/orders/1/', {'method': 'pay'})
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.content, b'"ERR_NOT_PERMITTED"')

        #completiamo un ordine
        res = self.client.post('/api/orders/2/', {'method': 'pay'})
        self.assertEqual(res.status_code, 200)

        #controlliamo che i prezzi dei giochi siano corretti

        #gioco 1, prezzo base
        game1 = GamesBought.objects.get(id=1)
        self.assertEqual(game1.price, 10)
        
        #gioco 2, prezzo sconto bundle
        game2 = GamesBought.objects.get(id=2)
        #20 - 20 * 25% = 15 
        self.assertEqual(game2.price, 15)

        #gioco 2, prezzo sconto applicato
        game3 = GamesBought.objects.get(id=3)
        #30 - 30 * 50% = 15
        self.assertEqual(game3.price, 15)

        #controlliamo che l'ultimo ordine non esista
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, 204)