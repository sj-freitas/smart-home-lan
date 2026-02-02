import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BehaviorSubject } from "rxjs";
import { ServerMessage } from "./message";
import {
  ApplicationState,
  ApplicationStateService,
} from "../integrations/application-state.service";

const POLLING_INTERVAL = 20_000;

@WebSocketGateway({
  namespace: "/api/state",
  path: "/api/socket.io",
  cors: true,
})
export class HomeStateGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>
{
  private server: Server;
  // Effectively state is an in-memory cache as the updates always trigger a change in it.
  // The state gets updated every POLLING_INTERVAL (20s) to sync it. This would not work
  // so well if we had multiple backend instances but that isn't the case.
  private state: BehaviorSubject<ApplicationState>;
  private activeConnections = 0;
  private pollHandle: NodeJS.Timeout | null = null;

  constructor(readonly applicationStateService: ApplicationStateService) {}

  async afterInit(server: Server) {
    this.server = server;
    this.state = new BehaviorSubject(
      await this.applicationStateService.getHomeState(),
    );
    this.state.subscribe((state) => this.broadcastSnapshot(state));
  }

  private makeMessage<T>(
    type: ServerMessage<T>["type"],
    payload: T,
  ): ServerMessage<T> {
    return { ts: new Date().toISOString(), type, payload };
  }

  private broadcastSnapshot(state: ApplicationState | { empty: true }) {
    if ((state as any).empty) {
      console.log(`Initial state - can't broadcast.`);
      return;
    }

    const stateMessage = this.makeMessage("snapshot", state);

    // Send the full state as an update.
    this.server.emit("state:update", stateMessage);
  }

  private startPolling() {
    if (this.pollHandle) {
      return;
    }

    this.pollHandle = setInterval(async () => {
      const newState = await this.applicationStateService.getHomeState();

      this.updateState(newState);
    }, POLLING_INTERVAL);
  }

  private stopPolling() {
    if (!this.pollHandle) {
      return;
    }
    clearInterval(this.pollHandle);
    this.pollHandle = null;
  }

  public handleConnection(client: Socket) {
    console.log("new client connected", client.id);

    this.activeConnections++;
    // Send immediate snapshot on connect if there's a state
    // This might run before init finished (race-condition)
    if (this.state) {
      const msg = this.makeMessage("snapshot", this.state.value);
      client.emit("state:update", msg);
    }

    // Start polling only when first client connects
    // Flushing the state every once in a while (?)
    if (this.activeConnections === 1) {
      this.startPolling();
    }
  }

  public handleDisconnect(client: Socket) {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
    if (this.activeConnections === 0) {
      this.stopPolling();
    }
  }

  public updateState(next: ApplicationState) {
    this.state.next(next);
  }

  @SubscribeMessage("state:resync")
  handleResync(@ConnectedSocket() client: Socket) {
    client.emit("state:update", this.state.value);

    return { ok: true };
  }
}
