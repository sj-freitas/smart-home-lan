import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/module";
import { IntegrationsModule } from "../integrations/module";
import { ServicesModule } from "../services/module";
import { SocketsModule } from "../sockets/module";
import { HomeController } from "./home.controller";
import { ActionsController } from "./actions.controller";
import { AuthController } from "./auth.controller";
import { SandboxController } from "./sandbox.controller";
import { StaticController } from "./static.controller";
import { AuthConfig } from "./auth.config";
import { AuthGoogleController } from "./auth-google/auth-google.controller";

const AuthConfigProvider = {
  provide: AuthConfig,
  useFactory: () => new AuthConfig(),
};

@Module({
  providers: [AuthConfigProvider],
  imports: [ConfigModule, IntegrationsModule, ServicesModule, SocketsModule],
  controllers: [
    HomeController,
    ActionsController,
    AuthController,
    AuthGoogleController,
    SandboxController,
    StaticController,
  ],
})
export class ControllersModule {}
