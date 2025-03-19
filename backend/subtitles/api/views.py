import os
import json
from subtitles.models import Subtitle
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from subtitles.utils import generate_subtitles_for_video
from rest_framework import viewsets, status, permissions
from .serializers import SubtitleSerializer, SubtitleStyleSerializer, SubtitleGenerateSerializer
from django.http import HttpResponse


class SubtitleViewSet(viewsets.ModelViewSet):
    """ViewSet for the Subtitle model."""

    queryset = Subtitle.objects.all()
    serializer_class = SubtitleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return subtitles for the current user only."""
        return Subtitle.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class based on the action."""
        if self.action == 'update_style':
            return SubtitleStyleSerializer
        elif self.action == 'generate':
            return SubtitleGenerateSerializer
        return SubtitleSerializer

    def perform_create(self, serializer):
        """Save the subtitle with the current user as owner."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_style(self, request, pk=None):
        """Update the subtitle styling."""
        subtitle = self.get_object()
        serializer = self.get_serializer(
            subtitle, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate subtitles for a video."""
        try:
            print(f"Received subtitle generation request: {request.data}")

            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(
                    {'detail': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            video = serializer.validated_data['video']
            language = serializer.validated_data.get('language', 'en')

            # Check if video exists and has a file
            if not video or not video.file:
                return Response(
                    {'detail': 'Video file is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Allow generation if video is "ready" or "error" (for regeneration)
            if video.status not in ['ready', 'error']:
                return Response(
                    {'detail': f'Video is not in a state where subtitles can be generated. Current status: {video.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if subtitles already exist for this language
            existing_subtitle = Subtitle.objects.filter(
                video=video, language=language).first()
            if existing_subtitle:
                # Delete existing subtitle to allow regeneration
                existing_subtitle.delete()

            # Get the video file path
            video_path = os.path.join(os.getcwd(), video.file.path)
            if not os.path.exists(video_path):
                return Response(
                    {'detail': 'Video file not found on server'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Generate subtitles using AI
            transcript, subtitles_json = generate_subtitles_for_video(
                video_path, language)

            # Create a new subtitle instance
            subtitle = Subtitle.objects.create(
                video=video,
                user=request.user,
                transcript=transcript,
                subtitles_json=subtitles_json,
                language=language
            )

            return Response(
                SubtitleSerializer(subtitle).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print(f"Error generating subtitles: {str(e)}")
            return Response(
                {'detail': f'Failed to generate subtitles: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Standalone view for exporting subtitles
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_subtitle(request, pk):
    """Export subtitles in the requested format."""
    print(f"*** EXPORT VIEW CALLED with PK={pk} ***")
    print(f"Request path: {request.path}")
    print(f"Request user: {request.user}")

    subtitles = Subtitle.objects.filter(user=request.user)
    print(
        f"Available subtitle IDs for user {request.user.id}: {[s.id for s in subtitles]}")

    try:
        subtitle = Subtitle.objects.filter(id=pk, user=request.user).first()
        if not subtitle:
            print(
                f"Subtitle with ID {pk} not found for user {request.user.id}.")
            return Response(
                {'detail': f'Subtitle with ID {pk} not found for the current user.'},
                status=status.HTTP_404_NOT_FOUND
            )
        print(f"Found subtitle: {subtitle.id}")

        # Get the requested format (default to SRT)
        export_format = request.query_params.get('format', 'srt').lower()
        print(f"Export format: {export_format}")
        if export_format not in ['srt']:
            return Response(
                {'detail': 'Unsupported format. Only "srt" is supported.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert subtitles_json to SRT format
        subtitles_json = subtitle.subtitles_json
        print(f"Subtitle JSON type: {type(subtitles_json)}")

        if not isinstance(subtitles_json, list):
            try:
                subtitles_json = json.loads(subtitles_json)
            except Exception as e:
                print(f"Error parsing subtitles_json: {str(e)}")
                return Response(
                    {'detail': f'Error parsing subtitle data: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        srt_content = ""
        for index, sub in enumerate(subtitles_json, start=1):
            start_time = format_time(sub['start'])
            end_time = format_time(sub['end'])
            text = sub['text'].replace("\n", " ")
            srt_content += f"{index}\n{start_time} --> {end_time}\n{text}\n\n"

        # Return the SRT file as a downloadable response
        response = HttpResponse(srt_content, content_type="text/plain")
        response["Content-Disposition"] = f'attachment; filename="subtitles_{pk}.srt"'
        return response
    except Exception as e:
        print(f"Error exporting subtitles: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'detail': f'Error generating SRT: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def format_time(seconds):
    """Convert seconds to SRT time format (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
