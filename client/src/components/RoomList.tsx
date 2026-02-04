import React from "react";
import { Room } from "../types";
import RoomCard from "./RoomCard";

export default function RoomList({
  rooms,
  setStateSuppressSocket,
  onDeviceAction,
  setDeviceState,
}: {
  rooms: Room[];
  setStateSuppressSocket: (value: boolean) => void,
  onDeviceAction: (
    roomId: string,
    deviceId: string,
    actionId: string,
  ) => Promise<void>;
  setDeviceState: (roomId: string, deviceId: string, actionId: string) => void;
}) {
  return (
    <div className="grid">
      {rooms.map((r) => (
        <RoomCard
          key={r.id}
          room={r}
          setStateSuppressSocket={setStateSuppressSocket}
          onDeviceAction={onDeviceAction}
          setDeviceState={setDeviceState}
        />
      ))}
    </div>
  );
}
