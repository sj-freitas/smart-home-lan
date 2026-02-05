import { OAuth2Client, TokenPayload } from "google-auth-library";

export class GoogleAuthService {
  constructor(
    private readonly client: OAuth2Client,
    private readonly clientId: string,
  ) {}

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
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
}
