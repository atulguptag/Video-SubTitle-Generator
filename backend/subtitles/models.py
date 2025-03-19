from django.db import models
from django.conf import settings
from videos.models import Video


class Subtitle(models.Model):
    """Model to save auto-generated and edited subtitles, including styling options."""

    FONT_CHOICES = (
        ('montserrat', 'Montserrat'),
        ('roboto', 'Roboto'),
        ('arial', 'Arial'),
        ('comicsans', 'Comic Sans'),
    )

    STYLE_CHOICES = (
        ('bold', 'Bold with Popping Effects'),
        ('clean', 'Clean'),
        ('classic', 'Classic Hormozi'),
        ('comic', 'Comic'),
        ('banger', 'Banger Effect'),
        ('karaoke', 'Karaoke-style Word-by-Word'),
    )

    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('hi', 'Hindi'),
    )

    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name='subtitles')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='subtitles')

    # Subtitle content and timing
    transcript = models.TextField()
    subtitles_json = models.JSONField()

    # Styling options
    font = models.CharField(
        max_length=20, choices=FONT_CHOICES, default='montserrat')
    style = models.CharField(
        max_length=20, choices=STYLE_CHOICES, default='clean')
    language = models.CharField(
        max_length=5, choices=LANGUAGE_CHOICES, default='en')

    # Custom styling options
    font_size = models.IntegerField(default=16)
    font_color = models.CharField(
        max_length=7, default='#FFFFFF')
    background_color = models.CharField(
        max_length=7, default='#000000')
    background_opacity = models.FloatField(default=0.5)
    text_alignment = models.CharField(
        max_length=10, default='center')

    # Output file
    # For downloadable subtitle file
    output_file = models.FileField(
        upload_to='subtitles/', null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subtitles for {self.video.title} - {self.get_language_display()}"
