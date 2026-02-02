import { getAuthorizationCookies } from "./authorization-cookies-v2";
import { MelCloudHomeIntegration } from "../../config/integration.zod";
import { ConfigService } from "../../config/config-service";
import { MelCloudAuthCookiesPersistenceService } from "./auth-cookies.persistence.service";
import { startScheduler } from "../../helpers/scheduler";

const ONE_HOUR_MS = 1000 * 60 * 60 * 1;
const createRefreshAuthCookiesFunction =
  (
    melCloudHomeConfig: MelCloudHomeIntegration,
    authCookiesService: MelCloudAuthCookiesPersistenceService,
  ) =>
  async () => {
    const cookie = await getAuthorizationCookies(melCloudHomeConfig);
    await authCookiesService.storeAuthCookies(cookie);
  };

export async function spinCookieRefresher(
  config: ConfigService,
  authCookiesService: MelCloudAuthCookiesPersistenceService,
): Promise<string> {
  const melCloudHomeConfig = config
    .getConfig()
    .integrations.find((t) => t.name === "mel_cloud_home");
  if (!melCloudHomeConfig) {
    throw new Error("MelCloudHome integration config not found");
  }
  const refreshAuthCookiesTask = createRefreshAuthCookiesFunction(
    melCloudHomeConfig,
    authCookiesService,
  );
  const authCookies = await authCookiesService.retrieveAuthCookies();

  // Spin the service once.
  if (!authCookies) {
    await startScheduler(refreshAuthCookiesTask, ONE_HOUR_MS);
  }

  return await authCookiesService.retrieveAuthCookies();
}
