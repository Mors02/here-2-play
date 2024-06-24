# Generated by Django 4.2.13 on 2024-06-24 12:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='order_date',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_method',
            field=models.TextField(choices=[('pay', 'Paypal'), ('car', 'Carta di credito'), ('sat', 'Satispay'), ('not', 'Non scelto')], default='not', max_length=3),
        ),
    ]