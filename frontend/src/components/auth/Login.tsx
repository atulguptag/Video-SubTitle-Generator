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

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, googleLogin, facebookLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(emailOrUsername, password);
      toast.success("Login Successful!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response: GoogleLoginResponse) => {
      setIsGoogleLoading(true);
      try {
        await googleLogin(response.access_token);
        toast.success("Login Successful!");
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Google login failed:", err);
        toast.error("Google login failed. Please try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed. Please try again.");
    },
  });

  // Facebook Login
  const handleFacebookLogin = async (response: FacebookLoginResponse) => {
    if (response.accessToken) {
      setIsFacebookLoading(true);
      try {
        await facebookLogin(response.accessToken);
        toast.success("Login Successful!");
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Facebook login failed:", err);
        toast.error("Facebook login failed. Please try again.");
      } finally {
        setIsFacebookLoading(false);
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
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="emailOrUsername"
            label="Email or Username"
            name="emailOrUsername"
            autoComplete="email username"
            autoFocus
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Forgot password?
              </Typography>
            </Link>

            <Link to="/register" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Don't have an account? Sign Up
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
              isGoogleLoading ? (
                <CircularProgress size={20} />
              ) : (
                <GoogleIcon sx={{ color: "#4285F4" }} />
              )
            }
            onClick={() => handleGoogleLogin()}
            disabled={isGoogleLoading || isFacebookLoading}
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
            {/* {isGoogleLoading ? "Connecting..." : "Login with Google"} */}
          </Button>

          <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_APP_ID || ""}
            callback={handleFacebookLogin}
            render={(renderProps: any) => (
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  isFacebookLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FacebookIcon sx={{ color: "#1877F2" }} />
                  )
                }
                onClick={renderProps.onClick}
                disabled={isGoogleLoading || isFacebookLoading}
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
                {/* {isFacebookLoading ? "Connecting..." : "Login with Facebook"} */}
              </Button>
            )}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
