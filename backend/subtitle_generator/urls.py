from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from subtitles.api.views import export_subtitle
from django.http import HttpResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('videos.api.urls')),
    path('api/', include('subtitles.api.urls')),
    path('api/auth/', include('authentication.api.urls')),

    # Direct explicit path - no router involved
    # re_path(r'^api/subtitles/(?P<pk>\d+)/download$', export_subtitle, name='direct-export'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
