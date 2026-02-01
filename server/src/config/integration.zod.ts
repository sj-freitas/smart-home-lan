import { z } from "zod";

const TUYA_CLOUD = "tuya_cloud";
const HUE_CLOUD = "hue_cloud";
const MEL_CLOUD_HOME = "mel_cloud_home";

export const IntegrationTypeNamesZod = z.union([
  z.literal(TUYA_CLOUD),
  z.literal(HUE_CLOUD),
  z.literal(MEL_CLOUD_HOME),
]);

export const HueCloudIntegrationZod = z.object({
  name: z.literal(HUE_CLOUD),
  apiUrl: z.string().readonly(),
  clientId: z.string().readonly(),
  clientSecret: z.string().readonly(),
  redirectUri: z.string().readonly(),
  bridgeUsername: z.string().readonly().optional(),
});

export const HueCloudIntegrationDeviceZod = z.object({
  name: z.literal(HUE_CLOUD),
  id: z.union([z.string(), z.array(z.string())]),
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
  HueCloudIntegrationDeviceZod,
]);

export const IntegrationTypesZod = z.union([
  MelCloudCHomeIntegrationZod,
  TuyaIntegrationZod,
  HueCloudIntegrationZod,
]);

export const IntegrationsConfigZod = z.array(IntegrationTypesZod);

export type TuyaIntegration = z.infer<typeof TuyaIntegrationZod>;
export type TuyaIntegrationDevice = z.infer<typeof TuyaIntegrationDeviceZod>;
export type HueCloudIntegration = z.infer<typeof HueCloudIntegrationZod>;
export type HueCloudIntegrationDevice = z.infer<
  typeof HueCloudIntegrationDeviceZod
>;
export type MelCloudHomeIntegration = z.infer<
  typeof MelCloudCHomeIntegrationZod
>;
export type MelCloudHomeIntegrationDevice = z.infer<
  typeof MelCloudHomeIntegrationDeviceZod
>;

export type IntegrationTypeNames = z.infer<typeof IntegrationTypeNamesZod>;
export type IntegrationTypes = z.infer<typeof IntegrationTypesZod>;
export type IntegrationsConfig = z.infer<typeof IntegrationsConfigZod>;
export type IntegrationDeviceTypes = z.infer<typeof IntegrationDeviceTypesZod>;
