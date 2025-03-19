from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model for the subtitle generator application.
    Extends the default Django User model with additional fields.
    """
    email = models.EmailField(_('email address'), unique=True)

    # Fields for additional user information
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', null=True, blank=True)

    # Field for storing verification code for password reset
    verification_code = models.CharField(max_length=6, null=True, blank=True)
    verification_code_expiry = models.DateTimeField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)

    # Required fields for social authentication
    is_google_user = models.BooleanField(default=False)
    is_facebook_user = models.BooleanField(default=False)
    social_id = models.CharField(max_length=255, null=True, blank=True)

    # Profile fields
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
