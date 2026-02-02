import { Module, Scope } from "@nestjs/common";
import { ConfigModule } from "../../config/module";
import { HueCloudIntegrationService } from "./integration.service";
import { ConfigService } from "../../config/config-service";
import { HueOAuth2ClientService } from "./oauth2/hue-oauth2.client.service";
import { HueOAuth2PersistenceService } from "./oauth2/hue-oauth2.persistence.service";
import { HueCloudIntegration } from "../../config/integration.zod";
import { HueClient } from "./hue.client";
import { ServicesModule } from "../../services/module";
import { Pool } from "pg";
import { spinTokenRefresher } from "./oauth2/token-refresher";

const HUE_CONFIG = "HUE_CONFIG";

// Run this once.
export const HUE_REFRESH_TOKEN = "HueRefreshToken";
const HueRefreshTokenProvider = {
  provide: HUE_REFRESH_TOKEN,
  inject: [HueOAuth2ClientService, HueOAuth2PersistenceService],
  useFactory: async (
    hueOAuth2Client: HueOAuth2ClientService,
    authCookiesService: HueOAuth2PersistenceService,
  ) => {
    return await spinTokenRefresher(hueOAuth2Client, authCookiesService);
  },
};

const HueConfigProvider = {
  provide: HUE_CONFIG,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const hueCloudConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "hue_cloud");
    if (!hueCloudConfig) {
      throw new Error("HueCloud integration config not found");
    }

    return hueCloudConfig;
  },
};

const HueCloudIntegrationServiceProvider = {
  provide: HueCloudIntegrationService,
  inject: [HueClient],
  useFactory: async (hueClient: HueClient) => {
    return new HueCloudIntegrationService(hueClient);
  },
};

const HueOAuth2ClientServiceProvider = {
  provide: HueOAuth2ClientService,
  inject: [HUE_CONFIG],
  useFactory: async (hueCloudConfig: HueCloudIntegration) => {
    return new HueOAuth2ClientService(hueCloudConfig);
  },
};

const HueOAuth2PersistenceServiceProvider = {
  provide: HueOAuth2PersistenceService,
  inject: [Pool],
  useFactory: async (pool: Pool) => new HueOAuth2PersistenceService(pool),
};

const HueClientProvider = {
  provide: HueClient,
  inject: [HUE_CONFIG, HueOAuth2ClientService, HueOAuth2PersistenceService],
  useFactory: async (
    hueCloudConfig: HueCloudIntegration,
    hueOauth2ClientService: HueOAuth2ClientService,
    hueOauth2PersistenceService: HueOAuth2PersistenceService,
  ) => {
    return new HueClient(
      hueCloudConfig,
      hueOauth2ClientService,
      hueOauth2PersistenceService,
    );
  },
};

@Module({
  imports: [ConfigModule, ServicesModule],
  providers: [
    HueConfigProvider,
    HueRefreshTokenProvider,
    HueCloudIntegrationServiceProvider,
    HueOAuth2ClientServiceProvider,
    HueOAuth2PersistenceServiceProvider,
    HueClientProvider,
  ],
  exports: [
    HueConfigProvider,
    HueRefreshTokenProvider,
    HueCloudIntegrationServiceProvider,
    HueOAuth2ClientServiceProvider,
    HueOAuth2PersistenceServiceProvider,
    HueClientProvider,
  ],
})
export class HueCloudModule {}
