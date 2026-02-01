export type RoomDeviceTypes = "air_conditioner" | "smart_switch" | "smart_light"

export interface HomeState {
  name: string;
  logo: string;
  faviconUrl: string;
  rooms: {
    id: string;
    name: string;
    temperature: number;
    devices: {
      id: string;
      name: string;
      icon: string;
      type: RoomDeviceTypes,
      actions: {
        id: string;
        name: string;
      }[];
      state: string;
    }[];
  }[];
}

export interface ServerMessage<T> {
  seq: number; // monotonic server-side sequence
  ts: string; // ISO timestamp
  type: "snapshot" | "patch" | "heartbeat";
  payload: T;
}