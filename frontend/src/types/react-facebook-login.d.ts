declare module "react-facebook-login/dist/facebook-login-render-props" {
  import { ReactNode } from "react";

  export interface ReactFacebookLoginProps {
    appId: string;
    callback: (response: any) => void;
    render: (renderProps: {
      onClick: () => void;
      isDisabled: boolean;
      isProcessing: boolean;
      isSdkLoaded: boolean;
    }) => ReactNode;
    scope?: string;
    fields?: string;
    returnScopes?: boolean;
    responseType?: string;
    redirectUri?: string;
    disableMobileRedirect?: boolean;
    authType?: string;
    version?: string;
    xfbml?: boolean;
    isMobile?: boolean;
    language?: string;
    onFailure?: (response: any) => void;
    state?: string;
  }

  const FacebookLogin: React.FC<ReactFacebookLoginProps>;

  export default FacebookLogin;
}
