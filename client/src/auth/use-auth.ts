import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SCOPE = ["openid", "email", "profile"];
const GOOGLE_AUTH_V2_URL = "https://accounts.google.com/o/oauth2/v2";
type AppModes = "Readonly" | "FullAccess" | "LoggedOut" | "Error";

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

export type UseAuthenticationReturnType = {
  appMode: AppModes;
  shouldRenderLogoutButton: boolean;
  logout: () => Promise<void>;
  startLogin: () => void;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const API_BASE = `${import.meta.env.VITE_API_HOSTNAME}/auth`;
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [appMode, setAppMode] = useState<AppModes>("Readonly");
  const [shouldRenderLogoutButton, setShouldRenderLogoutButton] =
    useState<boolean>(false);

  const runCheck = async () => {
    try {
      const res = await fetch(`${API_BASE}/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 200) {
        const body = await res.json();
        setAppMode("FullAccess");
        setShouldRenderLogoutButton(body.shouldRenderLogoutButton);
        return;
      }

      if (res.status === 403) {
        setAppMode("Readonly");
        setShouldRenderLogoutButton(true);
        return;
      }

      if (res.status === 401) {
        setAppMode("LoggedOut");
        setShouldRenderLogoutButton(false);
        return;
      }

      // unexpected
      setAppMode("Error");
    } catch (err) {
      console.error("Auth check error:", err);
      setAppMode("Error");
    }
  };

  // run once on mount
  useEffect(() => {
    runCheck();
  }, []);

  const startLogin = useCallback(() => {
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
    } catch (e) {
      console.warn("logout failed", e);
    } finally {
      setAppMode("LoggedOut");
      // startLogin();
    }
  }, [API_BASE]);

  const triggerAuthCheck = useCallback(() => {
    runCheck();
  }, [runCheck]);

  return {
    appMode,
    shouldRenderLogoutButton,
    logout,
    startLogin,
  };
};
