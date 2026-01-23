export type ACMode = 'cooling' | 'heating'
export type LightMode = 'warm' | 'night' | 'kinky'
export type Switch = { id: string; name: string; on: boolean }
export type Light = { id: string; name: string; mode: LightMode }
export type RoomState = { id: string; name: string; hasAC: boolean; acMode?: ACMode; acOn?: boolean; switches: Switch[]; lights: Light[] }
export type RootState = { rooms: RoomState[] }
