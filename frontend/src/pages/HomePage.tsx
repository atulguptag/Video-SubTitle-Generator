import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          backgroundImage: "linear-gradient(45deg, #000080, #E30B5D)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "80%" },
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                fontWeight="bold"
              >
                AI-Powered Subtitle Generator
              </Typography>

              <Typography variant="h5" component="p" sx={{ mb: 4 }}>
                Create beautiful, customized subtitles for your videos in
                minutes with our AI technology.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                {isAuthenticated ? (
                  <Button
                    component={Link}
                    to="/dashboard"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      variant="contained"
                      color="secondary"
                      size="large"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Get Started
                    </Button>

                    <Button
                      component={Link}
                      to="/register"
                      variant="outlined"
                      color="inherit"
                      size="large"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Features
          </Typography>

          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, marginBottom: 6 }}
          >
            Everything you need to create professional subtitles for your videos
          </Typography>

          <Stack direction="row" flexWrap="wrap" sx={{ mx: -2 }}>
            <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 2 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  AI-Powered Transcription
                </Typography>

                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  Our advanced AI automatically transcribes your video content
                  with high accuracy in multiple languages.
                </Typography>

                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Fast processing" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Multiple language support" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="High accuracy" />
                  </ListItem>
                </List>
              </Paper>
            </Box>

            <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 2 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  Customizable Styles
                </Typography>

                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  Choose from various subtitle styles and customize fonts,
                  colors, and effects to match your brand.
                </Typography>

                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Multiple font options" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Visual effects and animations" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Color customization" />
                  </ListItem>
                </List>
              </Paper>
            </Box>

            <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 2 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  Easy Export
                </Typography>

                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  Export your subtitles in various formats for use on different
                  platforms and video editors.
                </Typography>

                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Multiple export formats" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Social media optimization" />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="One-click download" />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* How to Generate Subtitles Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              textAlign: "center",
              fontWeight: 800,
              mb: 3,
              fontSize: {
                xs: "1.4rem",
                sm: "2rem",
                md: "3rem",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <span style={{ color: "black" }}>How to generate</span>
            <span
              style={{
                backgroundImage:
                  "linear-gradient(45deg, var(--deep-blue) 0%, var(--raspberry) 50%, var(--red) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              subtitle for a video?
            </span>
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: { xs: 4, md: 6 },
              color: "#666",
              maxWidth: "600px",
              mx: "auto",
              px: 2,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Generate professional subtitles in just 3 simple steps
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 4 }}
            sx={{
              justifyContent: "center",
              alignItems: { xs: "stretch", md: "stretch" },
            }}
          >
            {/* Step 1 */}
            <Box sx={{ width: { xs: "100%", md: "30%" } }}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: "primary.main",
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    fontWeight: "bold",
                  }}
                >
                  1
                </Typography>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Upload Your Video
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  Upload your video file in any common format (MP4, MOV, AVI).
                  Maximum file size is 500MB.
                </Typography>
              </Paper>
            </Box>

            {/* Step 2 */}
            <Box sx={{ width: { xs: "100%", md: "30%" } }}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: "primary.main",
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    fontWeight: "bold",
                  }}
                >
                  2
                </Typography>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                  }}
                >
                  AI Processing
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  Our AI will automatically transcribe your video and generate
                  perfectly timed subtitles.
                </Typography>
              </Paper>
            </Box>

            {/* Step 3 */}
            <Box sx={{ width: { xs: "100%", md: "30%" } }}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 4,
                  mx: { xs: 2, md: 0 },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: "primary.main",
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    fontWeight: "bold",
                  }}
                >
                  3
                </Typography>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Customize & Export
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  Edit the subtitles if needed, customize their style, and
                  export in your preferred format.
                </Typography>
              </Paper>
            </Box>
          </Stack>

          <Box
            sx={{
              textAlign: "center",
              mt: { xs: 4, md: 6 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Button
              component={Link}
              to={isAuthenticated ? "/dashboard" : "/register"}
              variant="contained"
              size="large"
              sx={{
                px: { xs: 3, md: 4 },
                py: 1.5,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {isAuthenticated ? "Start Generating" : "Try It Now"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Start Creating Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 5, md: 12 },
          bgcolor: "black",
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          {/* Heading Section */}
          <Typography
            variant="h2"
            component="h2"
            sx={{
              pt: { xs: 3, sm: 4, md: 5 },
              px: { sm: 2.5, md: 4 },
              textAlign: "center",
              color: "white",
              fontSize: { xs: "2.5rem", sm: "2rem", md: "5rem" },
              fontWeight: 800,
              mb: { xs: 2, sm: 3 },
            }}
          >
            <span>Start creating videos.</span>
            <Box
              component="span"
              sx={{
                display: "block",
                backgroundImage: "linear-gradient(45deg, #000080, #E30B5D)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: 800,
              }}
            >
              No experience needed.
            </Box>
          </Typography>

          {/* Button Section */}
          <Button
            component={Link}
            to={isAuthenticated ? "/dashboard" : "/register"}
            variant="contained"
            size="large"
            sx={{
              mt: { xs: 6, sm: 7, md: 8 },
              mb: { xs: 4, md: 5 },
              px: 2.5,
              height: { xs: 52, md: 65 },
              borderRadius: 50,
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {isAuthenticated ? "Go to Dashboard" : "Get started - It's free"}
          </Button>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Frequently Asked Questions
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Accordion
              defaultExpanded
              sx={{
                mb: 2,
                borderRadius: "8px !important",
                "&:before": {
                  display: "none",
                },
                "&:first-of-type": {
                  borderTopLeftRadius: "8px !important",
                  borderTopRightRadius: "8px !important",
                },
                "&:last-of-type": {
                  borderBottomLeftRadius: "8px !important",
                  borderBottomRightRadius: "8px !important",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  How accurate is the AI transcription?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Our AI transcription technology achieves over 95% accuracy for
                  clear audio in supported languages. The accuracy may vary
                  depending on audio quality, accents, and background noise.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{
                mb: 2,
                borderRadius: "8px !important",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  What languages are supported?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Currently, we support English and Hindi. We're working on
                  adding more languages in the near future.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{
                mb: 2,
                borderRadius: "8px !important",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  What video formats are supported?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  We support most common video formats including MP4, MOV, AVI,
                  and more. The maximum file size is 500MB.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{
                mb: 2,
                borderRadius: "8px !important",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  How can I customize my subtitles?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  You can customize fonts (Montserrat, Roboto, Arial, Comic
                  Sans), styles (bold with popping effects, clean, classic
                  Hormozi, comic, banger effect, karaoke-style), colors, size,
                  and positioning.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              to={isAuthenticated ? "/dashboard" : "/register"}
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
