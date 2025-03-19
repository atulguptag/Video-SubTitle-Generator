import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const { requestPasswordReset, verifyPasswordReset } = useAuth();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Requesting password reset for:", email);
      await requestPasswordReset(email);

      setActiveStep(1);
      toast.success(
        "Reset code sent to your email. Please check and enter below."
      );
    } catch (err: any) {
      console.error("Password reset error:", err);

      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);

        if (err.response.data && err.response.data.detail) {
          toast.error(err.response.data.detail);
        } else if (err.response.data && typeof err.response.data === "object") {
          const errorMessage = Object.values(err.response.data)
            .flat()
            .join(", ");
          toast.error(errorMessage);
        } else {
          toast.error(
            `Failed to send reset code (Status: ${err.response.status}). Please try again.`
          );
        }
      } else if (err.request) {
        toast.error(
          "No response received from server. Please check your internet connection."
        );
      } else {
        toast.error("Failed to send reset code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "Verifying password reset for:",
        email,
        "code:",
        verificationCode
      );
      await verifyPasswordReset(email, verificationCode, newPassword);

      setActiveStep(2);
      toast.success(
        "Password reset successful. You can now log in with your new password."
      );
    } catch (err: any) {
      console.error("Password reset verification error:", err);

      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);

        if (err.response.data && err.response.data.detail) {
          toast.error(err.response.data.detail);
        } else if (err.response.data && typeof err.response.data === "object") {
          const errorMessage = Object.values(err.response.data)
            .flat()
            .join(", ");
          toast.error(errorMessage);
        } else {
          toast.error(
            `Failed to verify reset code (Status: ${err.response.status}). Please try again.`
          );
        }
      } else if (err.request) {
        toast.error(
          "No response received from server. Please check your internet connection."
        );
      } else {
        toast.error("Failed to verify reset code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Request Reset Code",
    "Verify Code & Reset Password",
    "Complete",
  ];

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
          Reset Password
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" onSubmit={handleRequestReset}>
            <Typography variant="body1" gutterBottom>
              Enter your email address and we'll send you a 6-digit code to
              reset your password.
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send Reset Code"}
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box component="form" onSubmit={handleVerifyReset}>
            <Typography variant="body1" gutterBottom>
              Enter the 6-digit code sent to your email and your new password.
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="6-Digit Code"
              name="verificationCode"
              autoFocus
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Password Reset Complete
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              Your password has been reset successfully. You can now log in with
              your new password.
            </Typography>

            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="primary">
              Back to Login
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
