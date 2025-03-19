import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useGoogleLogin, GoogleLoginResponse } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";

// Facebook response type
interface FacebookLoginResponse {
  accessToken: string;
  data_access_expiration_time: number;
  expiresIn: number;
  graphDomain: string;
  id: string;
  name: string;
  signedRequest: string;
  userID: string;
  email?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const { register, googleLogin, facebookLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.password2
      );

      // Only store email for verification tracking
      localStorage.setItem("pendingVerificationEmail", formData.email);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      navigate("/verification-sent");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response: GoogleLoginResponse) => {
      setIsLoading(true);
      try {
        await googleLogin(response.access_token);
        navigate("/dashboard");
        toast.success("Successfully Logged in via Google!");
      } catch (err: any) {
        console.error("Google login failed:", err);
        toast.error("Google login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed. Please try again.");
    },
  });

  // Facebook Login
  const handleFacebookLogin = async (response: FacebookLoginResponse) => {
    if (response.accessToken) {
      setIsLoading(true);
      try {
        await facebookLogin(response.accessToken);
        navigate("/dashboard");
        toast.success("Successfully Logged in via Facebook!");
      } catch (err: any) {
        console.error("Facebook login failed:", err);
        toast.error("Facebook login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          my: 8,
          height: "100%",
          borderRadius: 4,
          mx: { xs: 2, md: 0 },
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            id="password2"
            value={formData.password2}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Register"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Already have an account? Sign In
              </Typography>
            </Link>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <GoogleIcon sx={{ color: "#4285F4" }} />
              )
            }
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            sx={{
              borderColor: "#4285F4",
              color: "#4285F4",
              "&:hover": {
                borderColor: "#4285F4",
                backgroundColor: "rgba(66, 133, 244, 0.04)",
              },
            }}
          >
            Continue with Google
            {/* {isLoading ? "Connecting..." : "Continue with Google"} */}
          </Button>

          <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_APP_ID || ""}
            callback={handleFacebookLogin}
            render={(renderProps: any) => (
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FacebookIcon sx={{ color: "#1877F2" }} />
                  )
                }
                onClick={renderProps.onClick}
                disabled={isLoading}
                sx={{
                  borderColor: "#1877F2",
                  color: "#1877F2",
                  "&:hover": {
                    borderColor: "#1877F2",
                    backgroundColor: "rgba(24, 119, 242, 0.04)",
                  },
                }}
              >
                Continue with Facebook
                {/* {isLoading ? "Connecting..." : "Continue with Facebook"} */}
              </Button>
            )}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
