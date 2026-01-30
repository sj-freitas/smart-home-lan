import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { ConfigModule } from "../config/module";
import { IntegrationsModule } from "../integrations/module";
import { ServicesModule } from "../services/module";

@Module({
  imports: [ConfigModule, IntegrationsModule, ServicesModule],
  controllers: [HomeController],
})
export class HomeModule {}
