import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { ConfigModule } from "../config/module";
import { IntegrationsModule } from "../integrations/module";
import { ServicesModule } from "../services/module";
import { ActionsController } from "./actions.controller";
import { AuthController } from "./auth.controller";
import { SandboxController } from "./sandbox.controller";
import { StaticController } from "./static.controller";

@Module({
  imports: [ConfigModule, IntegrationsModule, ServicesModule],
  controllers: [
    HomeController,
    ActionsController,
    AuthController,
    SandboxController,
    StaticController,
  ],
})
export class ControllersModule {}
