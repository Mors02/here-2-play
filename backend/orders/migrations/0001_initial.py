# Generated by Django 4.2.13 on 2024-06-27 07:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('games', '0008_review_created_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.TextField(choices=[('pen', 'In corso'), ('com', 'Completato')], default='pen', max_length=3)),
                ('order_date', models.DateTimeField(blank=True, default=None, null=True)),
                ('payment_method', models.TextField(choices=[('pay', 'Paypal'), ('car', 'Carta di credito'), ('sat', 'Satispay'), ('not', 'Non scelto')], default='not', max_length=3)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_user', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'orders',
            },
        ),
        migrations.CreateModel(
            name='GamesBought',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('hidden', models.BooleanField(default=False)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='games_bought_game', to='games.game')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='games_bought_user', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'user_games',
                'unique_together': {('game', 'user')},
            },
        ),
        migrations.CreateModel(
            name='GameInOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_games_game', to='games.game')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_games_order', to='orders.order')),
            ],
            options={
                'db_table': 'order_games',
                'unique_together': {('game', 'order')},
            },
        ),
        migrations.CreateModel(
            name='BundleInOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bundle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_bundles_bundle', to='games.bundle')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_bundles_order', to='orders.order')),
            ],
            options={
                'db_table': 'order_bundles',
                'unique_together': {('bundle', 'order')},
            },
        ),
    ]
