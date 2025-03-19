import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Fade,
  Chip,
  Stack,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import StyleIcon from "@mui/icons-material/Style";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import OpacityIcon from "@mui/icons-material/Opacity";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { subtitleService } from "../../services/api/api";
import { toast } from "react-toastify";

interface SubtitleStylerProps {
  videoId: number;
  subtitleId?: number;
  onStyleChange: (styleData: any) => void;
}

const SubtitleStyler: React.FC<SubtitleStylerProps> = ({
  videoId,
  subtitleId,
  onStyleChange,
}) => {
  const theme = useTheme();
  const [font, setFont] = useState("montserrat");
  const [style, setStyle] = useState("clean");
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#FFFFFF");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const [textAlignment, setTextAlignment] = useState("center");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchSubtitleStyles = useCallback(async () => {
    if (!subtitleId) return;

    setIsLoading(true);

    try {
      const response = await subtitleService.getSubtitle(subtitleId);
      const subtitleData = response.data;

      setFont(subtitleData.font);
      setStyle(subtitleData.style);
      setLanguage(subtitleData.language);
      setFontSize(subtitleData.font_size);
      setFontColor(subtitleData.font_color);
      setBackgroundColor(subtitleData.background_color);
      setBackgroundOpacity(subtitleData.background_opacity);
      setTextAlignment(subtitleData.text_alignment);
    } catch (err: any) {
      console.error("Failed to fetch subtitle styles:", err);
      toast.error("Failed to load subtitle styles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [subtitleId]);

  useEffect(() => {
    if (subtitleId) {
      fetchSubtitleStyles();
    }
  }, [subtitleId, fetchSubtitleStyles]);

  const handleStyleUpdate = async () => {
    setIsLoading(true);
    setSaveSuccess(false);

    const styleData = {
      font,
      style,
      language,
      font_size: fontSize,
      font_color: fontColor,
      background_color: backgroundColor,
      background_opacity: backgroundOpacity,
      text_alignment: textAlignment,
    };

    try {
      if (subtitleId) {
        await subtitleService.updateSubtitleStyle(subtitleId, styleData);
      }

      onStyleChange(styleData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update subtitle styles:", err);
      toast.error("Failed to update subtitle styles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSubtitles = async () => {
    setIsGenerating(true);

    try {
      const response = await subtitleService.generateSubtitles(
        videoId,
        language
      );
      onStyleChange(response.data);
      toast.success("Subtitles generated successfully!");
    } catch (err: any) {
      console.error("Failed to generate subtitles:", err);
      toast.error("Failed to generate subtitles. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderColorBox = (
    color: string,
    onChange: (color: string) => void,
    label: string
  ) => {
    const presetColors = [
      "#FFFFFF",
      "#000000",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];

    return (
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          {label === "Font Color" ? (
            <FormatColorTextIcon sx={{ mr: 1 }} fontSize="small" />
          ) : (
            <FormatColorFillIcon sx={{ mr: 1 }} fontSize="small" />
          )}
          {label}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Tooltip title={color}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                  }}
                />
              }
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: color,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 2,
                  },
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "color";
                  input.value = color;
                  input.addEventListener("input", (e) => {
                    onChange((e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
            </Badge>
          </Tooltip>
          <Typography variant="body2" sx={{ ml: 2, color: "text.secondary" }}>
            {color.toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {presetColors.map((presetColor) => (
            <Tooltip key={presetColor} title={presetColor}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  bgcolor: presetColor,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  ...(presetColor === color && {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 1,
                  }),
                }}
                onClick={() => onChange(presetColor)}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    );
  };

  if (isLoading && !subtitleId) {
    return (
      <Box sx={{ p: 3 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={50} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading subtitle options...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%" }}>
      {!subtitleId ? (
        <Fade in={true} timeout={500}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              <LanguageIcon sx={{ mr: 1 }} /> Generate Subtitles
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Start by generating automatic subtitles for your video:
            </Typography>

            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="language-label">Select Language</InputLabel>
              <Select
                labelId="language-label"
                value={language}
                label="Select Language"
                onChange={(e) => setLanguage(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateSubtitles}
              disabled={isGenerating}
              startIcon={
                isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />
              }
              sx={{
                py: 1.2,
                borderRadius: 1.5,
                fontWeight: 500,
                boxShadow: 2,
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {isGenerating ? "Generating..." : "Generate Subtitles"}
            </Button>

            {isGenerating && (
              <Box sx={{ width: "100%", mt: 3 }}>
                <LinearProgress />
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "center", mt: 1 }}
                >
                  This may take a few minutes depending on video length
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      ) : (
        <Fade in={true} timeout={500}>
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                TabIndicatorProps={{
                  style: {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                <Tab
                  label="Text Style"
                  icon={<TextFormatIcon />}
                  iconPosition="start"
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    py: 2,
                  }}
                />
                <Tab
                  label="Appearance"
                  icon={<StyleIcon />}
                  iconPosition="start"
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    py: 2,
                  }}
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: activeTab === 0 ? "block" : "none" }}>
                <Stack spacing={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="font-label">Font Family</InputLabel>
                    <Select
                      labelId="font-label"
                      value={font}
                      label="Font Family"
                      onChange={(e) => setFont(e.target.value)}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="montserrat">Montserrat</MenuItem>
                      <MenuItem value="roboto">Roboto</MenuItem>
                      <MenuItem value="arial">Arial</MenuItem>
                      <MenuItem value="comicsans">Comic Sans</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="style-label">Subtitle Style</InputLabel>
                    <Select
                      labelId="style-label"
                      value={style}
                      label="Subtitle Style"
                      onChange={(e) => setStyle(e.target.value)}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="bold">
                        Bold with Popping Effects
                      </MenuItem>
                      <MenuItem value="clean">Clean</MenuItem>
                      <MenuItem value="classic">Classic Hormozi</MenuItem>
                      <MenuItem value="comic">Comic</MenuItem>
                      <MenuItem value="banger">Banger Effect</MenuItem>
                      <MenuItem value="karaoke">
                        Karaoke-style Word-by-Word
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FormatSizeIcon sx={{ mr: 1 }} fontSize="small" />
                        Font Size
                      </Box>
                      <Chip
                        label={`${fontSize}px`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Typography>
                    <Slider
                      value={fontSize}
                      min={12}
                      max={36}
                      step={1}
                      onChange={(_, value) => setFontSize(value as number)}
                      valueLabelDisplay="auto"
                      aria-labelledby="font-size-slider"
                      sx={{
                        "& .MuiSlider-thumb": {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <FormatAlignCenterIcon sx={{ mr: 1 }} fontSize="small" />
                      Text Alignment
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Left Alignment">
                        <Button
                          variant={
                            textAlignment === "left" ? "contained" : "outlined"
                          }
                          onClick={() => setTextAlignment("left")}
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                            minWidth: 0,
                            px: 2,
                          }}
                        >
                          <FormatAlignLeftIcon />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Center Alignment">
                        <Button
                          variant={
                            textAlignment === "center"
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => setTextAlignment("center")}
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                            minWidth: 0,
                            px: 2,
                          }}
                        >
                          <FormatAlignCenterIcon />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Right Alignment">
                        <Button
                          variant={
                            textAlignment === "right" ? "contained" : "outlined"
                          }
                          onClick={() => setTextAlignment("right")}
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                            minWidth: 0,
                            px: 2,
                          }}
                        >
                          <FormatAlignRightIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="language-label">
                      Subtitle Language
                    </InputLabel>
                    <Select
                      labelId="language-label"
                      value={language}
                      label="Subtitle Language"
                      onChange={(e) => setLanguage(e.target.value)}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              <Box sx={{ display: activeTab === 1 ? "block" : "none" }}>
                <Stack spacing={3}>
                  {renderColorBox(fontColor, setFontColor, "Font Color")}

                  {renderColorBox(
                    backgroundColor,
                    setBackgroundColor,
                    "Background Color"
                  )}

                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <OpacityIcon sx={{ mr: 1 }} fontSize="small" />
                        Background Opacity
                      </Box>
                      <Chip
                        label={`${Math.round(backgroundOpacity * 100)}%`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Typography>
                    <Slider
                      value={backgroundOpacity}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(_, value) =>
                        setBackgroundOpacity(value as number)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) =>
                        `${Math.round(value * 100)}%`
                      }
                      aria-labelledby="opacity-slider"
                      sx={{
                        "& .MuiSlider-thumb": {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Preview:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: alpha(backgroundColor, backgroundOpacity),
                        display: "flex",
                        justifyContent: textAlignment,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: font,
                          fontSize: `${fontSize}px`,
                          color: fontColor,
                          textAlign: textAlignment,
                        }}
                      >
                        Sample Subtitle Text
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Tooltip title="Apply Styles">
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleStyleUpdate}
                  disabled={isLoading}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} />
                    ) : saveSuccess ? (
                      <CheckCircleIcon />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  color={saveSuccess ? "success" : "primary"}
                  sx={{
                    py: 1.2,
                    borderRadius: 1.5,
                    fontWeight: 500,
                    boxShadow: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {isLoading
                    ? "Applying..."
                    : saveSuccess
                    ? "Changes Saved"
                    : "Apply Styles"}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default SubtitleStyler;
