import { HueCloudAuthTokensZod } from "./hue-oauth2.sql.types";
import { HueOauth2Tokens } from "./hue-oauth2.types";
import { Pool } from "pg";

type HueOauth2TokenStore = {
  tokens: HueOauth2Tokens;
  storedAt: number;
};

export class HueOAuth2PersistenceService {
  constructor(private readonly pool: Pool) {}

  public async storeTokens(tokens: HueOauth2Tokens): Promise<void> {
    const { rows } = await this.pool.query(
      `
    INSERT INTO hue_cloud_auth_tokens (
      access_token,
      access_token_expires_in,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
      token_type
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
      [
        tokens.accessToken,
        tokens.accessTokenExpiresIn,
        tokens.expiresIn,
        tokens.refreshToken,
        tokens.refreshTokenExpiresIn,
        tokens.tokenType,
      ],
    );

    const [lastToken] = rows;
    const parsedLastToken = HueCloudAuthTokensZod.parse(lastToken);

    // This is useful to persist them before the database exists.
    console.log(
      `Last token stored = ${JSON.stringify(
        {
          tokens,
          storedAt: parsedLastToken.created_at,
        },
        null,
        2,
      )}`,
    );
  }

  public async retrieveTokens(): Promise<HueOauth2TokenStore> {
    const { rows } = await this.pool.query(`
        SELECT *
        FROM hue_cloud_auth_tokens
        ORDER BY created_at DESC
        LIMIT 1
      `);

    const [lastToken] = rows;
    if (!lastToken) {
      // This should never happen and worst case scenario they should be hardcoded.
      throw new Error("No tokens stored for Hue OAuth2");
    }

    const parsedLastToken = HueCloudAuthTokensZod.parse(lastToken);

    return {
      storedAt: parsedLastToken.created_at.getTime(),
      tokens: {
        accessToken: lastToken.access_token,
        accessTokenExpiresIn: lastToken.access_token_expires_in,
        expiresIn: lastToken.expireS_in,
        refreshToken: lastToken.refresh_token,
        refreshTokenExpiresIn: lastToken.refresh_token_expires_in,
        tokenType: lastToken.token_type,
      },
    };
  }
}
