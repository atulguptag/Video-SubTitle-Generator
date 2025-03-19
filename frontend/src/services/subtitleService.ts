import API from "./api/api";

interface GenerateSubtitlesParams {
  video_id: number;
  language: string;
}

interface SubtitleStyle {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  position: string;
}

interface Subtitle {
  id: number;
  video_id: number;
  transcript: string;
  subtitles_json: string;
  language: string;
  style?: SubtitleStyle;
  created_at: string;
  updated_at: string;
}

const generateSubtitles = async (
  params: GenerateSubtitlesParams
): Promise<Subtitle> => {
  const response = await API.post("/subtitles/generate/", {
    video: params.video_id,
    language: params.language,
  });
  return response.data;
};

const getSubtitles = async (videoId: number): Promise<Subtitle[]> => {
  const response = await API.get(`/subtitles/?video=${videoId}`);
  return response.data;
};

const updateSubtitleStyle = async (
  subtitleId: number,
  style: SubtitleStyle
): Promise<Subtitle> => {
  const response = await API.patch(
    `/subtitles/${subtitleId}/update_style/`,
    style
  );
  return response.data;
};

const deleteSubtitle = async (subtitleId: number): Promise<void> => {
  await API.delete(`/subtitles/${subtitleId}/`);
};

const downloadSubtitle = async (
  subtitleId: number,
  format: "srt" | "vtt"
): Promise<Blob> => {
  const response = await API.get(
    `/subtitles/${subtitleId}/download/?format=${format}`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

export const subtitleServices = {
  generateSubtitles,
  getSubtitles,
  updateSubtitleStyle,
  deleteSubtitle,
  downloadSubtitle,
};

export type { GenerateSubtitlesParams, Subtitle, SubtitleStyle };
