declare module "@react-oauth/google" {
  import { ReactNode } from "react";

  export interface GoogleLoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    authuser: string;
    prompt: string;
  }

  export interface GoogleLoginProps {
    onSuccess: (response: GoogleLoginResponse) => void;
    onError: () => void;
    useOneTap?: boolean;
    flow?: "implicit" | "auth-code";
    scope?: string;
    prompt?: string;
    onNonOAuthError?: (error: Error) => void;
  }

  export function useGoogleLogin(props: GoogleLoginProps): () => void;

  export interface GoogleOAuthProviderProps {
    clientId: string;
    children: ReactNode;
  }

  export function GoogleOAuthProvider(
    props: GoogleOAuthProviderProps
  ): JSX.Element;
}
