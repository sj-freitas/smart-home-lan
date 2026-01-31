import { HueCloudIntegration } from "src/config/integration.zod";
import { HueOauth2Tokens, HueOauth2TokensZod } from "./hue-oauth2.types";

// There's two possible scenarios when bootstrapping the application regardless HUE tokens:
// 1. RefreshToken is fine
// - Every API call we use the RefreshToken to get a new AccessToken
// - Every new AccessToken we store the new AccessToken and RefreshToken
// - Every 5 hours run a refresh token request to make sure it doesn't expire
// 2. RefreshToken has expired (happens every 1 day)
// - In this case we need to get a new RefreshToken using the URL flow (human process)
// - Go to: https://api.meethue.com/oauth2/auth?client_id={{YOUR_CLIENT_ID}}&response_type=code&scope=remote_control&redirect_uri={{YOUR_REDIRECT_URI}}
//    - YOUR_CLIENT_ID is in .env HUE_CLOUD_CLIENT_ID
//    - YOUR_REDIRECT_URI is https://{{domain}}/api/auth/oauth2-hue
//    - Login with your Hue account and select the bridge to give access to.
// - This will trigger the /api/auth/oauth2-hue endpoint with a code parameter
// - Use that code to get new AccessToken and RefreshToken and store them
export class HueOAuth2ClientService {
  constructor(private readonly hueCloudConfig: HueCloudIntegration) {}

  async getAccessToken(code: string): Promise<HueOauth2Tokens> {
    const response = await fetch(`${this.hueCloudConfig.apiUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: this.hueCloudConfig.clientId,
        client_secret: this.hueCloudConfig.clientSecret,
        redirect_uri: this.hueCloudConfig.redirectUri,
      }),
    });

    const jsonResponse = await response.json();

    return HueOauth2TokensZod.parse(jsonResponse);
  }

  async refreshAccessToken(
    currentTokens: HueOauth2Tokens,
  ): Promise<HueOauth2Tokens> {
    const response = await fetch(`${this.hueCloudConfig.apiUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentTokens.refreshToken,
        client_id: this.hueCloudConfig.clientId,
        client_secret: this.hueCloudConfig.clientSecret,
      }),
    });

    const jsonResponse = await response.json();

    return HueOauth2TokensZod.parse(jsonResponse);
  }
}
