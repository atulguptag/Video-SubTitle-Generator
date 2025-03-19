from rest_framework import serializers
from videos.models import Video


class VideoSerializer(serializers.ModelSerializer):
    """Serializer for the Video model."""

    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'file', 'thumbnail',
            'duration', 'status', 'error_message', 'user',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status',
                            'error_message', 'duration', 'created_at', 'updated_at']


class VideoUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Video details."""

    class Meta:
        model = Video
        fields = ['title', 'description']


class VideoUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading a video."""
    id = serializers.ReadOnlyField()

    class Meta:
        model = Video
        fields = ['id', 'file', 'title', 'description']

    def create(self, validated_data):
        """Custom create method to set the user and status."""
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'uploading'
        return super().create(validated_data)
