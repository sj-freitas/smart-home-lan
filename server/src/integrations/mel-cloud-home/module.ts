import { Module } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./integration.service";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { MelCloudHomeClient } from "./client";
import { getAuthorizationCookies } from "./authorization-cookies";
import { MelCloudHomeIntegration } from "../../config/integration.zod";

// Token bit here
let token: string | null = null;
const FIVE_HOURS_MS = 1000 * 60 * 60 * 5;

const createRefreshAuthCookiesFunction = (melCloudHomeConfig: MelCloudHomeIntegration) => async () => {
  return await getAuthorizationCookies(melCloudHomeConfig);
};

async function startScheduler<T>(fn: () => Promise<T>, interval: number): Promise<T> {
  // Run immediately
  const firstRun = await fn();
  // Schedule future runs
  setInterval(() => {
    void fn();
  }, interval);

  return firstRun;
}

export const MEL_CLOUD_AUTHENTICATION_COOKIES =
  "MelCloudHomeAuthenticationCookies";
const MelCloudHomeAuthenticationCookiesProvider = {
  provide: MEL_CLOUD_AUTHENTICATION_COOKIES,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const melCloudHomeConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "mel_cloud_home");
    if (!melCloudHomeConfig) {
      throw new Error("MelCloudHome integration config not found");
    }
    const refreshAuthCookiesTask = createRefreshAuthCookiesFunction(melCloudHomeConfig);

    if (!token) {
      const refreshedToken = await startScheduler(refreshAuthCookiesTask, FIVE_HOURS_MS);
      token = refreshedToken;
    }

    return token;
  },
};

const MelCloudHomeIntegrationServiceProvider = {
  provide: MelCloudHomeIntegrationService,
  inject: [MEL_CLOUD_AUTHENTICATION_COOKIES, ConfigService],
  useFactory: async (token: string, config: ConfigService) => {
    const melCloudHomeConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "mel_cloud_home");
    if (!melCloudHomeConfig) {
      throw new Error("MelCloudHome integration config not found");
    }

    return new MelCloudHomeIntegrationService(
      new MelCloudHomeClient(token, melCloudHomeConfig.apiUrl),
    );
  },
};

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    MelCloudHomeAuthenticationCookiesProvider,
    MelCloudHomeIntegrationServiceProvider,
  ],
  exports: [MelCloudHomeIntegrationServiceProvider],
})
export class MelCloudHomeModule {}
