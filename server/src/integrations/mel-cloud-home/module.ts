import { Module, Scope } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./integration.service";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { MelCloudHomeClient } from "./client";
import { MelCloudAuthCookiesPersistenceService } from "./auth-cookies.persistence.service";
import { spinCookieRefresher } from "./cookie-refresher";
import { MelCLoudHomeController } from "./controllers/mel-cloud-home.controller";
import { updateStateForDevicesOfIntegration } from "../../helpers/state-updater.helper";
import { StateService } from "../../services/state/state.service";
import { HomeStateGateway } from "../../sockets/home.state.gateway";
import { ServicesModule } from "../../services/module";
import { SocketsModule } from "../../sockets/module";
import { startScheduler } from "../../helpers/scheduler";

const MelCloudAuthCookiesPersistenceServiceProvider = {
  provide: MelCloudAuthCookiesPersistenceService,
  scope: Scope.DEFAULT,
  useFactory: () => new MelCloudAuthCookiesPersistenceService(),
};

// Run this once.
export const MEL_CLOUD_AUTHENTICATION_COOKIES =
  "MelCloudHomeAuthenticationCookies";
const MelCloudHomeAuthenticationCookiesProvider = {
  provide: MEL_CLOUD_AUTHENTICATION_COOKIES,
  inject: [ConfigService, MelCloudAuthCookiesPersistenceService],
  useFactory: async (
    config: ConfigService,
    authCookiesService: MelCloudAuthCookiesPersistenceService,
  ) => {
    return await spinCookieRefresher(config, authCookiesService);
  },
};

export const MEL_CLOUD_HOME_STATE_POLLING = "MelCloudHomeStatePolling";
const MelCloudHomePollingProvider = {
  provide: MEL_CLOUD_HOME_STATE_POLLING,
  inject: [
    ConfigService,
    MelCloudHomeIntegrationService,
    StateService,
    HomeStateGateway,
    MEL_CLOUD_AUTHENTICATION_COOKIES,
  ],
  useFactory: async (
    config: ConfigService,
    melCLoudHomeIntegration: MelCloudHomeIntegrationService,
    stateService: StateService,
    homeStateGateway: HomeStateGateway,
  ) => {
    const homeConfig = config.getConfig().home;

    await startScheduler(async () => {
      await updateStateForDevicesOfIntegration(
        homeConfig,
        melCLoudHomeIntegration,
        stateService,
        homeStateGateway,
      );
    }, 120_000);
  },
};

const MelCloudHomeClientProvider = {
  provide: MelCloudHomeClient,
  inject: [MelCloudAuthCookiesPersistenceService, ConfigService],
  useFactory: async (
    melCloudAuthCookiesPersistenceService: MelCloudAuthCookiesPersistenceService,
    config: ConfigService,
  ) => {
    const melCloudHomeConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "mel_cloud_home");
    if (!melCloudHomeConfig) {
      throw new Error("MelCloudHome integration config not found");
    }

    return new MelCloudHomeClient(
      melCloudAuthCookiesPersistenceService,
      melCloudHomeConfig.apiUrl,
    );
  },
};

const MelCloudHomeIntegrationServiceProvider = {
  provide: MelCloudHomeIntegrationService,
  inject: [MelCloudHomeClient],
  useFactory: async (client: MelCloudHomeClient) => {
    return new MelCloudHomeIntegrationService(client);
  },
};

@Module({
  imports: [ConfigModule, ServicesModule, SocketsModule],
  controllers: [MelCLoudHomeController],
  providers: [
    MelCloudAuthCookiesPersistenceServiceProvider,
    MelCloudHomeAuthenticationCookiesProvider,
    MelCloudHomeIntegrationServiceProvider,
    MelCloudHomeClientProvider,
    MelCloudHomePollingProvider,
  ],
  exports: [
    MelCloudHomeIntegrationServiceProvider,
    MelCloudHomeAuthenticationCookiesProvider,
    MelCloudHomeClientProvider,
    MelCloudHomePollingProvider,
  ],
})
export class MelCloudHomeModule {}
