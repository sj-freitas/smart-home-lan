import { useEffect, useState } from "react";

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
    state: Math.random().toString(36).slice(2), // lightweight client-side state token (optional)
  });
  return `${GOOGLE_AUTH_V2_URL}/auth?${params.toString()}`;
}

export type UseAuthenticationReturnType = [
  AppModes,
  boolean,
  () => Promise<void>,
];

export const useAuthentication: () => UseAuthenticationReturnType = () => {
  const API_BASE = `${import.meta.env.VITE_API_HOSTNAME}/auth`;
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [appMode, setAppMode] = useState<AppModes>("Readonly");
  const [shouldRenderLogoutButton, setShouldRenderLogoutButton] =
    useState<boolean>(false);

  useEffect(() => {
    // On boot check session
    (async () => {
      try {
        // Test request to make sure that the user has access to the resource.
        const res = await fetch(`${API_BASE}/check`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          // User is not logged-in, requires authentication
          setAppMode("LoggedOut");

          const redirectUri = `${API_BASE}/google/callback`;
          const googleUrl = buildGoogleAuthUrl(CLIENT_ID, redirectUri);

          if (typeof window !== "undefined") {
            window.location.replace(googleUrl);
          }
          return;
        }

        if (res.status === 403) {
          // User is successfully logged in but doesn't have permission.
          setShouldRenderLogoutButton(true);
          return setAppMode("Readonly");
        }

        if (res.status !== 200) {
          throw new Error(
            `Unexpected flow, status code is neither 200, 401 nor 403`,
          );
        }

        const response = await res.json();
        setAppMode("FullAccess");

        // The check function will set this value in the case the client is in the same
        // network, meaning that no login was actually performed.
        setShouldRenderLogoutButton(response.shouldRenderLogoutButton);
      } catch (err: any) {
        console.error("Unexpected error happened:", err);
        setAppMode("Error");
      }
    })();
  }, [appMode]);

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/google/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("logout failed", e);
    } finally {
      setAppMode("LoggedOut");
    }
  };

  return [appMode, shouldRenderLogoutButton, logout];
};
