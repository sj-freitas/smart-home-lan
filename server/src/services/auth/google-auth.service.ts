import { OAuth2Client, TokenPayload } from "google-auth-library";
import { GoogleAuthConfig } from "./google-auth";
import {
  GoogleOAuth2Token,
  GoogleOAuth2TokenZod,
} from "./google-auth.types.zod";

export class GoogleAuthService {
  constructor(
    private readonly client: OAuth2Client,
    private readonly googleAuthConfig: GoogleAuthConfig,
  ) {}

  async verifyIdToken(idToken: string): Promise<TokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.googleAuthConfig.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return null;
      }
      const tokenPayload = payload as TokenPayload;

      return tokenPayload;
    } catch (err) {
      console.error(err, "Invalid ID token");
      return null;
    }
  }

  async getToken(code: string): Promise<GoogleOAuth2Token | null> {
    const params = new URLSearchParams({
      code,
      client_id: this.googleAuthConfig.clientId,
      client_secret: this.googleAuthConfig.clientSecret,
      redirect_uri: this.googleAuthConfig.redirectUri,
      grant_type: "authorization_code",
    });
    const tokenResponse = await fetch(
      `${this.googleAuthConfig.authUrl}/token`,
      {
        method: "POST",
        body: params.toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    if (tokenResponse.status !== 200) {
      const errorMessage = await tokenResponse.text();
      console.error(errorMessage);
      return null;
    }

    const json = await tokenResponse.json();
    const parsed = GoogleOAuth2TokenZod.parse(json);

    return parsed;
  }

  async refreshToken(refreshToken: string): Promise<GoogleOAuth2Token | null> {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: this.googleAuthConfig.clientId,
      client_secret: this.googleAuthConfig.clientSecret,
      grant_type: "refresh_token",
    });
    const tokenResponse = await fetch(
      `${this.googleAuthConfig.authUrl}/token`,
      {
        method: "POST",
        body: params.toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    if (tokenResponse.status !== 200) {
      const errorMessage = await tokenResponse.text();
      console.error(errorMessage);
      return null;
    }

    const json = await tokenResponse.json();
    const parsed = GoogleOAuth2TokenZod.parse(json);

    return parsed;
  }
}
