import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'subtitle_generator.settings')

app = Celery('subtitle_generator', broker='redis://127.0.0.1:6379/0')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
