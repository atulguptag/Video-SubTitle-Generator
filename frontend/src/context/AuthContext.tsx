import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api/api";
import { toast } from "react-toastify";

interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  phone?: string;
  location?: string;
  bio?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  is_email_verified: boolean;
}

interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<LoginResponse>;
  register: (
    username: string,
    email: string,
    password: string,
    password2: string
  ) => Promise<LoginResponse>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyPasswordReset: (
    email: string,
    verification_code: string,
    new_password: string
  ) => Promise<void>;
  googleLogin: (token: string) => Promise<LoginResponse>;
  facebookLogin: (token: string) => Promise<LoginResponse>;
  updateProfile: (profileData: any) => Promise<User>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (uid: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Authentication check failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const response = await authService.login(emailOrUsername, password);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    password2: string
  ): Promise<LoginResponse> => {
    try {
      const response = await authService.register(
        username,
        email,
        password,
        password2
      );
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logout Successful!");
    setToken(null);
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  };

  const verifyEmail = async (uid: string, token: string) => {
    try {
      const response = await authService.verifyEmail(uid, token);
      return response.data;
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const verifyPasswordReset = async (
    email: string,
    verification_code: string,
    new_password: string
  ) => {
    try {
      await authService.verifyPasswordReset(
        email,
        verification_code,
        new_password
      );
    } catch (error) {
      console.error("Password reset verification failed:", error);
      throw error;
    }
  };

  const googleLogin = async (token: string): Promise<LoginResponse> => {
    try {
      const response = await authService.googleLogin(token);
      const { token: authToken, user } = response.data;

      localStorage.setItem("token", authToken);
      setToken(authToken);
      setUser(user);
      return response.data;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const facebookLogin = async (token: string): Promise<LoginResponse> => {
    try {
      const response = await authService.facebookLogin(token);
      const { token: authToken, user } = response.data;

      localStorage.setItem("token", authToken);
      setToken(authToken);
      setUser(user);
      return response.data;
    } catch (error) {
      console.error("Facebook login failed:", error);
      throw error;
    }
  };

  const updateProfile = async (
    profileData: any,
    isFormData = false
  ): Promise<User> => {
    try {
      let response;

      if (isFormData) {
        response = await authService.updateProfileWithImage(profileData);
      } else {
        response = await authService.updateProfile(profileData);
      }

      const { user } = response.data;
      setUser(user);
      return user;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await authService.resendVerificationEmail(email);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        verifyPasswordReset,
        googleLogin,
        facebookLogin,
        updateProfile,
        resendVerificationEmail,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
