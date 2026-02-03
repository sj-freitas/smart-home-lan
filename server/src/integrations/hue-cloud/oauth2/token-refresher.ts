import { withRetries } from "../../../helpers/retry";
import { startScheduler } from "../../../helpers/scheduler";
import { HueOAuth2ClientService } from "./hue-oauth2.client.service";
import { HueOAuth2PersistenceService } from "./hue-oauth2.persistence.service";

const SIX_HOUR_MS = 1000 * 60 * 60 * 6;
const createRefreshTokensFunction =
  (
    client: HueOAuth2ClientService,
    hueOAuthTokensStore: HueOAuth2PersistenceService,
  ) =>
  async () => {
    const currentTokens = await hueOAuthTokensStore.retrieveTokens();
    const refreshAccessTokenWithRetries = withRetries(
      client.refreshAccessToken.bind(client),
    );
    const tokens = await refreshAccessTokenWithRetries(currentTokens.tokens);
    await hueOAuthTokensStore.storeTokens(tokens);
  };

export async function spinTokenRefresher(
  hueOAuth2Client: HueOAuth2ClientService,
  hueOAuthTokensStore: HueOAuth2PersistenceService,
) {
  const refreshTokensTask = createRefreshTokensFunction(
    hueOAuth2Client,
    hueOAuthTokensStore,
  );
  const authCookies = await hueOAuthTokensStore.retrieveTokens();

  // Spin the service once.
  if (!authCookies) {
    await startScheduler(refreshTokensTask, SIX_HOUR_MS);
  }

  return (await hueOAuthTokensStore.retrieveTokens()).tokens;
}
