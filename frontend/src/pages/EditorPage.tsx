import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Fade,
  Chip,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import VideoPreview from "../components/video/VideoPreview";
import SubtitleStyler from "../components/subtitle/SubtitleStyler";
import { videoService, subtitleService } from "../services/api/api";
// import { subtitleServices } from "../services/subtitleService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import HomeIcon from "@mui/icons-material/Home";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";

interface Video {
  id: number;
  title: string;
  file: string;
  status: string;
}

interface Subtitle {
  id: number;
  video: number;
  font: string;
  style: string;
  language: string;
  font_size: number;
  font_color: string;
  background_color: string;
  background_opacity: number;
  text_alignment: string;
  subtitles_json: any;
}

const EditorPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [subtitle, setSubtitle] = useState<Subtitle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const theme = useTheme();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (videoId) {
      fetchVideoData(parseInt(videoId));
    }
  }, [videoId, isAuthenticated, navigate]);

  useEffect(() => {
    if (video && !subtitle && !isLoading && video.status === "ready") {
      const interval = setInterval(async () => {
        try {
          const subtitlesResponse = await subtitleService.getSubtitles(
            video.id
          );
          if (subtitlesResponse.data.length > 0) {
            setSubtitle(subtitlesResponse.data[0]);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Failed to check for subtitles:", err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [video, subtitle, isLoading]);

  const fetchVideoData = async (id: number) => {
    setIsLoading(true);

    try {
      const videoResponse = await videoService.getVideo(id);
      setVideo(videoResponse.data);

      const subtitlesResponse = await subtitleService.getSubtitles(id);
      if (subtitlesResponse.data.length > 0) {
        setSubtitle(subtitlesResponse.data[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch video data:", err);
      toast.error("Failed to load video data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = (styleData: any) => {
    if (styleData.id) {
      setSubtitle(styleData);
    } else if (subtitle) {
      setSubtitle({
        ...subtitle,
        ...styleData,
      });
    }
  };

  const handleExportSubtitles = async () => {
    if (!subtitle) return;

    setExportLoading(true);

    try {
      const response = await subtitleService.exportSubtitles(
        subtitle.id,
        "srt"
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `subtitles_${videoId}.srt`);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Subtitles exported successfully!");
    } catch (err: any) {
      console.error("Failed to export subtitles:", err);
      toast.error("Failed to export subtitles. Please try again later.");
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
              Loading editor...
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (!video) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in={true} timeout={500}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.light, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Alert
              severity="warning"
              variant="outlined"
              sx={{
                mb: 3,
                alignItems: "center",
              }}
            >
              <Typography variant="h6" component="div">
                Video not found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The video you're looking for doesn't exist or you don't have
                permission to access it.
              </Typography>
            </Alert>

            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Back to Dashboard
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  if (video && video.status !== "ready") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-ol": {
              alignItems: "center",
            },
          }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/dashboard"
            underline="hover"
            color="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            <VideoLibraryIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </MuiLink>
          <Typography
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextFormatIcon sx={{ mr: 0.5 }} fontSize="small" />
            Subtitle Editor
          </Typography>
        </Breadcrumbs>

        <Fade in={true} timeout={500}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.light, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
              <Alert
                severity="info"
                icon={<InfoIcon fontSize="large" />}
                variant="outlined"
                sx={{
                  mb: 4,
                  alignItems: "center",
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {video.status === "processing"
                    ? "Generating Subtitles..."
                    : "Video Processing..."}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {video.status === "processing"
                    ? "Your video is ready, but we are still generating subtitles. This might take a few minutes depending on the video length."
                    : "Your video is still being processed. Please wait a moment before editing subtitles."}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    my: 4,
                    flexDirection: "column",
                  }}
                >
                  <CircularProgress size={60} thickness={4} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    This page will automatically update when ready
                  </Typography>
                </Box>
              </Alert>

              <Button
                component={Link}
                to="/dashboard"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in={true} timeout={400}>
        <Box>
          <Breadcrumbs
            sx={{
              mb: 3,
              "& .MuiBreadcrumbs-ol": {
                alignItems: "center",
              },
            }}
          >
            <MuiLink
              component={Link}
              to="/"
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Home
            </MuiLink>
            <MuiLink
              component={Link}
              to="/dashboard"
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <VideoLibraryIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </MuiLink>
            <Typography
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <TextFormatIcon sx={{ mr: 0.5 }} fontSize="small" />
              Subtitle Editor
            </Typography>
          </Breadcrumbs>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight={600}
              >
                {video.title}
              </Typography>
              <Chip
                label="Ready for editing"
                color="success"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Typography variant="subtitle1" color="text.secondary">
              Edit and customize subtitles for your video
            </Typography>
          </Paper>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: { xs: "100%", lg: "58%" },
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <VideoPreview
                  videoUrl={video.file}
                  subtitles={subtitle || undefined}
                />
              </Box>
            </Paper>

            <Paper
              elevation={3}
              sx={{
                width: { xs: "100%", lg: "42%" },
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              <SubtitleStyler
                videoId={parseInt(videoId!)}
                subtitleId={subtitle?.id}
                onStyleChange={handleStyleChange}
              />
            </Paper>
          </Box>

          <Paper
            elevation={2}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Tooltip title="Back to Dashboard">
              <Button
                component={Link}
                to="/dashboard"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Back to Dashboard
              </Button>
            </Tooltip>

            {subtitle && (
              <Tooltip title="Export Subtitles">
                <Button
                  variant="contained"
                  onClick={handleExportSubtitles}
                  disabled={exportLoading}
                  startIcon={
                    exportLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    boxShadow: 2,
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Export Subtitles (.srt)
                </Button>
              </Tooltip>
            )}
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default EditorPage;
