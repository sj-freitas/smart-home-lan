import { z } from "zod";

export const HueCloudAuthTokensZod = z.object({
  id: z.string().readonly(),
  created_at: z.coerce.date().readonly(),
  access_token: z.string().readonly(),
  access_token_expires_in: z.string().readonly(),
  expires_in: z.string().readonly(),
  refresh_token: z.string().readonly(),
  refresh_token_expires_in: z.string().readonly(),
  token_type: z.string().readonly(),
});

export type HueCloudAuthTokens = z.infer<typeof HueCloudAuthTokensZod>;
