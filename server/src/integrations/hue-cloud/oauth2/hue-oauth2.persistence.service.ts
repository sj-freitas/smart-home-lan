import { HueOauth2Tokens } from "./hue-oauth2.types";

type HueOauth2TokenStore = {
  tokens: HueOauth2Tokens;
  storedAt: number;
};

// TODO: Replace with real DB or file persistence
const TOKEN_STORE: HueOauth2TokenStore[] = [
  {
    tokens: {
      accessToken: "J80D6kY4tG6fWi8IcpUtP8Y_6bA",
      accessTokenExpiresIn: "604800",
      expiresIn: 604800,
      refreshToken: "OXIVna1Zoug9D5mxAruhV1dHJOk",
      refreshTokenExpiresIn: "63120000",
      tokenType: "bearer",
    },
    storedAt: 1769820974240,
  },
];

export class HueOAuth2PersistenceService {
  public async storeTokens(tokens: HueOauth2Tokens): Promise<void> {
    const tokensToPush = {
      tokens,
      storedAt: Date.now(),
    };
    TOKEN_STORE.push(tokensToPush);

    // This is useful to persist them before the database exists.
    console.log(`Last token stored = ${JSON.stringify(tokensToPush, null, 2)}`);
  }

  public async retrieveTokens(): Promise<HueOauth2TokenStore> {
    const lastToken = TOKEN_STORE[TOKEN_STORE.length - 1];

    if (!lastToken) {
      // This should never happen and worst case scenario they should be hardcoded.
      throw new Error("No tokens stored for Hue OAuth2");
    }

    return lastToken;
  }
}
