interface ServerMessage<T> {
  seq: number; // monotonic server-side sequence
  ts: string; // ISO timestamp
  type: "snapshot" | "patch" | "heartbeat";
  payload: T;
}
