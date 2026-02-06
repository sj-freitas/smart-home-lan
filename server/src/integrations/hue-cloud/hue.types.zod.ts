import { z } from "zod";

/* --- Sub-schemas --- */
export const LightStateZod = z.object({
  on: z.boolean().readonly(),
  bri: z.number().int().readonly().optional(),
  hue: z.number().int().readonly().optional(),
  sat: z.number().int().readonly().optional(),
  effect: z.string().readonly().optional(),
  xy: z.tuple([z.number(), z.number()]).readonly().optional(),
  ct: z.number().int().readonly().optional(),
  alert: z.string().readonly().optional(),
  colormode: z
    .union([z.literal("xy"), z.literal("ct"), z.literal("hs")])
    .readonly()
    .optional(),
  mode: z.string().readonly().optional(),
  reachable: z.boolean().readonly().optional(),
});

export const SwUpdateZod = z.object({
  state: z.string().readonly(),
  lastinstall: z.string().readonly(), // ISO timestamp
});

export const ControlCtZod = z.object({
  min: z.number().int().readonly(),
  max: z.number().int().readonly(),
});

export const ControlZod = z.object({
  mindimlevel: z.number().int().readonly(),
  maxlumen: z.number().int().readonly(),
  colorgamuttype: z.string().readonly(),
  colorgamut: z.array(z.tuple([z.number(), z.number()])).readonly(),
  ct: ControlCtZod.readonly(),
});

export const StreamingZod = z.object({
  renderer: z.boolean().readonly(),
  proxy: z.boolean().readonly(),
});

export const CapabilitiesZod = z.object({
  certified: z.boolean().readonly(),
  control: ControlZod.readonly(),
  streaming: StreamingZod.readonly(),
});

export const StartupZod = z.object({
  mode: z.string().readonly(),
  configured: z.boolean().readonly(),
});

export const ConfigStartupWrapperZod = z.object({
  mode: z.string().readonly(),
  configured: z.boolean().readonly(),
});

export const ConfigZod = z.object({
  archetype: z.string().readonly(),
  function: z.string().readonly(),
  direction: z.string().readonly(),
  startup: StartupZod.readonly(),
});

export const LightObjectZod = z.object({
  state: LightStateZod.readonly(),
  swupdate: SwUpdateZod.readonly(),
  type: z.string().readonly(),
  name: z.string().readonly(),
  modelid: z.string().readonly(),
  manufacturername: z.string().readonly(),
  productname: z.string().readonly(),
  capabilities: CapabilitiesZod.readonly(),
  config: ConfigZod.readonly(),
  uniqueid: z.string().readonly(),
  swversion: z.string().readonly(),
  swconfigid: z.string().readonly(),
  productid: z.string().readonly(),
});

export const SmartPlugStateZod = z.object({
  on: z.boolean().readonly(),
  alert: z.string().readonly(),
  mode: z.string().readonly(),
  reachable: z.boolean().readonly(),
});

export const SmartPlugSwUpdateZod = z.object({
  state: z.string().readonly(),
  lastinstall: z.string().readonly(),
});

export const SmartPlugCapabilitiesControlZod = z.object({});

export const SmartPlugCapabilitiesStreamingZod = z.object({
  renderer: z.boolean().readonly(),
  proxy: z.boolean().readonly(),
});

export const SmartPlugCapabilitiesZod = z.object({
  certified: z.boolean().readonly(),
  control: SmartPlugCapabilitiesControlZod.readonly(),
  streaming: SmartPlugCapabilitiesStreamingZod.readonly(),
});

export const SmartPlugConfigStartupZod = z.object({
  mode: z.string().readonly(),
  configured: z.boolean().readonly(),
});

export const SmartPlugConfigZod = z.object({
  archetype: z.string().readonly(),
  function: z.string().readonly(),
  direction: z.string().readonly(),
  startup: SmartPlugConfigStartupZod.readonly(),
});

export const SmartPlugObjectZod = z.object({
  state: SmartPlugStateZod.readonly(),
  swupdate: SmartPlugSwUpdateZod.readonly(),
  type: z.string().readonly(),
  name: z.string().readonly(),
  modelid: z.string().readonly(),
  manufacturername: z.string().readonly(),
  productname: z.string().readonly(),
  capabilities: SmartPlugCapabilitiesZod.readonly(),
  config: SmartPlugConfigZod.readonly(),
  uniqueid: z.string().readonly(),
  swversion: z.string().readonly(),
  swconfigid: z.string().readonly(),
  productid: z.string().readonly(),
});

export const HueLightsResponseZod = z
  .record(z.string(), z.union([LightObjectZod, SmartPlugObjectZod]))
  .readonly();

export const HueLightStateResponseZod = z.object({
  success: z.record(z.string(), z.unknown()).optional().readonly(),
});
export const HueLightsStateResponsesZod = z.array(HueLightStateResponseZod);

export type LightState = z.infer<typeof LightStateZod>;
export type SwUpdate = z.infer<typeof SwUpdateZod>;
export type Control = z.infer<typeof ControlZod>;
export type Capabilities = z.infer<typeof CapabilitiesZod>;
export type Config = z.infer<typeof ConfigZod>;
export type LightObject = z.infer<typeof LightObjectZod>;
export type HueLightsResponse = z.infer<typeof HueLightsResponseZod>;
export type HueLightsStateResponses = z.infer<
  typeof HueLightsStateResponsesZod
>;
