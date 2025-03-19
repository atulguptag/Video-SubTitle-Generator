import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { videoService } from "../../services/api/api";
import { toast } from "react-toastify";

interface VideoUploadProps {
  onUploadSuccess: (videoId: number) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check if file is a video
      if (!file.type.startsWith("video/")) {
        toast.warning("Please select a valid video file.");
        return;
      }

      setSelectedFile(file);

      // Auto-fill title from filename if empty
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a video file to upload.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your video.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);

    try {
      const response = await videoService.uploadVideo(formData);
      const videoId = response.data.id;
      onUploadSuccess(videoId);
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(
        err.response?.data?.detail ||
          "Failed to upload video. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file.");
        return;
      }

      setSelectedFile(file);

      // Auto-fill title from filename if empty
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        my: 4,
        height: "100%",
        borderRadius: 4,
        mx: { xs: 2, md: 0 },
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Upload Video
      </Typography>

      <Box component="form" onSubmit={handleUpload}>
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            ref={fileInputRef}
          />

          {selectedFile ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                Selected file: {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Change
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                Drag and drop your video here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: MP4, MOV, AVI, etc.
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Video Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
        />

        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description (Optional)"
          name="description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
        />

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? <CircularProgress size={24} /> : "Upload Video"}
        </Button>
      </Box>
    </Paper>
  );
};

export default VideoUpload;
