import os
from subtitles.models import Subtitle
from rest_framework.response import Response
from rest_framework.decorators import action
from subtitles.utils import generate_subtitles_for_video
from rest_framework import viewsets, status, permissions
from .serializers import SubtitleSerializer, SubtitleStyleSerializer, SubtitleGenerateSerializer


class SubtitleViewSet(viewsets.ModelViewSet):
    """ViewSet for the Subtitle model."""

    queryset = Subtitle.objects.all()
    serializer_class = SubtitleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return subtitles for the current user, filtered by video ID if provided."""
        queryset = Subtitle.objects.filter(user=self.request.user)

        # Extract video ID from query parameters if available
        video_id = self.request.query_params.get('video', None)
        if video_id:
            queryset = queryset.filter(video_id=video_id)

        return queryset

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
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
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
            transcript, subtitles_json, _ = generate_subtitles_for_video(
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
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Failed to generate subtitles: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
