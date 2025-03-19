from django.urls import path
from .views import (
    CustomAuthToken,
    UserRegistrationView,
    EmailVerificationView,
    ResendVerificationEmailView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    UserDetailView,
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
]
