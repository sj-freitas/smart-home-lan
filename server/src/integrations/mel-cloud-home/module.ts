import { Module, Scope } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./integration.service";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { MelCloudHomeClient } from "./client";
import { MelCloudAuthCookiesPersistenceService } from "./auth-cookies.persistence.service";
import { spinCookieRefresher } from "./cookie-refresher";

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

const MelCloudHomeIntegrationServiceProvider = {
  provide: MelCloudHomeIntegrationService,
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

    return new MelCloudHomeIntegrationService(
      new MelCloudHomeClient(
        melCloudAuthCookiesPersistenceService,
        melCloudHomeConfig.apiUrl,
      ),
    );
  },
};

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    MelCloudAuthCookiesPersistenceServiceProvider,
    MelCloudHomeAuthenticationCookiesProvider,
    MelCloudHomeIntegrationServiceProvider,
  ],
  exports: [MelCloudHomeIntegrationServiceProvider],
})
export class MelCloudHomeModule {}
