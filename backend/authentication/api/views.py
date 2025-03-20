import os
import random
import json
import string
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    ProfileUpdateSerializer,
)
import requests
from google.oauth2 import id_token
from django.shortcuts import redirect
from google.auth.transport import requests as google_requests

User = get_user_model()


def generate_verification_code():
    """Generate a 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=6))


class CustomAuthToken(ObtainAuthToken):
    """Custom authentication token view that supports both username and email login."""

    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get('emailOrUsername')
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response({
                'error': 'Please provide email/username and password'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Try to find user by email or username
        user = None
        if '@' in email_or_username:
            # Input contains @ symbol, treat as email
            user = User.objects.filter(email=email_or_username).first()
        else:
            # Treat as username
            user = User.objects.filter(username=email_or_username).first()

        if not user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate with email and password since USERNAME_FIELD is set to 'email'
        authenticated_user = authenticate(email=user.email, password=password)

        if authenticated_user:
            token, created = Token.objects.get_or_create(
                user=authenticated_user)
            return Response({
                'token': token.key,
                'user_id': authenticated_user.pk,
                'email': authenticated_user.email,
                'user': UserSerializer(authenticated_user).data
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration."""

    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate verification token and send email
        try:
            self.send_verification_email(request, user)
        except Exception as e:
            print(f"Failed to send verification email: {str(e)}")

        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'message': 'Registration successful! Please check your email to verify your account.'
        }, status=status.HTTP_201_CREATED)

    def send_verification_email(self, request, user):
        """Send verification email with link."""
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verification_url = f"{settings.FRONTEND_URL}/verification-email/{uid}/{token}/"

        email_subject = "Verify Your Email Address"
        email_message = f"""
        Hello {user.username},

        Thank you for registering with the AI-Powered Video Subtitle Generator.
        
        Please click the link below to verify your email address:
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you did not create an account, please ignore this email.
        
        Thank you,
        Video Subtitle Generator Team
        """

        send_mail(
            subject=email_subject,
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class EmailVerificationView(APIView):
    """View for verifying user email via link."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_email_verified = True
            user.save()
            return Response({
                'message': 'Email verified successfully! You can now log in.',
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                'error': 'Invalid or expired verification link.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(APIView):
    """View for resending verification email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.is_email_verified:
                return Response({
                    'message': 'Email is already verified.'
                })

            # Generate new verification link and send email
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verification_url = request.build_absolute_uri(
                reverse('verify-email', args=[uid, token])
            )

            email_subject = "Verify Your Email Address"
            email_message = f"""
            Hello {user.username},

            You requested a new verification link for your AI-Powered Video Subtitle Generator account.
            
            Please click the link below to verify your email address:
            {verification_url}
            
            This link will expire in 24 hours.
            
            If you did not request this verification, please ignore this email.
            
            Thank you,
            Video Subtitle Generator Team
            """

            send_mail(
                subject=email_subject,
                message=email_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({
                'message': 'Verification email has been sent.'
            })

        except User.DoesNotExist:
            return Response({
                'error': 'User with this email does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Failed to send verification email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestView(APIView):
    """View for requesting password reset."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        try:
            user = User.objects.filter(email=email).first()

            # Generate verification code
            verification_code = generate_verification_code()
            user.verification_code = verification_code
            user.verification_code_expiry = timezone.now() + timedelta(minutes=10)
            user.save()

            # Send email with verification code
            email_subject = "Password Reset Verification"
            email_message = f"""
            Hello {user.username},

            You requested a password reset for your AI-Powered Video Subtitle Generator account.
            
            Your password reset code is: {verification_code}
            
            This code will expire in 10 minutes.
            
            If you did not request this reset, please ignore this email.
            
            Thank you,
            Video Subtitle Generator Team
            """

            send_mail(
                subject=email_subject,
                message=email_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({
                'message': 'Verification code has been sent to your email.'
            })

        except User.DoesNotExist:
            return Response({
                'message': 'If a user with this email exists, a verification code has been sent.'
            })
        except Exception as e:
            return Response({
                'error': f'Failed to send verification code: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetVerifyView(APIView):
    """View for verifying password reset code and setting new password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.verification_code = None
        user.verification_code_expiry = None
        user.save()

        return Response({'message': 'Password has been reset successfully.'})


class UserDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user details."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return ProfileUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Handle profile picture removal
        if request.data.get('remove_profile_picture') == 'true':
            # Get the old file path if it exists
            if instance.profile_picture:
                try:
                    old_picture_path = instance.profile_picture.path

                    # Delete the file if it exists
                    if os.path.isfile(old_picture_path):
                        os.remove(old_picture_path)

                    # Clear the profile_picture field
                    instance.profile_picture = None
                    instance.save(update_fields=['profile_picture'])
                except Exception as e:
                    print(f"Error removing profile picture: {e}")

        # Handle profile picture update (existing code)
        elif 'profile_picture' in request.FILES:
            # Check if we should delete the old picture
            old_picture_filename = request.data.get('old_profile_picture')

            if old_picture_filename and instance.profile_picture:
                try:
                    # Get the old file path
                    old_picture_path = os.path.join(
                        settings.MEDIA_ROOT, 'profile_pictures', old_picture_filename)

                    # Delete the old file if it exists
                    if os.path.isfile(old_picture_path):
                        os.remove(old_picture_path)
                except Exception as e:
                    # Log the error but continue with update
                    print(f"Error deleting old profile picture: {e}")

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response({
            'user': UserSerializer(instance, context=self.get_serializer_context()).data,
            'message': 'Profile updated successfully'
        })


class GoogleLoginView(APIView):
    """View for initiating Google OAuth login."""

    def get(self, request):
        """Redirect to Google OAuth consent screen."""
        google_auth_url = (
            f"https://accounts.google.com/o/oauth2/auth"
            f"?client_id={settings.GOOGLE_CLIENT_ID}"
            f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope=email profile"
            f"&access_type=offline"
        )
        return redirect(google_auth_url)


class GoogleCallbackView(APIView):
    """Handle Google OAuth callback."""

    def get(self, request):
        """Process Google OAuth callback."""
        code = request.GET.get('code')
        error = request.GET.get('error')

        if error or not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=google_auth_failed")

        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=token_data)
        if token_response.status_code != 200:
            return redirect(f"{settings.FRONTEND_URL}/login?error=token_exchange_failed")

        token_json = token_response.json()
        id_info = id_token.verify_oauth2_token(
            token_json['id_token'],
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Check if user exists, create if not
        email = id_info.get('email')
        if not email:
            return redirect(f"{settings.FRONTEND_URL}/login?error=email_not_provided")

        # Get or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user
            username = id_info.get('name', '').replace(
                ' ', '') or email.split('@')[0]
            user = User.objects.create(
                email=email,
                username=username,
                is_email_verified=id_info.get('email_verified', False)
            )
            # Set a random password since it's not used for OAuth login
            user.set_unusable_password()
            user.save()

        # Generate auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Redirect to frontend with token
        return redirect(f"{settings.FRONTEND_URL}/google-auth-success?token={token.key}")


class GoogleAuthProcessView(APIView):
    """Process Google authentication token from frontend."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Process Google access token sent from frontend."""
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Use access token to get user info from Google
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'}
            )

            if user_info_response.status_code != 200:
                return Response(
                    {'error': f'Failed to get user info: {user_info_response.text}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_info = user_info_response.json()

            # Get user email
            email = user_info.get('email')
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create new user
                username = user_info.get('name', '').replace(
                    ' ', '') or email.split('@')[0]

                # Check if username exists, add numbers if needed
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create(
                    email=email,
                    username=username,
                    is_email_verified=user_info.get('email_verified', False)
                )
                user.set_unusable_password()
                user.save()

            # Generate auth token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_email_verified': user.is_email_verified
                }
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error processing token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeleteAccountView(APIView):
    """View for deleting user account."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user

        try:
            # Get related objects to delete
            videos = user.videos.all()
            for video in videos:
                video.delete()

            # Delete subtitles
            subtitles = user.subtitles.all()
            subtitles.delete()

            # Revoke auth token
            Token.objects.filter(user=user).delete()

            # Delete the user
            user.delete()

            return Response(
                {"detail": "Account successfully deleted"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Failed to delete account: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExportUserDataView(APIView):
    """View for exporting all user data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            # Collect user data
            user_data = UserSerializer(user).data

            # Collect video data
            videos = user.videos.all()
            video_data = [
                {
                    'id': video.id,
                    'title': video.title,
                    'description': video.description,
                    'created_at': video.created_at.isoformat(),
                    'file_path': video.file.name if video.file else None,
                }
                for video in videos
            ]

            # Collect subtitle data
            subtitles = user.subtitles.all()
            subtitle_data = [
                {
                    'id': subtitle.id,
                    'video_id': subtitle.video_id,
                    'language': subtitle.language,
                    'transcript': subtitle.transcript,
                    'subtitles_json': subtitle.subtitles_json,
                    'font': subtitle.font,
                    'style': subtitle.style,
                    'created_at': subtitle.created_at.isoformat() if subtitle.created_at else None,
                }
                for subtitle in subtitles
            ]

            # Create data package
            data_package = {
                'user': user_data,
                'videos': video_data,
                'subtitles': subtitle_data,
            }

            # Create JSON response
            response = HttpResponse(
                json.dumps(data_package, indent=4),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="{user.username}_data_export.json"'

            return response

        except Exception as e:
            return Response(
                {"detail": f"Failed to export user data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
