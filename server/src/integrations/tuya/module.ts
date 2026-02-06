import { Module } from "@nestjs/common";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { TuyaContext, TuyaContextOptions } from "@tuya/tuya-connector-nodejs";
import { TuyaCloudIntegrationService } from "./integration.service";

const TuyaContextProvider = {
  provide: TuyaContext,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const tuyaCloudConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "tuya_cloud");
    if (!tuyaCloudConfig) {
      throw new Error("TuyaCloudConfig integration config not found");
    }

    return new TuyaContext(tuyaCloudConfig as TuyaContextOptions);
  },
};

const TuyaCloudIntegrationServiceProvider = {
  provide: TuyaCloudIntegrationService,
  inject: [TuyaContext, ConfigService],
  useFactory: async (tuyaContext: TuyaContext, config: ConfigService) => {
    return new TuyaCloudIntegrationService(tuyaContext, config);
  },
};

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [TuyaContextProvider, TuyaCloudIntegrationServiceProvider],
  exports: [TuyaCloudIntegrationServiceProvider],
})
export class TuyaCloudModule {}
