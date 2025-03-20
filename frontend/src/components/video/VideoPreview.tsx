import React, { useRef, useState, useEffect } from "react";
import { Box, Paper, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

interface VideoPreviewProps {
  videoUrl: string;
  subtitles?: {
    subtitles_json: any;
    font: string;
    style: string;
    font_size: number;
    font_color: string;
    background_color: string;
    background_opacity: number;
    text_alignment: string;
  };
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, subtitles }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);

  useEffect(() => {
    setIsLoading(true);
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    if (subtitles && subtitles.subtitles_json) {
      try {
        const subtitleData = subtitles.subtitles_json;
        const currentSub = subtitleData.find(
          (sub: any) => currentTime >= sub.start && currentTime <= sub.end
        );

        if (currentSub) {
          const words = currentSub.text.trim().split(/\s+/);
          const segmentDuration = currentSub.end - currentSub.start;
          const wordsPerSecond = words.length / segmentDuration;
          const currentWordIndex = Math.min(
            Math.floor((currentTime - currentSub.start) * wordsPerSecond),
            words.length - 1
          );

          setCurrentSubtitle(words);
          setHighlightedWordIndex(currentWordIndex);
        } else {
          setCurrentSubtitle([]);
          setHighlightedWordIndex(-1);
        }
      } catch (err) {
        console.error("Error processing subtitles:", err);
        toast.error("Error displaying subtitles");
      }
    }
  }, [currentTime, subtitles]);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    toast.error("Failed to load video");
  };

  const getSubtitleStyle = () => {
    if (!subtitles) return {};

    const {
      font,
      style: subtitleStyle,
      font_size,
      font_color,
      background_color,
      background_opacity,
      text_alignment,
    } = subtitles;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      bottom: "10%",
      width: "80%",
      padding: "8px 16px",
      textAlign: text_alignment as "left" | "center" | "right",
      color: font_color,
      backgroundColor: `${background_color}${Math.round(
        background_opacity * 255
      )
        .toString(16)
        .padStart(2, "0")}`,
      fontSize: `${font_size}px`,
      fontFamily: getFontFamily(font),
      borderRadius: "4px",
      transition: "all 0.2s ease",
      maxWidth: "80%",
      margin: "0 auto",
      left: "10%",
      right: "10%",
      zIndex: 10,
    };

    switch (subtitleStyle) {
      case "bold":
        return {
          ...baseStyle,
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          transform: "scale(1.05)",
        };
      case "classic":
        return {
          ...baseStyle,
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase" as const,
        };
      case "comic":
        return {
          ...baseStyle,
          fontFamily: "'Comic Sans MS', cursive",
          border: "2px solid white",
        };
      case "banger":
        return {
          ...baseStyle,
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(255,255,255,0.8)",
          letterSpacing: "1px",
          transform: "scale(1.1)",
        };
      case "karaoke":
        return {
          ...baseStyle,
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            text_alignment === "center"
              ? "center"
              : text_alignment === "right"
              ? "flex-end"
              : "flex-start",
          animation: "karaokeHighlight 0.5s infinite alternate",
        };
      case "clean":
      default:
        return baseStyle;
    }
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case "montserrat":
        return "'Montserrat', sans-serif";
      case "roboto":
        return "'Roboto', sans-serif";
      case "arial":
        return "Arial, sans-serif";
      case "comicsans":
        return "'Comic Sans MS', cursive";
      default:
        return "'Montserrat', sans-serif";
    }
  };

  const fontColor = subtitles?.font_color || "#FFFFFF";

  return (
    <Paper
      elevation={3}
      sx={{ p: 0, overflow: "hidden", position: "relative" }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 20,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}

      <Box sx={{ position: "relative", width: "100%" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          width="100%"
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          style={{ display: "block" }}
        />

        {currentSubtitle.length > 0 && (
          <Box sx={getSubtitleStyle()}>
            {currentSubtitle.map((word, index) => (
              <span
                key={index}
                style={{
                  margin: "0 2px",
                  transition: "color 0.2s ease",
                  color: index === highlightedWordIndex ? "#ff0000" : fontColor,
                  fontWeight:
                    index === highlightedWordIndex ? "bold" : "normal",
                }}
              >
                {word}
              </span>
            ))}
          </Box>
        )}
      </Box>

      <style>
        {`
          @keyframes karaokeHighlight {
            from {
              color: ${fontColor};
            }
            to {
              color: #ff0000;
            }
          }
        `}
      </style>
    </Paper>
  );
};

export default VideoPreview;
