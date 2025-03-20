import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Stack,
  useMediaQuery,
  CircularProgress,
  Link,
  Tooltip,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import SecuritySection from "../components/security/SecuritySection";

// Styled components (unchanged)
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
  margin: "0 auto",
  position: "relative",
  cursor: "pointer",
  transition: "all 0.3s ease",
}));

const AvatarOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
  "&:hover": {
    opacity: 1,
  },
  zIndex: 1,
}));

// Create a styled component that extends IconButton
const SocialButtonRoot = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  margin: theme.spacing(0.5),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-2px)",
  },
}));

interface SocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

interface ProfileData {
  name: string;
  bio: string;
  email: string;
  location: string;
  phone: string;
  socialLinks: SocialLinks;
  profileImage?: File | null;
}

const ProfilePage: React.FC = () => {
  const auth = useAuth();
  const { user } = auth;
  const updateProfile = auth.updateProfile as (
    data: any,
    isFormData?: boolean
  ) => Promise<any>;
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [oldImagePath, setOldImagePath] = useState<string | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);

  // Default profile data - would normally fetch from API
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.username || "User",
    bio: "I love creating and editing videos. This platform helps me generate subtitles efficiently.",
    email: user?.email || "user@example.com",
    location: "New Delhi, India",
    phone: "+91 98765 43210",
    socialLinks: {
      facebook: "https://facebook.com/",
      twitter: "https://twitter.com/",
      linkedin: "https://linkedin.com/in/",
      instagram: "https://instagram.com/",
    },
    profileImage: null,
  });

  // Update profile data if user info changes
  useEffect(() => {
    if (user) {
      setProfileData((prevData) => ({
        ...prevData,
        name: user.username,
        email: user.email,
      }));
    }
  }, [user]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update the profileData with the new image
    setProfileData((prevData) => ({
      ...prevData,
      profileImage: file,
    }));

    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      if (user?.profile_picture) {
        setOldImagePath(user.profile_picture);
      }
    } else {
      setImagePreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let data: any = {
        username: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        social_links: profileData.socialLinks,
      };

      if (removeProfilePicture) {
        data.remove_profile_picture = true;

        // If there's an old image path, include it for deletion
        if (oldImagePath) {
          const oldImageFilename = oldImagePath.split("/").pop();
          if (oldImageFilename) {
            data.old_profile_picture = oldImageFilename;
          }
        }
        await updateProfile(data);
      } else if (profileData.profileImage) {
        const formData = new FormData();
        formData.append("profile_picture", profileData.profileImage);

        // If there's an old image path, include it for deletion on the server
        if (oldImagePath) {
          const oldImageFilename = oldImagePath.split("/").pop();
          if (oldImageFilename) {
            formData.append("old_profile_picture", oldImageFilename);
          }
        }
        Object.keys(data).forEach((key) => {
          if (key === "social_links") {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        });
        await updateProfile(formData, true);
      } else {
        await updateProfile(data);
      }

      toast.success("Profile updated successfully!");
      setOldImagePath(null);
      setImagePreview(null);
      setRemoveProfilePicture(false);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    setRemoveProfilePicture(true);
    setImagePreview(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "socialLinks" && child) {
        setProfileData({
          ...profileData,
          socialLinks: {
            ...profileData.socialLinks,
            [child]: value,
          },
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [name]: value,
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          backgroundImage: "linear-gradient(to bottom right, #f5f7fa, #e5e9f0)",
        }}
      >
        <Box sx={{ position: "relative", mb: 4 }}>
          <Box
            sx={{
              height: isMobile ? "120px" : "150px",
              borderRadius: "16px 16px 0 0",
              background: "linear-gradient(45deg, #3f51b5, #f50057)",
              mb: isMobile ? -8 : -10,
            }}
          />

          <Box sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <ProfileAvatar
                sx={{
                  width: isMobile ? 120 : 150,
                  height: isMobile ? 120 : 150,
                }}
                src={
                  removeProfilePicture
                    ? "/static/images/avatar/default-profile.png"
                    : imagePreview ||
                      user?.profile_picture ||
                      "/static/images/avatar/default-profile.png"
                }
                alt={profileData.name}
                onClick={handleAvatarClick}
              />
              {isEditing && (
                <Tooltip title="Upload new profile picture">
                  <AvatarOverlay>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                      }}
                    >
                      <Tooltip title="Upload">
                        <IconButton
                          sx={{
                            bgcolor: "rgba(255,255,255,0.9)",
                            color: "primary.main",
                            "&:hover": { bgcolor: "white" },
                          }}
                          onClick={handleAvatarClick}
                          size={isMobile ? "small" : "medium"}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      </Tooltip>
                      {user?.profile_picture && !removeProfilePicture && (
                        <Tooltip title="Remove">
                          <IconButton
                            sx={{
                              bgcolor: "rgba(255,80,80,0.9)",
                              color: "white",
                              "&:hover": { bgcolor: "rgba(255,50,50,1)" },
                            }}
                            onClick={handleRemoveProfilePicture}
                            size={isMobile ? "small" : "medium"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </AvatarOverlay>
                </Tooltip>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </Box>

            <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
              {profileData.name}
            </Typography>

            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mt: 1, mb: 2, maxWidth: "600px", mx: "auto" }}
            >
              {profileData.bio}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Link
                href={profileData.socialLinks.facebook}
                target="_blank"
                underline="none"
              >
                <SocialButtonRoot
                  aria-label="facebook"
                  size={isMobile ? "small" : "medium"}
                >
                  <FacebookIcon />
                </SocialButtonRoot>
              </Link>
              <Link
                href={profileData.socialLinks.twitter}
                target="_blank"
                underline="none"
              >
                <SocialButtonRoot
                  aria-label="twitter"
                  size={isMobile ? "small" : "medium"}
                >
                  <TwitterIcon />
                </SocialButtonRoot>
              </Link>
              <Link
                href={profileData.socialLinks.linkedin}
                target="_blank"
                underline="none"
              >
                <SocialButtonRoot
                  aria-label="linkedin"
                  size={isMobile ? "small" : "medium"}
                >
                  <LinkedInIcon />
                </SocialButtonRoot>
              </Link>
              <Link
                href={profileData.socialLinks.instagram}
                target="_blank"
                underline="none"
              >
                <SocialButtonRoot
                  aria-label="instagram"
                  size={isMobile ? "small" : "medium"}
                >
                  <InstagramIcon />
                </SocialButtonRoot>
              </Link>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: isMobile ? 2 : 4,
            }}
          >
            {/* Personal Information Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Personal Information
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1,
                }}
              >
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Username"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Username
                    </Typography>
                    <Typography variant="body1">{profileData.name}</Typography>
                  </>
                )}

                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{profileData.email}</Typography>
                  </>
                )}

                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{profileData.phone}</Typography>
                  </>
                )}

                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {profileData.location}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* About Me and Social Media Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About Me
              </Typography>

              {isEditing ? (
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {profileData.bio}
                </Typography>
              )}

              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mt: 4 }}
                gutterBottom
              >
                Social Media
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {/* Facebook */}
                  <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Facebook"
                        name="socialLinks.facebook"
                        value={profileData.socialLinks.facebook}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <FacebookIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "#3b5998" }}
                              />
                            ),
                          },
                        }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FacebookIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "#3b5998" }}
                        />
                        <Typography
                          variant="body2"
                          component="a"
                          href={profileData.socialLinks.facebook}
                          target="_blank"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          Facebook Profile
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Twitter */}
                  <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Twitter"
                        name="socialLinks.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <TwitterIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "#1da1f2" }}
                              />
                            ),
                          },
                        }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TwitterIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "#1da1f2" }}
                        />
                        <Typography
                          variant="body2"
                          component="a"
                          href={profileData.socialLinks.twitter}
                          target="_blank"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          Twitter Profile
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* LinkedIn */}
                  <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="LinkedIn"
                        name="socialLinks.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <LinkedInIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "#0077b5" }}
                              />
                            ),
                          },
                        }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LinkedInIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "#0077b5" }}
                        />
                        <Typography
                          variant="body2"
                          component="a"
                          href={profileData.socialLinks.linkedin}
                          target="_blank"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          LinkedIn Profile
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Instagram */}
                  <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Instagram"
                        name="socialLinks.instagram"
                        value={profileData.socialLinks.instagram}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InstagramIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "#e1306c" }}
                              />
                            ),
                          },
                        }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <InstagramIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "#e1306c" }}
                        />
                        <Typography
                          variant="body2"
                          component="a"
                          href={profileData.socialLinks.instagram}
                          target="_blank"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          Instagram Profile
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEditToggle}
              sx={{
                fontSize: isMobile ? "0.8rem" : "0.9rem",
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack
              direction={isSmallScreen ? "column" : "row"}
              spacing={2}
              sx={{
                width: "100%",
                justifyContent: isSmallScreen ? "center" : "center",
              }}
            >
              <Button
                startIcon={<CancelIcon />}
                variant="outlined"
                color="error"
                onClick={handleEditToggle}
                size={isMobile ? "small" : "medium"}
              >
                Cancel
              </Button>
              <Button
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                variant="contained"
                onClick={handleSave}
                disabled={isLoading}
                size={isMobile ? "small" : "medium"}
              >
                Save
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
      <SecuritySection />
    </Container>
  );
};

export default ProfilePage;
