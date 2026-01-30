import { Module } from "@nestjs/common";
import { ActionsController } from "./actions.controller";
import { IntegrationsModule } from "../integrations/module";
import { ConfigModule } from "../config/module";
import { ServicesModule } from "../services/module";

@Module({
  imports: [IntegrationsModule, ConfigModule, ServicesModule],
  controllers: [ActionsController],
})
export class ActionsModule {}
