import { OAuth2Client, TokenPayload } from "google-auth-library";
import { GoogleAuthConfig } from "./google-auth";
import { GoogleOAuth2TokenZod } from "./google-auth.types.zod";

export class GoogleAuthService {
  constructor(
    private readonly client: OAuth2Client,
    private readonly googleAuthConfig: GoogleAuthConfig,
  ) {}

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
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

  async refreshToken(refreshToken: string) {
    // Would be nice to actually use the OAuth2Client here instead.
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams();
    params.append("refresh_token", refreshToken);
    params.append("client_id", this.googleAuthConfig.clientId);
    params.append("client_secret", this.googleAuthConfig.clientSecret);
    params.append("grant_type", "refresh_token");
    const response = await fetch(tokenUrl, {
      method: "POST",
      body: params.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Handle errors
    const json = await response.json();
    const parsed = GoogleOAuth2TokenZod.parse(json);

    return parsed;
  }
}
