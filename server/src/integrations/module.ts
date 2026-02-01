import { Module } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./mel-cloud-home/integration.service";
import { ConfigModule } from "../config/module";
import { TuyaCloudIntegrationService } from "./tuya/integration.service";
import { IntegrationsService } from "./integrations-service";
import {
  MEL_CLOUD_AUTHENTICATION_COOKIES,
  MelCloudHomeModule,
} from "./mel-cloud-home/module";
import { TuyaCloudModule } from "./tuya/module";
import { HueCloudIntegrationService } from "./hue-cloud/integration.service";
import { HUE_REFRESH_TOKEN, HueCloudModule } from "./hue-cloud/module";
import { ConfigService } from "../config/config-service";
import { ApplicationStateService } from "./application-state.service";

const ApplicationStateServiceProvider = {
  provide: ApplicationStateService,
  inject: [ConfigService, IntegrationsService],
  useFactory: (config: ConfigService, integrations: IntegrationsService) =>
    new ApplicationStateService(config, integrations),
};

const IntegrationsServiceProvider = {
  provide: IntegrationsService,
  inject: [
    MelCloudHomeIntegrationService,
    TuyaCloudIntegrationService,
    HueCloudIntegrationService,
    MEL_CLOUD_AUTHENTICATION_COOKIES,
    HUE_REFRESH_TOKEN,
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
  providers: [IntegrationsServiceProvider, ApplicationStateServiceProvider],
  exports: [
    IntegrationsServiceProvider,
    ApplicationStateServiceProvider,
    MelCloudHomeModule,
    TuyaCloudModule,
    HueCloudModule,
  ],
})
export class IntegrationsModule {}
