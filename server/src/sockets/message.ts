export interface ServerMessage<T> {
  ts: string;
  type: "snapshot";
  payload: T;
}
