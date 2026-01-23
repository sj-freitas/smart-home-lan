import { z } from "zod";
import { IntegrationDeviceTypesZod } from "./integration.zod";

const RoomDeviceTypesZod = z.union([
  z.literal("air_conditioner"),
  z.literal("smart_switch"),
  z.literal("smart_light"),
]);

export const RoomDeviceConfigZod = z.object({
  id: z.string().readonly(),
  icon: z.string().readonly(),
  name: z.string().readonly(),
  type: RoomDeviceTypesZod.readonly(),
  integration: IntegrationDeviceTypesZod.readonly(),
});

export const RoomConfigZod = z.object({
  id: z.string().readonly(),
  name: z.string().readonly(),
  roomInfo: z.object({
    sourceDeviceId: z.string().readonly(),
  }).optional().readonly(),
  devices: z.array(RoomDeviceConfigZod).readonly(),
});

export const HomeConfigZod = z.object({
  name: z.string().readonly(),
  rooms: z.array(RoomConfigZod).readonly(),
});

export type RoomDeviceTypes = z.infer<typeof RoomDeviceTypesZod>;
export type RoomDeviceConfig = z.infer<typeof RoomDeviceConfigZod>;
export type RoomConfig = z.infer<typeof RoomConfigZod>;
export type HomeConfig = z.infer<typeof HomeConfigZod>;
