import { Module } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./mel-cloud-home/integration.service";
import { ConfigModule } from "../config/module";
import { TuyaCloudIntegrationService } from "./tuya/integration.service";
import { IntegrationsService } from "./integrations-service";
import { MelCloudHomeModule } from "./mel-cloud-home/module";
import { TuyaCloudModule } from "./tuya/module";
import { HueCloudIntegrationService } from "./hue-cloud/integration.service";
import { HueCloudModule } from "./hue-cloud/module";

const IntegrationsServiceProvider = {
  provide: IntegrationsService,
  inject: [
    MelCloudHomeIntegrationService,
    TuyaCloudIntegrationService,
    HueCloudIntegrationService,
  ],
  useFactory: async (
    melCloudIntegrationService: MelCloudHomeIntegrationService,
    tuyaCloudIntegrationService: TuyaCloudIntegrationService,
    hueCloudIntegrationService: HueCloudIntegrationService,
  ) => {
    return new IntegrationsService([
      melCloudIntegrationService,
      tuyaCloudIntegrationService,
      hueCloudIntegrationService,
    ]);
  },
};

@Module({
  imports: [ConfigModule, MelCloudHomeModule, TuyaCloudModule, HueCloudModule],
  providers: [IntegrationsServiceProvider],
  exports: [
    IntegrationsServiceProvider,
    MelCloudHomeModule,
    TuyaCloudModule,
    HueCloudModule,
  ],
})
export class IntegrationsModule {}
