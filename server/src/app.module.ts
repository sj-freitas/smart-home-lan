import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms/rooms.controller";
import { RoomsService } from "./rooms/rooms.service";
import { ConfigModule } from "./config/module";
import { ActionsModule } from "./actions/module";
import { HomeModule } from "./home/module";
import { IntegrationsModule } from "./integrations/module";

@Module({
  imports: [ConfigModule, IntegrationsModule, ActionsModule, HomeModule],
  controllers: [RoomsController], // Remove, this is a place holder
  providers: [RoomsService], // Remove, this is a place holder
})
export class AppModule {}
