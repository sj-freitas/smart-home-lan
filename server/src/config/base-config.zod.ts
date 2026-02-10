import { z } from "zod";
import { HomeConfigZod } from "./home.zod";
import { IntegrationsConfigZod as IntegrationConfigZod } from "./integration.zod";

export const BaseConfigZod = z.object({
  integrations: IntegrationConfigZod.readonly(),
  home: HomeConfigZod.readonly(),
});

export type BaseConfig = z.infer<typeof BaseConfigZod>;
