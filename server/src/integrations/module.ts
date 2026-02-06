import { Module } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./mel-cloud-home/integration.service";
import { ConfigModule } from "../config/module";
import { TuyaCloudIntegrationService } from "./tuya/integration.service";
import {
  IntegrationService,
  IntegrationsService,
} from "./integrations-service";
import {
  MEL_CLOUD_AUTHENTICATION_COOKIES,
  MelCloudHomeModule,
} from "./mel-cloud-home/module";
import { TuyaCloudModule } from "./tuya/module";
import { HueCloudIntegrationService } from "./hue-cloud/integration.service";
import { HUE_REFRESH_TOKEN, HueCloudModule } from "./hue-cloud/module";
import { ConfigService } from "../config/config-service";
import { ApplicationStateService } from "./application-state.service";
import {
  IntegrationTypeNames,
  IntegrationTypeNamesZod,
} from "../config/integration.zod";

const ApplicationStateServiceProvider = {
  provide: ApplicationStateService,
  inject: [ConfigService, IntegrationsService],
  useFactory: (config: ConfigService, integrations: IntegrationsService) =>
    new ApplicationStateService(config, integrations),
};

// const IntegrationsServiceProvider = {
//   provide: IntegrationsService,
//   inject: [
//     MelCloudHomeIntegrationService,
//     TuyaCloudIntegrationService,
//     HueCloudIntegrationService,
//     MEL_CLOUD_AUTHENTICATION_COOKIES,
//     HUE_REFRESH_TOKEN,
//   ],
//   useFactory: async (
//     melCloudIntegrationService: MelCloudHomeIntegrationService,
//     tuyaCloudIntegrationService: TuyaCloudIntegrationService,
//     hueCloudIntegrationService: HueCloudIntegrationService,
//   ) => {
//     return new IntegrationsService([
//       melCloudIntegrationService,
//       tuyaCloudIntegrationService,
//       hueCloudIntegrationService,
//     ]);
//   },
// };

type ModuleHelper = {
  module: any;
  services: any[];
};

const integrationsMap = new Map<IntegrationTypeNames, ModuleHelper>([
  [
    "tuya_cloud",
    {
      module: TuyaCloudModule,
      services: [TuyaCloudIntegrationService],
    },
  ],
  [
    "mel_cloud_home",
    {
      module: MelCloudHomeModule,
      services: [
        MelCloudHomeIntegrationService,
        MEL_CLOUD_AUTHENTICATION_COOKIES,
      ],
    },
  ],
  [
    "hue_cloud",
    {
      module: HueCloudModule,
      services: [HueCloudIntegrationService, HUE_REFRESH_TOKEN],
    },
  ],
]);

function initDynamicIntegrationsProvider() {
  const config = ConfigService.create().getConfig();
  const integrationProviders: ModuleHelper[] = config.integrations.map((t) =>
    integrationsMap.get(t.name),
  );

  return {
    imports: integrationProviders.map((t) => t.module),
    providers: [
      {
        provide: IntegrationsService,
        inject: [...integrationProviders.flatMap((t) => t.services)],
        useFactory: async (...params: any[]) => {
          const integrationServices = params.filter(
            (t) =>
              IntegrationTypeNamesZod.safeParse(
                (t as IntegrationService<unknown>).name,
              ).success,
          );

          return new IntegrationsService(integrationServices);
        },
      },
    ],
  };
}

const metaModule = initDynamicIntegrationsProvider();

@Module({
  imports: [ConfigModule, ...metaModule.imports],
  providers: [ApplicationStateServiceProvider, ...metaModule.providers],
  exports: [
    ...metaModule.providers,
    ...metaModule.imports,
    ApplicationStateServiceProvider,
  ],
})
export class IntegrationsModule {}
