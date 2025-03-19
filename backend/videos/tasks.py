import os
from moviepy import VideoFileClip
from celery import shared_task
from videos.models import Video
from django.conf import settings
from subtitles.models import Subtitle
from subtitles.utils import generate_subtitles_for_video
import logging

logger = logging.getLogger(__name__)


@shared_task
def process_video(video_id):
    logger.info(f"Starting process_video task for video_id={video_id}")
    video = Video.objects.filter(id=video_id).first()
    try:
        # Step 1: Simulate video processing (e.g., extract audio, generate thumbnails)
        logger.info("Generating thumbnail...")
        thumbnail_path = os.path.join(
            settings.MEDIA_ROOT, 'thumbnails', f'{video.id}.jpg')
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)

        logger.info(f"Video file path: {video.file.path}")
        clip = VideoFileClip(video.file.path)
        clip.save_frame(thumbnail_path, t=1)

        video.thumbnail = os.path.relpath(thumbnail_path, settings.MEDIA_ROOT)
        clip.close()
        logger.info("Thumbnail generated successfully")

        # Step 2: Generate subtitles
        logger.info("Generating subtitles...")
        transcript, subtitles_json, duration = generate_subtitles_for_video(
            video.file.path, 'en')
        logger.info("Subtitles generated successfully")

        # Step 3: Save subtitles to the database
        logger.info("Saving subtitles to database...")
        Subtitle.objects.create(
            video=video,
            user=video.user,
            transcript=transcript,
            subtitles_json=subtitles_json,
            language='en'
        )
        logger.info("Subtitles saved successfully")

        # Step 4: Update video status to "ready" and save duration to the Video model
        video.duration = duration
        video.status = "ready"
        video.save()
        logger.info(
            f"Video {video.id} processed successfully and status set to 'ready'")
    except Exception as e:
        video.status = 'error'
        video.error_message = str(e)
        video.save()
        logger.error(f"Error processing video {video.id}: {str(e)}")
        raise
