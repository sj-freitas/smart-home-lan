import { useEffect, useRef, useState } from "react";
import { Room, Device } from "../types";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { getIconFromId } from "../icons/icon-mapper";

export default function RoomCard({
  room,
  setStateSuppressSocket,
  onDeviceAction,
  setDeviceState,
  collapsedByDefault = false,
}: {
  room: Room;
  setStateSuppressSocket: (value: boolean) => void,
  onDeviceAction: (
    roomId: string,
    deviceId: string,
    actionId: string,
  ) => Promise<void>;
  setDeviceState: (roomId: string, deviceId: string, actionId: string) => void;
  /** When true, the card will start collapsed. */
  collapsedByDefault?: boolean;
}) {
  const [loadingDevice, setLoadingDevice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(!collapsedByDefault);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  async function runAction(device: Device, actionId: string) {
    // We lock the device to avoid changing the state before it changes, this avoids confusion
    // with the actual device state.
    setLoadingDevice(device.id);
    try {
      // We set the state right away to make it snappier
      setDeviceState(room.id, device.id, actionId);
      // This makes the UI a lot snappier and avoids weird "rollbacks" from state snapshots
      // The request always results in a full state snapshot anyway.
      setStateSuppressSocket(true);
      await onDeviceAction(room.id, device.id, actionId);
      setStateSuppressSocket(false);
    } finally {
      setLoadingDevice(null);
    }
  }

  // Add observer for the .grid class which can detect if the element is in
  // vertical list mode. (one column)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Find the grid container this card lives in
    const grid = el.closest(".grid") as HTMLElement | null;
    const updateIsCollapsible = () => {
      if (!grid) {
        setIsCollapsible(false);
        return;
      }

      const styles = window.getComputedStyle(grid);
      const columns = styles.gridTemplateColumns;
      const columnCount = columns.trim().split(/\s+/).length;

      setIsCollapsible(columnCount === 1);
    };
    updateIsCollapsible();

    if (typeof ResizeObserver !== "undefined" && grid) {
      const ro = new ResizeObserver(updateIsCollapsible);
      ro.observe(grid);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", updateIsCollapsible);
    return () => window.removeEventListener("resize", updateIsCollapsible);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (!isCollapsible) {
      el.style.maxHeight = "none";
      return;
    }

    if (isOpen) {
      const scroll = el.scrollHeight;
      el.style.maxHeight = scroll + "px";
      const t = setTimeout(() => {
        if (el) el.style.maxHeight = "none";
      }, 300);
      return () => clearTimeout(t);
    } else {
      const measured = el.scrollHeight;
      el.style.maxHeight = measured + "px";
      el.offsetHeight;
      el.style.maxHeight = "0px";
    }
  }, [isOpen, room.devices.length]);

  return (
    <div className="card" ref={cardRef}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
        onClick={() => isCollapsible && setIsOpen((s) => !s)}
      >
        <h2 style={{ margin: 0 }}>
          {room.icon && getIconFromId(room.icon, "1.7rem")} {room.name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {typeof room.temperature === "number" && (
            <span
              style={{
                fontSize: 13,
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              {room.temperature}°C
            </span>
          )}

          {isCollapsible && (
            <button
              className="collapse-toggle"
              aria-expanded={isOpen}
              style={{
                background: "transparent",
                border: "none",
                padding: 6,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                color: "var(--muted)",
                borderRadius: 8,
              }}
            >
              {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible content container */}
      <div
        id={`room-${room.id}-content`}
        aria-hidden={!isOpen && isCollapsible}
        ref={contentRef}
        className="collapse-content"
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? undefined : "0px",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="controls" style={{ paddingTop: 12 }}>
          {room.devices.map((device) => (
            <div key={device.id} style={{ marginTop: 8 }}>
              <div
                className="row"
                style={{
                  justifyContent: "space-between",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {getIconFromId(device.icon)}
                  <div style={{ fontWeight: 700 }} className="device-name">
                    {device.name}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {device.actions.map((a) => {
                    const active = device.state === a.id;
                    return (
                      <button
                        key={a.id}
                        className={"btn " + (active ? "" : "btn-ghost")}
                        disabled={loadingDevice === device.id}
                        onClick={() => runAction(device, a.id)}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
