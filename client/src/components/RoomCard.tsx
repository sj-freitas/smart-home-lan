import React from "react";
import { RoomState, ACMode, LightMode } from "../types";
import {
  FiThermometer,
  FiPower,
  FiTv,
  FiMusic,
  LampIcon,
  FiSun,
  FiMoon,
  FiHome,
} from "react-icons/fi";

const LampIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12 2C9.23858 2 7 4.23858 7 7C7 8.65685 7.56918 10.1021 8.5 11.25V13.5C8.5 14.8807 9.61929 16 11 16H13C14.3807 16 15.5 14.8807 15.5 13.5V11.25C16.4308 10.1021 17 8.65685 17 7C17 4.23858 14.7614 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 20H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 16V18C10 18.5523 10.4477 19 11 19H13C13.5523 19 14 18.5523 14 18V16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function RoomCard({
  room,
  onPatch,
}: {
  room: RoomState;
  onPatch: (id: string, patch: any) => void;
}) {
  const toggleSwitch = (switchId: string) => {
    const next = room.switches.map((s) =>
      s.id === switchId ? { ...s, on: !s.on } : s,
    );
    onPatch(room.id, { switches: next });
  };

  const setACMode = (mode: ACMode) => onPatch(room.id, { acMode: mode });
  const setLightMode = (lightId: string, mode: LightMode) => {
    const next = room.lights.map((l) =>
      l.id === lightId ? { ...l, mode } : l,
    );
    onPatch(room.id, { lights: next });
  };

  const iconFor = (rid: string) => {
    if (rid.includes("living")) return <FiHome />;
    if (rid.includes("main")) return <FiSun />;
    if (rid.includes("guest")) return <FiMoon />;
    return <FiHome />;
  };

  return (
    <div className="card">
      <h2>
        {iconFor(room.id)} {room.name}
      </h2>

      <div className="controls">
        {room.hasAC && (
          <div>
            <div className="small">Air Conditioner</div>
            <div className="row" style={{ marginTop: 8 }}>
              <button
                className="btn"
                onClick={() => setACMode("cooling")}
                disabled={room.acMode === "cooling"}
              >
                <FiThermometer /> Cooling
              </button>
              <button
                className="btn"
                onClick={() => setACMode("heating")}
                disabled={room.acMode === "heating"}
              >
                <FiThermometer /> Heating
              </button>

              <button
                className="btn"
                onClick={() => onPatch(room.id, { acOn: !room.acOn })}
                style={{
                  marginLeft: 8,
                  background: room.acOn
                    ? "linear-gradient(90deg,var(--accent),#60a5fa)"
                    : "transparent",
                  color: room.acOn ? "#062023" : "var(--muted)",
                }}
              >
                {room.acOn ? "Turn AC off" : "Turn AC on"}
              </button>
              <div className="mode-pill">Mode: {room.acMode}</div>
            </div>
          </div>
        )}

        {room.switches.length > 0 && (
          <div>
            <div className="small">Switches</div>
            <ul className="switch-list" style={{ marginTop: 8 }}>
              {room.switches.map((s) => (
                <li key={s.id} className="switch-item">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {s.id === "tv" && <FiTv />}
                    {s.id === "piano" && <FiMusic />}
                    {s.id === "tall-lamp" && <LampIcon size={18} />}
                    {s.id === "bedside-lamp" && <LampIcon size={18} />}
                    <div>{s.name}</div>
                  </div>
                  <div>
                    <button className="btn" onClick={() => toggleSwitch(s.id)}>
                      {s.on ? (
                        <>
                          <FiPower /> Turn off
                        </>
                      ) : (
                        <>
                          <FiPower /> Turn on
                        </>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {room.lights.length > 0 && (
          <div>
            <div className="small">Lights</div>
            <div className="light-options" style={{ marginTop: 8 }}>
              {room.lights.map((l) => (
                <div
                  key={l.id}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <LampIcon size={18} />
                    <div style={{ fontWeight: 700 }}>{l.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setLightMode(l.id, "warm")}
                      disabled={l.mode === "warm"}
                    >
                      Warm
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setLightMode(l.id, "night")}
                      disabled={l.mode === "night"}
                    >
                      Night
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setLightMode(l.id, "kinky")}
                      disabled={l.mode === "kinky"}
                    >
                      Kinky
                    </button>
                    <div className="mode-pill" style={{ marginLeft: 10 }}>
                      Mode: {l.mode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
