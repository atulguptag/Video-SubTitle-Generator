import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const VerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const email = localStorage.getItem("pendingVerificationEmail");

  const handleResend = async () => {
    if (!email) {
      toast.error(
        "No pending verification found. Please try registering again."
      );
      navigate("/register");
      return;
    }

    setIsLoading(true);
    try {
      await resendVerificationEmail(email);
      toast.success("Verification email has been resent!");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          my: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 4,
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            {email}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResend}
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Resend Verification Email"
            )}
          </Button>
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ mt: 1 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerificationSent;
