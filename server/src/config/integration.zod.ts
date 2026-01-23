import { z } from "zod";

const TUYA_CLOUD = "tuya_cloud";
const MI_HOME = "mi_home";
const MEL_CLOUD_HOME = "mel_cloud_home";

export const IntegrationTypeNamesZod = z.union([
  z.literal(TUYA_CLOUD),
  z.literal(MI_HOME),
  z.literal(MEL_CLOUD_HOME),
]);

export const MiHomeIntegrationZod = z.object({
  name: z.literal(MI_HOME),
});

export const MiHomeIntegrationDeviceZod = z.object({
  name: z.literal(MI_HOME),
  deviceTokens: z.array(z.string()),
});

export const TuyaIntegrationZod = z.object({
  name: z.literal(TUYA_CLOUD),
  baseUrl: z.string(),
  accessKey: z.string(),
  secretKey: z.string().readonly(),
});

export const TuyaIntegrationDeviceZod = z.object({
  name: z.literal(TUYA_CLOUD).readonly(),
  deviceId: z.string().readonly(),
});

export const MelCloudCHomeIntegrationZod = z.object({
  name: z.literal(MEL_CLOUD_HOME).readonly(),
  siteUrl: z.string().readonly(),
  apiUrl: z.string().readonly(),
  username: z.string().readonly(),
  password: z.string().readonly(),
});

export const MelCloudHomeIntegrationDeviceZod = z.object({
  name: z.literal(MEL_CLOUD_HOME).readonly(),
  deviceId: z.string().readonly(),
});

export const IntegrationDeviceTypesZod = z.union([
  MelCloudHomeIntegrationDeviceZod,
  TuyaIntegrationDeviceZod,
  MiHomeIntegrationDeviceZod,
]);

export const IntegrationTypesZod = z.union([
  MelCloudCHomeIntegrationZod,
  TuyaIntegrationZod,
  MiHomeIntegrationZod,
]);

export const IntegrationsConfigZod = z.array(IntegrationTypesZod);

export type TuyaIntegration = z.infer<typeof TuyaIntegrationZod>;
export type TuyaIntegrationDevice = z.infer<typeof TuyaIntegrationDeviceZod>;
export type MiHomeIntegration = z.infer<typeof MiHomeIntegrationZod>;
export type MiHomeIntegrationDevice = z.infer<typeof MiHomeIntegrationDeviceZod>;
export type MelCloudHomeIntegration = z.infer<typeof MelCloudCHomeIntegrationZod>;
export type MelCloudHomeIntegrationDevice = z.infer<typeof MelCloudHomeIntegrationDeviceZod>;

export type IntegrationTypeNames = z.infer<typeof IntegrationTypeNamesZod>;
export type IntegrationTypes = z.infer<typeof IntegrationTypesZod>;
export type IntegrationsConfig = z.infer<typeof IntegrationsConfigZod>;
export type IntegrationDeviceTypes = z.infer<typeof IntegrationDeviceTypesZod>;
