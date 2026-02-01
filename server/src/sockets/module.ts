import { Module, Provider } from "@nestjs/common";
import { Server as IOServer } from "socket.io";
import {
  ApplicationStateService,
} from "../integrations/application-state.service";
import { IntegrationsModule } from "../integrations/module";
import { HomeStateGateway } from "./home.state.gateway";

export const INITIAL_HOME_STATE = "INITIAL_HOME_STATE";
export const SOCKET_IO_SERVER = "SOCKET_IO_SERVER";

export const SocketIoProvider: Provider = {
  provide: SOCKET_IO_SERVER,
  useFactory: () => {
    // configure as you need
    const io = new IOServer({
      /* options, e.g. cors: { origin: '*' } */
    });

    // Do not call io.listen() here if you plan to attach to Nest's http server later.
    // But if you want this provider-managed server to listen on its own port:
    // io.listen(3001);

    return io;
  },
};

const InitialHomeStateProvider = {
  provide: INITIAL_HOME_STATE,
  inject: [ApplicationStateService],
  useFactory: async (applicationStateService: ApplicationStateService) => {
    const initialState = await applicationStateService.getHomeState();
    return initialState;
  },
};

@Module({
  imports: [IntegrationsModule],
  providers: [
    SocketIoProvider,
    HomeStateGateway,
    InitialHomeStateProvider,
  ],
  exports: [HomeStateGateway],
})
export class SocketsModule {}
