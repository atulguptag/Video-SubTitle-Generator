import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  IconButton,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VideoUpload from "../components/video/VideoUpload";
import { videoService } from "../services/api/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface Video {
  id: number;
  title: string;
  description: string;
  file: string;
  thumbnail: string | null;
  duration: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

const INITIAL_POLLING_INTERVAL = 10000;
const MAX_POLLING_INTERVAL = 20000;
const MAX_RETRIES = 60;
const BACKOFF_FACTOR = 1.5;

const DashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // States for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(
    INITIAL_POLLING_INTERVAL
  );

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchVideos();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const processingVideos = videos.filter(
      (v) => v.status === "uploading" || v.status === "processing"
    );

    if (processingVideos.length > 0 && !isLoading) {
      // Calculate next polling interval with exponential backoff
      const nextInterval = Math.min(
        INITIAL_POLLING_INTERVAL * Math.pow(BACKOFF_FACTOR, retryCount),
        MAX_POLLING_INTERVAL
      );

      const pollTimer = setTimeout(async () => {
        if (retryCount < MAX_RETRIES) {
          await fetchVideos();
          // Check for failed videos and show toast notifications
          const failedVideos = videos.filter((v) => v.status === "error");
          failedVideos.forEach((video) => {
            toast.error(
              `Failed to process video "${video.title}": ${
                video.error_message || "Unknown error"
              }`
            );
          });
          setRetryCount((prev) => prev + 1);
          setPollingInterval(nextInterval);
        } else {
          console.log("Maximum polling attempts reached");
          toast.warning(
            "Video processing is taking longer than expected. Please refresh the page to check the status."
          );
        }
      }, pollingInterval);

      return () => {
        clearTimeout(pollTimer);
      };
    } else {
      // Reset polling state when no videos are processing
      setRetryCount(0);
      setPollingInterval(INITIAL_POLLING_INTERVAL);
    }
  }, [videos, isLoading, retryCount, pollingInterval]);

  const fetchVideos = async () => {
    setIsLoading(true);

    try {
      const response = await videoService.getVideos();
      setVideos(response.data);

      // Check if any videos are still processing
      const stillProcessing = response.data.some(
        (v: Video) => v.status === "uploading" || v.status === "processing"
      );

      if (!stillProcessing) {
        // Reset polling when no videos are processing
        setRetryCount(0);
        setPollingInterval(INITIAL_POLLING_INTERVAL);
      }
    } catch (err: any) {
      console.error("Failed to fetch videos:", err);
      toast.error("Failed to load your videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = async (videoId: number) => {
    try {
      await fetchVideos();
      toast.success("Video uploaded and processing started.");
      setTabValue(1);
    } catch (err: any) {
      console.error("Failed to handle upload success:", err);
      toast.error("Failed to process video. Please try again.");
    }
  };

  const handleEditSubtitles = (videoId: number) => {
    navigate(`/editor/${videoId}`);
  };

  const openDeleteDialog = (videoId: number) => {
    setVideoToDelete(videoId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setVideoToDelete(null);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      await videoService.deleteVideo(videoToDelete);
      fetchVideos();
      toast.success("Video deleted successfully");
      closeDeleteDialog();
    } catch (err: any) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete video. Please try again.");
      closeDeleteDialog();
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChipProps = (status: string) => {
    switch (status) {
      case "ready":
        return {
          label: "READY",
          color: "success" as const,
          icon: <VideoFileIcon fontSize="small" />,
        };
      case "processing":
        return {
          label: "GENERATING SUBTITLES",
          color: "warning" as const,
          icon: <CircularProgress size={14} />,
        };
      case "uploading":
        return {
          label: "UPLOADING",
          color: "info" as const,
          icon: <CircularProgress size={14} />,
        };
      case "error":
        return {
          label: "ERROR",
          color: "error" as const,
          icon: undefined,
        };
      default:
        return {
          label: status.toUpperCase(),
          color: "default" as const,
          icon: undefined,
        };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {user && (
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user.username}!
          </Typography>
        )}
      </Box>

      <Paper
        elevation={3}
        sx={{
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Upload Video" />
          <Tab label="My Videos" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {/* Upload Video Tab */}
        {tabValue === 0 && (
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
        )}

        {/* My Videos Tab */}
        {tabValue === 1 && (
          <>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : videos.length === 0 ? (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  my: 4,
                  height: "100%",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <VideoFileIcon
                  color="primary"
                  sx={{ fontSize: 60, opacity: 0.7, mb: 2 }}
                />
                <Typography variant="h6" component="p" sx={{ mb: 2 }}>
                  You haven't uploaded any videos yet.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setTabValue(0)}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  Upload Your First Video
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {videos.map((video, index) => {
                  const statusProps = getStatusChipProps(video.status);

                  return (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <Fade in={true} timeout={300 + index * 100}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.3s ease",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: theme.shadows[2],
                            "&:hover": {
                              boxShadow: theme.shadows[6],
                              transform: "translateY(-4px)",
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="180"
                            image={video.thumbnail || "/video-placeholder.jpg"}
                            alt={video.title}
                            sx={{
                              objectFit: "cover",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          />

                          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            <Typography
                              variant="h6"
                              noWrap
                              gutterBottom
                              sx={{
                                fontWeight: 600,
                                mb: 1,
                              }}
                            >
                              {video.title}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <AccessTimeIcon
                                  fontSize="small"
                                  sx={{
                                    mr: 0.5,
                                    color: theme.palette.text.secondary,
                                    fontSize: "1rem",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatDuration(video.duration)}
                                </Typography>
                              </Box>

                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <CalendarTodayIcon
                                  fontSize="small"
                                  sx={{
                                    mr: 0.5,
                                    color: theme.palette.text.secondary,
                                    fontSize: "1rem",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatDate(video.created_at)}
                                </Typography>
                              </Box>
                            </Stack>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                minHeight: "2.5em",
                                mb: 2,
                              }}
                            >
                              {video.description || "No description"}
                            </Typography>

                            <Chip
                              label={statusProps.label}
                              color={statusProps.color}
                              size="small"
                              icon={statusProps.icon}
                              sx={{
                                fontWeight: 500,
                                borderRadius: 1,
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />

                            {video.status === "error" &&
                              video.error_message && (
                                <Tooltip title={video.error_message}>
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{
                                      display: "block",
                                      mt: 1,
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {video.error_message}
                                  </Typography>
                                </Tooltip>
                              )}
                          </CardContent>

                          <Box sx={{ flexGrow: 1 }} />

                          <Divider />

                          <CardActions
                            sx={{
                              justifyContent: "space-between",
                              px: 2,
                              py: 1.5,
                            }}
                          >
                            <Tooltip title="Edit Subtitle">
                              <Button
                                size={isMobile ? "small" : "medium"}
                                onClick={() => handleEditSubtitles(video.id)}
                                disabled={video.status !== "ready"}
                                color="primary"
                                variant={
                                  video.status === "ready"
                                    ? "contained"
                                    : "outlined"
                                }
                                startIcon={<EditIcon />}
                                sx={{
                                  borderRadius: 1.5,
                                  fontWeight: 500,
                                  boxShadow: video.status === "ready" ? 1 : 0,
                                  textTransform: "none",
                                }}
                              >
                                {video.status === "ready"
                                  ? "Edit Subtitles"
                                  : video.status === "processing"
                                  ? "Processing..."
                                  : video.status === "error"
                                  ? "Failed"
                                  : "Unavailable"}
                              </Button>
                            </Tooltip>

                            <Tooltip title="Delete Video">
                              <IconButton
                                color="error"
                                onClick={() => openDeleteDialog(video.id)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                  ml: 1,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.error.main,
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        slotProps={{
          paper: {
            elevation: 5,
            sx: {
              borderRadius: 2,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          Delete Video
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this video? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVideo}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 1.5,
              ml: 1,
              px: 2,
              boxShadow: theme.shadows[2],
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;
