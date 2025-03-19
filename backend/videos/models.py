from django.db import models
from django.conf import settings


class Video(models.Model):
    """Model for storing video metadata and file paths."""

    STATUS_CHOICES = (
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('error', 'Error'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(
        upload_to='thumbnails/', null=True, blank=True)

    duration = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='uploading')
    error_message = models.TextField(null=True, blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='videos')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
