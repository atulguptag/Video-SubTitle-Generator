from django.urls import path
from .views import (
    CustomAuthToken,
    UserRegistrationView,
    EmailVerificationView,
    ResendVerificationEmailView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    UserDetailView,
    GoogleLoginView,
    GoogleCallbackView,
    GoogleAuthProcessView,
)

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('verify-email/<uidb64>/<token>/',
         EmailVerificationView.as_view(), name='verify-email'),
    path('resend-verification-email/', ResendVerificationEmailView.as_view(),
         name='resend-verification-email'),
    path('request-password-reset/', PasswordResetRequestView.as_view(),
         name='request-password-reset'),
    path('verify-password-reset/', PasswordResetVerifyView.as_view(),
         name='verify-password-reset'),
    path('me/', UserDetailView.as_view(), name='user-detail'),

    # Google OAuth endpoints
    path('google/', GoogleLoginView.as_view(), name='google-login'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('google/process-token/', GoogleAuthProcessView.as_view(),
         name='google-process-token'),

]
