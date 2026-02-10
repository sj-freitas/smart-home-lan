import { Module } from "@nestjs/common";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { TuyaContext, TuyaContextOptions } from "@tuya/tuya-connector-nodejs";
import { TuyaCloudIntegrationService } from "./integration.service";
import { SocketsModule } from "../../sockets/module";
import { ServicesModule } from "../../services/module";
import { updateStateForDevicesOfIntegration } from "../../helpers/state-updater.helper";
import { startScheduler } from "../../helpers/scheduler";
import { StateService } from "../../services/state/state.service";
import { HomeStateGateway } from "../../sockets/home.state.gateway";

export const TUYA_CLOUD_STATE_POLLING = "HueStatePolling";
const TuyaCloudPollingProvider = {
  provide: TUYA_CLOUD_STATE_POLLING,
  inject: [
    ConfigService,
    TuyaCloudIntegrationService,
    StateService,
    HomeStateGateway,
  ],
  useFactory: async (
    config: ConfigService,
    tuyaCloudIntegrationService: TuyaCloudIntegrationService,
    stateService: StateService,
    homeStateGateway: HomeStateGateway,
  ) => {
    const homeConfig = config.getConfig().home;

    await startScheduler(async () => {
      await updateStateForDevicesOfIntegration(
        homeConfig,
        tuyaCloudIntegrationService,
        stateService,
        homeStateGateway,
      );
    }, 600_000);
  },
};

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
  useFactory: async (tuyaContext: TuyaContext) => {
    return new TuyaCloudIntegrationService(tuyaContext);
  },
};

@Module({
  imports: [ConfigModule, ServicesModule, SocketsModule],
  controllers: [],
  providers: [
    TuyaContextProvider,
    TuyaCloudIntegrationServiceProvider,
    TuyaCloudPollingProvider,
  ],
  exports: [TuyaCloudIntegrationServiceProvider, TuyaCloudPollingProvider],
})
export class TuyaCloudModule {}
