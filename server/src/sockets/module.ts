import { Module, Provider } from "@nestjs/common";
import { Server as IOServer } from "socket.io";
import { HomeStateGateway } from "./home.state.gateway";
import { ServicesModule } from "../services/module";
import { ConfigModule } from "../config/module";

export const INITIAL_HOME_STATE = "INITIAL_HOME_STATE";
export const SOCKET_IO_SERVER = "SOCKET_IO_SERVER";

export const SocketIoProvider: Provider = {
  provide: SOCKET_IO_SERVER,
  useFactory: () => {
    const io = new IOServer({});

    return io;
  },
};

@Module({
  imports: [ServicesModule, ConfigModule],
  providers: [SocketIoProvider, HomeStateGateway],
  exports: [HomeStateGateway],
})
export class SocketsModule {}
