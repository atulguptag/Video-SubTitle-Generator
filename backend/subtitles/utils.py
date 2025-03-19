import os
import tempfile
from django.conf import settings
from openai import OpenAI
from moviepy import VideoFileClip
import logging

logger = logging.getLogger(__name__)


def extract_audio_from_video(video_path):
    """Extract audio from video file."""
    try:
        video = VideoFileClip(video_path)

        # Create a temporary file for the audio
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_audio:
            audio_path = temp_audio.name

        # Extract audio to the temporary file
        video.audio.write_audiofile(audio_path, logger=None)
        video.close()

        return audio_path
    except Exception as e:
        logger.error(f"Error extracting audio from video: {str(e)}")
        raise


def generate_transcript_with_timestamps(audio_path, language="en"):
    """
    Generate transcript with timestamps using OpenAI's Whisper API.
    """
    try:
        # Initialize the OpenAI client
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )

        # Extract the transcript
        transcript = response.text

        # Extract segments with timestamps
        segments = []
        for segment in response.segments:
            segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })

        return transcript, segments
    except Exception as e:
        logger.error(f"Error generating transcript with OpenAI: {str(e)}")
        raise
    finally:
        # Clean up the temporary audio file
        if os.path.exists(audio_path):
            os.unlink(audio_path)


def group_segments_into_subtitles(segments, max_chars=70):
    """
    Group segments into subtitle entries based on character limit and timing.
    """
    subtitles = []
    current_text = ""
    current_start = None
    current_end = None

    for segment in segments:
        # If adding this segment would exceed max_chars, create a new subtitle
        if len(current_text) + len(segment["text"]) > max_chars and current_text:
            subtitles.append({
                "start": current_start,
                "end": current_end,
                "text": current_text.strip()
            })
            current_text = ""
            current_start = None

        # Start a new subtitle or add to existing
        if not current_start:
            current_start = segment["start"]

        current_text += " " + segment["text"]
        current_end = segment["end"]

    # Add the last subtitle if there's any text left
    if current_text:
        subtitles.append({
            "start": current_start,
            "end": current_end,
            "text": current_text.strip()
        })

    return subtitles


def generate_subtitles_for_video(video_path, language="en"):
    """
    Generate subtitles for a video using AI.
    Returns the full transcript, subtitles, and video duration.
    """
    try:
        # Extract audio and get video duration
        video = VideoFileClip(video_path)
        duration = video.duration
        video.close()

        # Extract audio from video
        audio_path = extract_audio_from_video(video_path)

        # Generate transcript with timestamps
        transcript, segments = generate_transcript_with_timestamps(
            audio_path, language)

        # Group segments into subtitles
        subtitles = group_segments_into_subtitles(segments)

        return transcript, subtitles, duration
    except Exception as e:
        logger.error(f"Error generating subtitles: {str(e)}")
        raise
