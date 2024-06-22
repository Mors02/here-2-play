# Generated by Django 4.2.13 on 2024-06-22 13:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('friendlist', '0002_alter_userreport_cause_alter_userreport_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userreport',
            name='cause',
            field=models.CharField(choices=[('bo', 'È un bot'), ('sc', 'È un truffatore'), ('sp', 'Spam'), ('ha', 'Molestie'), ('ot', 'Altro')], default='ot', max_length=2),
        ),
    ]
