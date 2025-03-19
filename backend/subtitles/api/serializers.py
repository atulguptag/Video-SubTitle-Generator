from rest_framework import serializers
from subtitles.models import Subtitle
from videos.models import Video
from videos.api.serializers import VideoSerializer


class SubtitleSerializer(serializers.ModelSerializer):
    """Serializer for the Subtitle model."""

    video = VideoSerializer(read_only=True)
    video_id = serializers.PrimaryKeyRelatedField(
        queryset=Video.objects.all(),
        write_only=True,
        source='video'
    )

    class Meta:
        model = Subtitle
        fields = [
            'id', 'video', 'video_id', 'transcript', 'subtitles_json',
            'font', 'style', 'language', 'font_size', 'font_color',
            'background_color', 'background_opacity', 'text_alignment',
            'output_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'transcript',
                            'subtitles_json', 'output_file', 'created_at', 'updated_at']


class SubtitleStyleSerializer(serializers.ModelSerializer):
    """Serializer for updating Subtitle styling."""

    class Meta:
        model = Subtitle
        fields = [
            'font', 'style', 'language', 'font_size', 'font_color',
            'background_color', 'background_opacity', 'text_alignment'
        ]


class SubtitleGenerateSerializer(serializers.Serializer):
    """Serializer for generating subtitles for a video."""

    video_id = serializers.PrimaryKeyRelatedField(
        source='video',
        queryset=Video.objects.all()
    )
    language = serializers.ChoiceField(
        choices=Subtitle.LANGUAGE_CHOICES,
        default='en'
    )

    def validate(self, data):
        """Validate that the video exists and belongs to the current user."""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("Authentication required.")

        video = data['video']
        if video.user != request.user:
            raise serializers.ValidationError(
                "You do not have permission to access this video."
            )

        return data
