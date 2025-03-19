from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from videos.models import Video
from ..tasks import process_video
from .serializers import VideoSerializer, VideoUpdateSerializer, VideoUploadSerializer


class VideoViewSet(viewsets.ModelViewSet):
    """ViewSet for the Video model."""

    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return videos for the current user only."""
        return Video.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class based on the action."""
        if self.action == 'create':
            return VideoUploadSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return VideoUpdateSerializer
        return VideoSerializer

    def perform_create(self, serializer):
        """Save the video with the current user as owner."""
        video = serializer.save(user=self.request.user, status='uploading')
        try:
            process_video.delay(video.id)
        except Exception as e:
            print(f"Failed to queue process_video task: {str(e)}")
            video.status = 'error'
            video.error_message = 'Failed to start processing'
            video.save()
        return video

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        video = self.get_object()
        if video.status not in ['uploading', 'error']:
            return Response({
                'status': 'error',
                'message': f'Video is already in {video.status} state.'
            }, status=status.HTTP_400_BAD_REQUEST)

        video.status = 'processing'
        video.error_message = None
        video.save()

        try:
            process_video.delay(video.id)
            return Response({
                'status': 'success',
                'message': 'Video processing has been initiated.',
                'video': VideoSerializer(video).data
            })
        except Exception as e:
            video.status = 'error'
            video.error_message = f"Failed to start processing: {str(e)}"
            video.save()
            return Response({
                'status': 'error',
                'message': f"Failed to start processing: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get the current status of a video."""
        video = self.get_object()
        return Response({
            'status': video.status,
            'error_message': video.error_message
        })
