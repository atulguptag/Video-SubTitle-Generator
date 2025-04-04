# Generated by Django 5.1.7 on 2025-03-15 07:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('videos', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Subtitle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transcript', models.TextField()),
                ('subtitles_json', models.JSONField()),
                ('font', models.CharField(choices=[('montserrat', 'Montserrat'), ('roboto', 'Roboto'), ('arial', 'Arial'), ('comicsans', 'Comic Sans')], default='montserrat', max_length=20)),
                ('style', models.CharField(choices=[('bold', 'Bold with Popping Effects'), ('clean', 'Clean'), ('classic', 'Classic Hormozi'), ('comic', 'Comic'), ('banger', 'Banger Effect'), ('karaoke', 'Karaoke-style Word-by-Word')], default='clean', max_length=20)),
                ('language', models.CharField(choices=[('en', 'English'), ('hi', 'Hindi')], default='en', max_length=5)),
                ('font_size', models.IntegerField(default=16)),
                ('font_color', models.CharField(default='#FFFFFF', max_length=7)),
                ('background_color', models.CharField(default='#000000', max_length=7)),
                ('background_opacity', models.FloatField(default=0.5)),
                ('text_alignment', models.CharField(default='center', max_length=10)),
                ('output_file', models.FileField(blank=True, null=True, upload_to='subtitles/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subtitles', to=settings.AUTH_USER_MODEL)),
                ('video', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subtitles', to='videos.video')),
            ],
        ),
    ]
