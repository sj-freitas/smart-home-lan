import { useEffect, useState } from "react";
import { Home } from "./types";
import RoomList from "./components/RoomList";

export default function App() {
  const [home, setHome] = useState<Home | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_HOSTNAME;

  useEffect(() => {
    fetch(`${API_BASE}/home`)
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
          <div className="lead">Local network control</div>
        </div>
      </div>

      <RoomList
        rooms={home.rooms}
        onDeviceAction={async (roomId, deviceId, actionId) => {
          try {
            const res = await fetch(
              `${API_BASE}/actions/${roomId}/${deviceId}/${actionId}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
    </div>
  );
}
