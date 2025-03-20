from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubtitleViewSet
from subtitles.views import export_subtitle

router = DefaultRouter()
router.register(r'subtitles', SubtitleViewSet, basename='subtitle')

urlpatterns = [
    path('', include(router.urls)),
    path('subtitles/<int:pk>/export_subtitle/',
         export_subtitle, name='export-subtitle'),
]
