from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture',
                  'phone', 'location', 'bio', 'social_links']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password2 = serializers.CharField(
        style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        """Validate that passwords match."""
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        """Create and return a new user."""
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    social_links = serializers.JSONField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'location',
                  'bio', 'social_links', 'profile_picture']
        read_only_fields = ['email']  # Email should be read-only for security

    def update(self, instance, validated_data):
        """Update and return an existing user."""
        instance.username = validated_data.get('username', instance.username)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.location = validated_data.get('location', instance.location)
        instance.bio = validated_data.get('bio', instance.bio)

        social_links = validated_data.get('social_links')
        if social_links:
            instance.social_links = social_links

        profile_picture = validated_data.get('profile_picture')
        if profile_picture:
            instance.profile_picture = profile_picture

        instance.save()
        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""

    email = serializers.EmailField()

    def validate_email(self, value):
        """Validate that the email exists."""
        if not User.objects.filter(email=value).exists():
            pass  # We don't want to reveal if an email exists or not
        return value


class PasswordResetVerifySerializer(serializers.Serializer):
    """Serializer for password reset verification."""

    email = serializers.EmailField()
    verification_code = serializers.CharField()
    new_password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, data):
        """Validate the verification code and password."""
        email = data.get('email')
        verification_code = data.get('verification_code')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email not found.")

        if not user.verification_code:
            raise serializers.ValidationError(
                "No verification code was requested.")

        if user.verification_code != verification_code:
            raise serializers.ValidationError("Invalid verification code.")

        if user.verification_code_expiry and user.verification_code_expiry < timezone.now():
            raise serializers.ValidationError("Verification code has expired.")

        return data


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification after registration."""

    email = serializers.EmailField()
    verification_code = serializers.CharField(min_length=6, max_length=6)

    def validate(self, data):
        """Validate the verification code."""
        email = data.get('email')
        verification_code = data.get('verification_code')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email not found.")

        if not user.verification_code:
            raise serializers.ValidationError(
                "No verification code was sent for this email.")

        if user.verification_code != verification_code:
            raise serializers.ValidationError("Invalid verification code.")

        if user.verification_code_expiry and user.verification_code_expiry < timezone.now():
            raise serializers.ValidationError(
                "Verification code has expired. Please request a new one.")

        return data
