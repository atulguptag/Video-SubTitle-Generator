import axios from "axios";

// Create an axios instance with default config
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  login: (emailOrUsername: string, password: string) =>
    API.post("/auth/login/", { emailOrUsername, password }),

  register: (
    username: string,
    email: string,
    password: string,
    password2: string
  ) => API.post("/auth/register/", { username, email, password, password2 }),

  logout: () => API.post("/auth/logout/"),

  getCurrentUser: () => API.get("/auth/me/"),

  requestPasswordReset: (email: string) =>
    API.post("/auth/request-password-reset/", { email }),

  verifyPasswordReset: (
    email: string,
    verification_code: string,
    new_password: string
  ) =>
    API.post("/auth/verify-password-reset/", {
      email,
      verification_code,
      new_password,
    }),

  verifyEmail: (uid: string, token: string) =>
    API.get(`/auth/verify-email/${uid}/${token}/`),

  resendVerificationEmail: (email: string) =>
    API.post("/auth/resend-verification-email/", { email }),

  googleLogin: (token: string) => API.post("/auth/google/", { token }),

  facebookLogin: (token: string) => API.post("/auth/facebook/", { token }),

  updateProfile: (profileData: any) => API.patch("/auth/me/", profileData),

  updateProfileWithImage: (formData: FormData) =>
    API.patch("/auth/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Video services
export const videoService = {
  uploadVideo: (formData: FormData) =>
    API.post("/videos/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getVideos: () => API.get("/videos/"),

  getVideo: (id: number) => API.get(`/videos/${id}/`),

  deleteVideo: (id: number) => API.delete(`/videos/${id}/`),
};

// Subtitle services
export const subtitleService = {
  generateSubtitles: (videoId: number, language: string) =>
    API.post(`/subtitles/generate/`, { video_id: videoId, language }),

  getSubtitles: (videoId: number) => API.get(`/subtitles/?video=${videoId}`),

  getSubtitle: (id: number) => API.get(`/subtitles/${id}/`),

  updateSubtitleStyle: (id: number, styleData: any) =>
    API.patch(`/subtitles/${id}/`, styleData),

  exportSubtitles: (id: number, format: string) =>
    API.get(`/subtitles/${id}/download/`, {
      params: { format },
      responseType: "blob",
    }),
};

export default API;
