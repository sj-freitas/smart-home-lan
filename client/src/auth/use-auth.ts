import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SCOPE = ["openid", "email", "profile"];
const GOOGLE_AUTH_V2_URL = "https://accounts.google.com/o/oauth2/v2";

type AuthenticationStates =
  | "AuthFullAccess"
  | "AuthRestricted"
  | "LoggingIn"
  | "NeedsLogIn"
  | "LoggedOut";

function buildGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  scope: string[] = DEFAULT_SCOPE,
) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: Math.random().toString(36).slice(2),
  });
  return `${GOOGLE_AUTH_V2_URL}/auth?${params.toString()}`;
}

function deleteCookie(name: string, path = "/") {
  document.cookie = `${name}=; Max-Age=0; path=${path}`;
}

export type UseAuthenticationReturnType = {
  appMode: AuthenticationStates;
  shouldRenderLogoutButton: boolean;
  logout: () => Promise<void>;
  startLogin: () => void;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const API_BASE = `${import.meta.env.VITE_API_HOSTNAME}/auth`;
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [appMode, setAppMode] = useState<AuthenticationStates>("LoggedOut");
  const [shouldRenderLogoutButton, setShouldRenderLogoutButton] =
    useState<boolean>(false);

  const runCheck = async () => {
    try {
      if (appMode !== "LoggedOut") {
        return;
      }

      const res = await fetch(`${API_BASE}/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 200) {
        const body = await res.json();
        setAppMode("AuthFullAccess");
        setShouldRenderLogoutButton(body.shouldRenderLogoutButton);
        return;
      }

      if (res.status === 403) {
        setAppMode("AuthRestricted");
        setShouldRenderLogoutButton(true);
        return;
      }

      if (res.status === 401) {
        setAppMode("NeedsLogIn");
        setShouldRenderLogoutButton(false);
        return;
      }

      // unexpected, still give restricted access
      console.warn(`Unexpected flow, status code is not 403, 401 or 200.`);
      setAppMode("AuthRestricted");
    } catch (err) {
      console.error("Auth check error:", err);
      setAppMode("AuthRestricted");
    }
  };

  // run once on mount
  useEffect(() => {
    runCheck();
  }, [appMode]);

  const startLogin = useCallback(() => {
    setAppMode("LoggingIn");
    const redirectUri = `${API_BASE}/google/callback`;
    const url = buildGoogleAuthUrl(CLIENT_ID, redirectUri);
    window.location.href = url;
  }, [API_BASE, CLIENT_ID]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/google/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Clear Session Cookie
    } catch (e) {
      console.warn("logout failed", e);
    } finally {
      deleteCookie("Session");
      setAppMode("LoggedOut");
    }
  }, [API_BASE]);

  return {
    appMode,
    shouldRenderLogoutButton,
    logout,
    startLogin,
  };
};
