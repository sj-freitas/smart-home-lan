import { z } from "zod";

export const TuyaDeviceCommandResultZod = z.object({
  result: z.boolean().readonly(),
  success: z.boolean().readonly(),
  t: z.number().readonly(),
  tid: z.string().readonly(),
});
export const TuyaDeviceStatusZod = z.object({
  result: z
    .array(
      z.object({
        code: z.string().readonly(),
        value: z.boolean().readonly(),
      }),
    )
    .readonly(),
  success: z.boolean().readonly(),
  t: z.number().readonly(),
  tid: z.string().readonly(),
});

export type TuyaDeviceCommandResult = z.infer<typeof TuyaDeviceCommandResultZod>;
export type TuyaDeviceStatus = z.infer<typeof TuyaDeviceStatusZod>;
