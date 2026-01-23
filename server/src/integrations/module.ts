import { Module } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./mel-cloud-home/integration.service";
import { ConfigModule } from "../config/module";
import { TuyaCloudIntegrationService } from "./tuya/integration.service";
import { MiHomeIntegrationService } from "./mi-home/integration.service";
import { IntegrationsService } from "./integrations-service";
import { MelCloudHomeModule } from "./mel-cloud-home/module";
import { TuyaCloudModule } from "./tuya/module";
import { MiHomeModule } from "./mi-home/module";

const IntegrationsServiceProvider = {
  provide: IntegrationsService,
  inject: [
    MelCloudHomeIntegrationService,
    TuyaCloudIntegrationService,
    MiHomeIntegrationService,
  ],
  useFactory: async (
    melCloudIntegrationService: MelCloudHomeIntegrationService,
    tuyaCloudIntegrationService: TuyaCloudIntegrationService,
    miHomeIntegrationService: MiHomeIntegrationService,
  ) => {
    return new IntegrationsService([
      melCloudIntegrationService,
      tuyaCloudIntegrationService,
      miHomeIntegrationService,
    ]);
  },
};

@Module({
  imports: [ConfigModule, MelCloudHomeModule, TuyaCloudModule, MiHomeModule],
  providers: [IntegrationsServiceProvider],
  exports: [IntegrationsServiceProvider],
})
export class IntegrationsModule {}
