import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/module";
import { ActionsModule } from "./actions/module";
import { HomeModule } from "./home/module";
import { IntegrationsModule } from "./integrations/module";
import { ServicesModule } from "./services/module";

@Module({
  imports: [
    ConfigModule,
    IntegrationsModule,
    ActionsModule,
    HomeModule,
    ServicesModule,
  ],
})
export class AppModule {}
