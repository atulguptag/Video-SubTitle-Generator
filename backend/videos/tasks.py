import os
from moviepy import VideoFileClip
from celery import shared_task
from videos.models import Video
from django.conf import settings
from subtitles.models import Subtitle
from subtitles.utils import generate_subtitles_for_video
import logging

file_name = "tasks.log"
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler = logging.FileHandler(file_name)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


@shared_task
def process_video(video_id):
    logger.info(f"Starting process_video task for video_id={video_id}")
    video = Video.objects.filter(id=video_id).first()

    if not video:
        logger.error(f"No video found with ID {video_id}")
        return

    try:
        # Step 1: Generate thumbnail
        logger.info(f"Generating thumbnail for video ID {video_id}...")
        thumbnail_path = os.path.join(
            settings.MEDIA_ROOT, 'thumbnails', f'{video.id}.jpg')
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)

        logger.info(f"Video file path: {video.file.path}")
        clip = VideoFileClip(video.file.path)
        clip.save_frame(thumbnail_path, t=1)

        video.thumbnail = os.path.relpath(thumbnail_path, settings.MEDIA_ROOT)
        video.duration = clip.duration  # Set duration here
        clip.close()
        logger.info(
            f"Thumbnail generated successfully for video ID {video_id}")

        # Step 2: Generate subtitles with unique video path
        logger.info(f"Generating subtitles for video ID {video_id}...")
        transcript, subtitles_json, _ = generate_subtitles_for_video(
            video.file.path, 'en')
        logger.info(
            f"Subtitles generated successfully for video ID {video_id}")

        # Step 3: Save subtitles to the database
        logger.info(f"Saving subtitles to database for video ID {video_id}...")

        # Check if subtitles already exist and delete them
        existing_subtitles = Subtitle.objects.filter(video=video)
        if existing_subtitles.exists():
            logger.warning(
                f"Found existing subtitles for video ID {video_id}, deleting...")
            existing_subtitles.delete()

        Subtitle.objects.create(
            video=video,
            user=video.user,
            transcript=transcript,
            subtitles_json=subtitles_json,
            language='en'
        )
        logger.info(f"Subtitles saved successfully for video ID {video_id}")

        # Step 4: Update video status to "ready"
        video.status = "ready"
        video.save()
        logger.info(
            f"Video {video_id} processed successfully and status set to 'ready'")
        logger.info(
            "**********************************************************")
    except Exception as e:
        logger.error(f"Error processing video {video_id}: {str(e)}")
        video.status = 'error'
        video.error_message = str(e)
        video.save()
        raise
