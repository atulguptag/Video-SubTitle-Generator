import json
from django.http import HttpResponse
from subtitles.models import Subtitle
from rest_framework.authentication import TokenAuthentication

# Create your views here.
def export_subtitle(request, pk=None):
    """Export subtitles in the requested format."""
    token_auth = TokenAuthentication()
    try:
        user_auth_tuple = token_auth.authenticate(request)
        if user_auth_tuple:
            user, token = user_auth_tuple
            request.user = user
    except Exception as e:
        print(f"Authentication error: {str(e)}")

    if not request.user.is_authenticated:
        return HttpResponse(
            json.dumps({'detail': 'Authentication required.'}),
            content_type='application/json',
            status=401
        )

    try:
        subtitle = Subtitle.objects.filter(
            id=pk, user=request.user.id).first()
        if not subtitle:
            return HttpResponse(
                json.dumps(
                    {'detail': f'Subtitle with ID {pk} not found for the current user.'}),
                content_type='application/json',
                status=404
            )

        # Get the requested format (default to SRT)
        export_format = request.GET.get('format', 'srt').lower()
        if export_format not in ['srt']:
            return HttpResponse(
                json.dumps(
                    {'detail': 'Unsupported format. Only "srt" is supported.'}),
                content_type='application/json',
                status=400
            )

        # Convert subtitles_json to SRT format
        subtitles_json = subtitle.subtitles_json

        if not isinstance(subtitles_json, list):
            try:
                subtitles_json = json.loads(subtitles_json)
            except Exception as e:
                print(f"Error parsing subtitles_json: {str(e)}")
                return HttpResponse(
                    json.dumps(
                        {'detail': f'Error parsing subtitle data: {str(e)}'}),
                    content_type='application/json',
                    status=500
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
        return HttpResponse(
            json.dumps({'detail': f'Error generating SRT: {str(e)}'}),
            content_type='application/json',
            status=500
        )


def format_time(seconds):
    """Convert seconds to SRT time format (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
