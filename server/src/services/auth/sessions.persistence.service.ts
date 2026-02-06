import { Pool } from "pg";
import { toSequence, toUuid } from "../../helpers/uuid.helper";
import z from "zod";

export const SessionZod = z
  .object({
    id: z.string().readonly(),
    email: z.string().readonly(),
    access_token: z.string().readonly(),
    refresh_token: z.string().optional().readonly(),
    expires_at: z.date().readonly(),
    created_at: z.date().readonly(),
  })
  .transform((data) => ({
    id: data.id,
    email: data.email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
  }));

export type Session = z.infer<typeof SessionZod>;

const SESSIONS_TABLE_NAME = `auth_google_sessions`;

export class SessionsPersistenceService {
  constructor(private readonly pool: Pool) {}

  /**
   * Retrieves the session with the matching session Id for validation.
   */
  public async get(sessionId: string): Promise<Session | null> {
    const uuid = toUuid(sessionId);
    const { rows } = await this.pool.query(`
        SELECT *
        FROM ${SESSIONS_TABLE_NAME}
        WHERE id = '${uuid}'
      `);

    const [matchingSession] = rows;
    if (!matchingSession) {
      return null;
    }

    const parsedSession = SessionZod.parse(matchingSession);

    return parsedSession;
  }

  /**
   * Deletes the session with the matching id.
   */
  public async delete(sessionId: string): Promise<void> {
    const uuid = toUuid(sessionId);

    await this.pool.query(`
        DELETE FROM ${SESSIONS_TABLE_NAME}
        WHERE id = '${uuid}'
      `);
  }

  public async update(
    sessionId: string,
    {
      email,
      accessToken,
      refreshToken,
      expiresAt,
    }: {
      email: string;
      expiresAt: Date;
      accessToken: string;
      refreshToken?: string;
    },
  ): Promise<void> {
    const uuid = toUuid(sessionId);
    await this.pool.query(
      `
    UPDATE ${SESSIONS_TABLE_NAME} (
      SET email = $1,
      SET access_token = $2,
      SET refresh_token = $3,
      SET expires_at = $4
    )
    WHERE id = $5
    `,
      [email, accessToken, refreshToken, expiresAt, uuid],
    );
  }

  /**
   * Creates a new session and returns that session's id.
   */
  public async create({
    email,
    accessToken,
    refreshToken,
    expiresAt,
  }: {
    email: string;
    expiresAt: Date;
    accessToken: string;
    refreshToken?: string;
  }): Promise<string> {
    const { rows } = await this.pool.query(
      `
    INSERT INTO ${SESSIONS_TABLE_NAME} (
      email,
      access_token,
      refresh_token,
      expires_at
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
      [email, accessToken, refreshToken, expiresAt],
    );

    const [newToken] = rows;

    return toSequence(newToken.id);
  }
}
