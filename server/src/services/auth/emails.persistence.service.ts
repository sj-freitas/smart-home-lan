import { Pool } from "pg";
import { z } from "zod";

export const AuthEmailsZod = z
  .object({
    id: z.string().readonly(),
    created_at: z.date().readonly(),
    starts_at: z.date().readonly(),
    expires_at: z.date().readonly(),
    email_address: z.string().readonly(),
  })
  .transform((data) => ({
    id: data.id,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    emailAddress: data.email_address,
  }));

export type AuthEmails = z.infer<typeof AuthEmailsZod>;

export class EmailsPersistenceService {
  constructor(private readonly pool: Pool) {}

  /**
   * Make sure to call this function ONLY if the email has been authorized by Google.
   * This is another check to know if the user is authorized by the app and if the
   * email is allowed in the specific time intervals (within starts_at and expires_at)
   *
   * @param email The email address to validate
   * @param nowDate Current time, defaults to now.
   * @returns true if email is associated to a not expired user.
   */
  public async validateEmail(
    email: string,
    nowDate = new Date(),
  ): Promise<boolean> {
    const { rows } = await this.pool.query(
      `
        SELECT *
        FROM auth_emails
          WHERE email_address = $1 AND $2 >= starts_at AND $2 <  expires_at
      `,
      [email, nowDate],
    );

    const [matchingEmailAddress] = rows;
    return Boolean(matchingEmailAddress);
  }

  public async addEmail(emailAddress: string, startDate: Date, endDate: Date) {
    const { rows } = await this.pool.query(
      `
        INSERT INTO auth_emails
          (starts_at, expires_at, email_address)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [startDate, endDate, emailAddress],
    );

    const [inserted] = rows;

    return AuthEmailsZod.parse(inserted);
  }
}
