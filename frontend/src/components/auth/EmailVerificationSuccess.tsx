import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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


const EmailVerificationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleVerification = async () => {
      if (!uid || !token) {
        toast.error("Invalid verification link.");
        navigate("/login");
        return;
      }

      try {
        // To verify the email using uid and token
        await verifyEmail(uid, token);
        toast.success("Email verified successfully! You can now log in.");
        localStorage.removeItem("pendingVerificationEmail");
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Verification failed. Please try again.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [uid, token, verifyEmail, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
          }}
        >
          {isLoading ? (
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Verifying Your Email
              </Typography>
              <CircularProgress />
            </>
          ) : (
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                Your email has been verified. You can now log in to your
                account.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationSuccess;
