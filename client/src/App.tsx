import { useEffect, useState } from "react";
import { Home } from "./types";
import RoomList from "./components/RoomList";
import { useHomeState } from "./sockets/use-home-state";
import { useAuthentication } from "./auth/use-auth";

function setFavicon(href: string | null) {
  if (!href) return;
  let link: HTMLLinkElement | null =
    document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function App() {
  const [home, setHome] = useState<Home | null>(null);
  const [loading, setLoading] = useState(true);
  const { state, setStateSuppressSocket } = useHomeState();
  const API_BASE = import.meta.env.VITE_API_HOSTNAME;
  const iconUrlFromServer = state?.faviconUrl;
  const { appMode, shouldRenderLogoutButton, logout, startLogin } =
    useAuthentication();

  useEffect(() => {
    if (appMode === "NeedsLogIn") {
      startLogin();
    }
  }, [appMode, startLogin]);

  useEffect(() => {
    if (!iconUrlFromServer) {
      return;
    }
    setFavicon(iconUrlFromServer);
  }, [iconUrlFromServer]);

  useEffect(() => {
    setHome(state);
  }, [state]);

  useEffect(() => {
    fetch(`${API_BASE}/home`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setHome(data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load home state");
      })
      .finally(() => setLoading(false));
  }, []);

  // Update a single device state locally (after successful action)
  function applyDeviceState(
    roomId: string,
    deviceId: string,
    newState: string,
  ) {
    setHome((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id !== roomId) return r;
          return {
            ...r,
            devices: r.devices.map((d) =>
              d.id === deviceId ? { ...d, state: newState } : d,
            ),
          };
        }),
      };
    });
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!home) return <div style={{ padding: 20 }}>No state</div>;

  return (
    <div className="app-shell">
      <div className="header">
        <div className="logo">
          <img src={home.logo}></img>
        </div>
        <div>
          <h1>{home.name}</h1>
          <div className="lead">{home.subTitle}</div>
        </div>
      </div>

      <RoomList
        rooms={home.rooms}
        readonly={appMode !== "AuthFullAccess"}
        setStateSuppressSocket={setStateSuppressSocket}
        setDeviceState={(roomId, deviceId, actionId) => {
          applyDeviceState(roomId, deviceId, actionId);
        }}
        onDeviceAction={async (roomId, deviceId, actionId) => {
          try {
            const res = await fetch(
              `${API_BASE}/actions/${roomId}/${deviceId}/${actionId}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
              },
            );
            const data = await res.json();
            if (res.ok && data.runStatus === "success") {
              applyDeviceState(roomId, deviceId, actionId);
            } else {
              alert("Action failed");
            }
          } catch (err) {
            console.error(err);
            alert("Action error");
          }
        }}
      />

      {shouldRenderLogoutButton && (
        <button type="button" className="logout-link" onClick={logout}>
          Log out
        </button>
      )}
    </div>
  );
}
