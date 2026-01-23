import { Module } from "@nestjs/common";
import { ActionsController } from "./actions.controller";
import { IntegrationsModule } from "../integrations/module";
import { ConfigModule } from "../config/module";

@Module({
  imports: [IntegrationsModule, ConfigModule],
  controllers: [ActionsController],
})
export class ActionsModule {}
