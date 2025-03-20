import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Divider,
  useTheme,
  alpha,
  Alert,
  IconButton,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import {
  DeleteForever,
  Security,
  Warning,
  Close as CloseIcon,
  ArrowForwardIos,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/api/api";

const SecuritySection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user, logout, exportUserData } = useAuth();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      localStorage.clear();
      logout();
      toast.success("Your account has been successfully deleted");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user?.username || "user"}_data_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Your data has been successfully exported");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    }
  };

  const confirmDeleteEnabled =
    confirmText.toLowerCase() === "delete my account";

  return (
    <Paper
      elevation={2}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Security
          sx={{
            color: theme.palette.primary.main,
            mr: 1,
            fontSize: 28,
          }}
        />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Security & Privacy
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Collapse in={showWarning}>
        <Alert
          severity="warning"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowWarning(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          Deleting your account is permanent. All your data, including videos
          and subtitles, will be permanently removed.
        </Alert>
      </Collapse>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              transition: "all 0.2s ease",
              height: "100%",
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <Box
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" color="error.main" fontWeight={600}>
                Delete Account
              </Typography>
              <DeleteForever color="error" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </Typography>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Warning />}
              onClick={() => {
                setShowDeleteDialog(true);
                setShowWarning(true);
              }}
              fullWidth={isMobile}
              sx={{
                borderRadius: 1.5,
                fontWeight: 500,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              Delete My Account
            </Button>
          </Paper>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.background.default, 0.5),
                boxShadow: 1,
              },
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Download Your Data
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Download all your personal data, including profile information,
              videos, and generated subtitles.
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIos fontSize="small" />}
              fullWidth={isMobile}
              onClick={handleExportData}
              sx={{
                borderRadius: 1.5,
                fontWeight: 500,
              }}
            >
              Request Data Export
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-account-dialog-title"
        slotProps={{
          paper: {
            elevation: 5,
            sx: {
              borderRadius: 2,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          id="delete-account-dialog-title"
          sx={{
            pb: 1,
            color: "error.main",
            display: "flex",
            alignItems: "center",
          }}
        >
          <DeleteForever sx={{ mr: 1 }} />
          Delete Account Permanently
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action <strong>cannot be undone</strong>. All your data,
            including videos, subtitles, and personal information will be
            permanently deleted.
          </DialogContentText>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Before you continue, please consider downloading your data. Once
              your account is deleted, you will lose access to all your content.
            </Typography>
          </Alert>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            To confirm, please type "delete my account" below:
          </Typography>

          <TextField
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            variant="outlined"
            placeholder="delete my account"
            size="small"
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={!confirmDeleteEnabled || isDeleting}
            sx={{
              borderRadius: 1.5,
              fontWeight: 500,
              px: 2,
            }}
          >
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SecuritySection;
