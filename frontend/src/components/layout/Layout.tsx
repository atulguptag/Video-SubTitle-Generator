import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "text.primary",
                textDecoration: "none",
              }}
            >
              Subtitle Generator
            </Typography>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate("/");
                  }}
                >
                  <Typography textAlign="center">Home</Typography>
                </MenuItem>
                {isAuthenticated ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate("/dashboard");
                      }}
                    >
                      <Typography textAlign="center">Dashboard</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate("/profile");
                      }}
                    >
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate("/login");
                      }}
                    >
                      <Typography textAlign="center">Login</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate("/register");
                      }}
                    >
                      <Typography textAlign="center">Register</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>

            {/* Logo - Mobile */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "text.primary",
                textDecoration: "none",
              }}
            >
              Subtitle Generator
            </Typography>

            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{ my: 2, color: "text.primary", display: "block" }}
              >
                Home
              </Button>
              {isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  sx={{ my: 2, color: "text.primary", display: "block" }}
                >
                  Dashboard
                </Button>
              )}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              {isAuthenticated ? (
                <>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user?.username || "User"}
                      src={user?.profile_picture || ""}
                    />
                  </IconButton>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    keepMounted
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate("/dashboard");
                      }}
                    >
                      <Typography textAlign="center">Dashboard</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate("/profile");
                      }}
                    >
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ color: "text.primary" }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          mt: "auto",
          backgroundColor: (theme) => theme.palette.grey[50],
          borderTop: "1px solid",
          borderColor: "divider",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: { xs: "center", md: "flex-start" },
              gap: 4,
            }}
          >
            {/* Brand Section */}
            <Box
              sx={{
                mb: { xs: 3, md: 0 },
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                }}
              >
                Subtitle Generator
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, maxWidth: "300px" }}
              >
                Transform your videos with AI-powered subtitle generation.
                Create, customize, and share with ease.
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: "center", md: "flex-start" }}
                width="100%"
              >
                <IconButton
                  color="primary"
                  aria-label="github"
                  component="a"
                  href="https://github.com/atulguptag/"
                  target="_blank"
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  aria-label="twitter"
                  component="a"
                  href="https://twitter.com/atulgupta_g/"
                  target="_blank"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  aria-label="linkedin"
                  component="a"
                  href="https://linkedin.com/in/atulguptag/"
                  target="_blank"
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  aria-label="facebook"
                  component="a"
                  href="https://facebook.com/itsatulguptag/"
                  target="_blank"
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  aria-label="instagram"
                  component="a"
                  href="https://instagram.com/itsatulguptag/"
                  target="_blank"
                >
                  <InstagramIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Quick Links */}
            <Box sx={{ textAlign: { xs: "center", md: "center" }, flex: 1 }}>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Quick Links
              </Typography>
              <Stack spacing={1} alignItems={{ xs: "center", md: "center" }}>
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "none",
                    },
                  }}
                >
                  Home
                </Link>
                {isAuthenticated ? (
                  <Link
                    component={RouterLink}
                    to="/dashboard"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      "&:hover": {
                        color: "primary.main",
                        textDecoration: "none",
                      },
                    }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "none",
                        },
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "none",
                        },
                      }}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </Stack>
            </Box>

            {/* Support Section */}
            <Box sx={{ textAlign: { xs: "center", md: "flex-end" } }}>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Support
              </Typography>
              <Stack spacing={1} alignItems={{ xs: "center", md: "center" }}>
                <Link
                  href="#"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "none",
                    },
                  }}
                >
                  Help Center
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "none",
                    },
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "none",
                    },
                  }}
                >
                  Privacy Policy
                </Link>
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              © {new Date().getFullYear()} Subtitle Generator. All rights
              reserved.
            </Typography>
            <Stack direction="row" spacing={3} sx={{ color: "text.secondary" }}>
              <Link
                href="#"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                  justifyContent: { xs: "center", sm: "flex-end" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Terms
              </Link>
              <Link
                href="#"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Privacy
              </Link>
              <Link
                href="#"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Cookies
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
