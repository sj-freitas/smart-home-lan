import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { ConfigModule } from "../config/module";
import { IntegrationsModule } from "../integrations/module";

@Module({
  imports: [ConfigModule, IntegrationsModule],
  controllers: [HomeController],
})
export class HomeModule {}
