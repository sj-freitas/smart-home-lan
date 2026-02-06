import React from "react";
import { Room } from "../types";
import RoomCard from "./RoomCard";

export default function RoomList({
  rooms,
  readonly,
  setStateSuppressSocket,
  onDeviceAction,
  setDeviceState,
}: {
  rooms: Room[];
  readonly: boolean;
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
          readonly={readonly}
          setStateSuppressSocket={setStateSuppressSocket}
          onDeviceAction={onDeviceAction}
          setDeviceState={setDeviceState}
        />
      ))}
    </div>
  );
}
