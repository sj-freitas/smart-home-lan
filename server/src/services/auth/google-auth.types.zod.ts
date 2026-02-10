import { z } from "zod";

export const GoogleOAuth2TokenZod = z
  .object({
    id_token: z.string().readonly().optional(),
    expires_in: z.number().readonly().optional(),
    access_token: z.string().readonly().optional(),
    refresh_token: z.string().readonly().optional(),
    scope: z.string().readonly().optional(),
    token_type: z.string().readonly().optional(),
  })
  .transform((data) => ({
    idToken: data.id_token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
    tokenType: data.token_type,
  }));

export type GoogleOAuth2Token = z.infer<typeof GoogleOAuth2TokenZod>;
