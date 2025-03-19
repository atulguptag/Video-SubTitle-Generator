from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubtitleViewSet, export_subtitle

router = DefaultRouter()
router.register(r'', SubtitleViewSet, basename='subtitle')

# Create a direct URL pattern for generating subtitles
generate_view = SubtitleViewSet.as_view({'post': 'generate'})

urlpatterns = [
    path('subtitles/', include(router.urls)),
    path('subtitles/<int:pk>/download/', export_subtitle, name='subtitle-export'),
    path('subtitles/generate/', generate_view, name='subtitle-generate'),
]
