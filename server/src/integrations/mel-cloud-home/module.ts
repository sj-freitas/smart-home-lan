import { Module, Scope } from "@nestjs/common";
import { MelCloudHomeIntegrationService } from "./integration.service";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { MelCloudHomeClient } from "./client";
import { getAuthorizationCookies } from "./authorization-cookies";
import { MelCloudHomeIntegration } from "../../config/integration.zod";
import { MelCloudAuthCookiesPersistenceService } from "./auth-cookies.persistence.service";

// let token: string | null = null;
const ONE_HOUR_MS = 1000 * 60 * 60 * 1;

const createRefreshAuthCookiesFunction =
  (melCloudHomeConfig: MelCloudHomeIntegration) => async () => {
    return await getAuthorizationCookies(melCloudHomeConfig);
  };

async function startScheduler<T>(
  fn: () => Promise<T>,
  interval: number,
): Promise<T> {
  // Run immediately
  const firstRun = await fn();
  // Schedule future runs
  setInterval(() => {
    void fn();
  }, interval);

  return firstRun;
}

const MelCloudAuthCookiesPersistenceServiceProvider = {
  provide: MelCloudAuthCookiesPersistenceService,
  scope: Scope.DEFAULT,
  useFactory: () => new MelCloudAuthCookiesPersistenceService(),
};

export const MEL_CLOUD_AUTHENTICATION_COOKIES =
  "MelCloudHomeAuthenticationCookies";
const MelCloudHomeAuthenticationCookiesProvider = {
  provide: MEL_CLOUD_AUTHENTICATION_COOKIES,
  inject: [ConfigService, MelCloudAuthCookiesPersistenceService],
  useFactory: async (
    config: ConfigService,
    authCookiesService: MelCloudAuthCookiesPersistenceService,
  ) => {
    // TODO Change this function a bit, also check if the current token is already expired before obtaining a new one
    // on bootstrap.
    const melCloudHomeConfig = config
      .getConfig()
      .integrations.find((t) => t.name === "mel_cloud_home");
    if (!melCloudHomeConfig) {
      throw new Error("MelCloudHome integration config not found");
    }
    const refreshAuthCookiesTask =
      createRefreshAuthCookiesFunction(melCloudHomeConfig);
    const authCookies = await authCookiesService.retrieveAuthCookies();

    if (!authCookies) {
      const newAuthCookies = await startScheduler(
        refreshAuthCookiesTask,
        ONE_HOUR_MS,
      );
      await authCookiesService.storeAuthCookies(newAuthCookies);
    }

    return await authCookiesService.retrieveAuthCookies();
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
    MelCloudAuthCookiesPersistenceServiceProvider,
    MelCloudHomeAuthenticationCookiesProvider,
    MelCloudHomeIntegrationServiceProvider,
  ],
  exports: [MelCloudHomeIntegrationServiceProvider],
})
export class MelCloudHomeModule {}
