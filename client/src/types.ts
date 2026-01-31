export type Action = { id: string; name: string }
export type Device = {
  id: string;
  name: string;
  icon?: string;
  type: 'air_conditioner' | 'smart_switch' | 'smart_light' | string;
  actions: Action[];
  state?: string;
}
export type Room = {
  id: string;
  name: string;
  temperature?: number;
  devices: Device[];
}
export type Home = {
  name: string;
  logo?: string;
  rooms: Room[];
}
