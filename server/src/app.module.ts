import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/module";
import { ControllersModule } from "./controllers/module";
import { IntegrationsModule } from "./integrations/module";
import { ServicesModule } from "./services/module";
import { SocketsModule } from "./sockets/module";

@Module({
  imports: [
    ConfigModule,
    IntegrationsModule,
    ControllersModule,
    ServicesModule,
    SocketsModule,
  ],
})
export class AppModule {}
