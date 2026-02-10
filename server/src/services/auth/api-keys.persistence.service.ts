import { Pool } from "pg";
import { z } from "zod";

export const AuthApiKeysZod = z
  .object({
    id: z.string().readonly(),
    created_at: z.date().readonly(),
    owner: z.string().readonly(),
    expires_at: z.date().readonly(),
  })
  .transform((data) => ({
    id: data.id,
    createdAt: data.created_at,
    owner: data.owner,
    expiresAt: data.expires_at,
  }));

export type AuthApiKeys = z.infer<typeof AuthApiKeysZod>;

export class ApiKeysPersistenceService {
  constructor(private readonly pool: Pool) {}

  public async validateApiKey(
    apiKeyHash: string,
    currentTime = Date.now(),
  ): Promise<AuthApiKeys | null> {
    const { rows } = await this.pool.query(`
        SELECT *
        FROM auth_api_keys
        WHERE api_key_hash = '${apiKeyHash}'
      `);

    const [matchingApiKey] = rows;
    if (!matchingApiKey) {
      return null;
    }

    const parsedApiKeY = AuthApiKeysZod.parse(matchingApiKey);

    // Check the expiration date
    const expiration = parsedApiKeY.expiresAt.getTime();
    if (expiration <= currentTime) {
      // This key has expired
      console.log(`Key was found for but it has expired.`);
      return null;
    }

    return parsedApiKeY;
  }
}
