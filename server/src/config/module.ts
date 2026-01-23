import { Module } from "@nestjs/common";
import { ConfigService } from "./config-service";

const ConfigServiceProvider = {
  provide: ConfigService,
  useFactory: async () => ConfigService.create(),
};

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigServiceProvider],
  exports: [ConfigServiceProvider],
})
export class ConfigModule {}
