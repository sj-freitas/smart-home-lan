import { z } from "zod";

export const SettingZod = z.object({
  name: z.string().readonly(),
  value: z.string().readonly(),
});

export const AirToAirUnitZod = z.object({
  id: z.string().readonly(),
  givenDisplayName: z.string().readonly(),
  displayIcon: z.string().readonly(),
  unitSettings: z.unknown().nullable().readonly(),
  settings: z.array(SettingZod).readonly(),
  schedule: z.array(z.unknown()).readonly(),
  isInError: z.boolean().readonly(),
  scheduleEnabled: z.boolean().readonly(),
  connectedInterfaceIdentifier: z.string().readonly(),
  capabilities: z
    .object({
      isMultiSplitSystem: z.boolean().readonly(),
      isLegacyDevice: z.boolean().readonly(),
      hasStandby: z.boolean().readonly(),
      hasCoolOperationMode: z.boolean().readonly(),
      hasHeatOperationMode: z.boolean().readonly(),
      hasAutoOperationMode: z.boolean().readonly(),
      hasDryOperationMode: z.boolean().readonly(),
      hasAutomaticFanSpeed: z.boolean().readonly(),
      hasAirDirection: z.boolean().readonly(),
      hasSwing: z.boolean().readonly(),
      hasExtendedTemperatureRange: z.boolean().readonly(),
      hasEnergyConsumedMeter: z.boolean().readonly(),
      numberOfFanSpeeds: z.number().readonly(),
      minTempCoolDry: z.number().readonly(),
      maxTempCoolDry: z.number().readonly(),
      minTempHeat: z.number().readonly(),
      maxTempHeat: z.number().readonly(),
      minTempAutomatic: z.number().readonly(),
      maxTempAutomatic: z.number().readonly(),
      hasDemandSideControl: z.boolean().readonly(),
      hasHalfDegreeIncrements: z.boolean().readonly(),
      supportsWideVane: z.boolean().readonly(),
    })
    .readonly(),
  rssi: z.number().readonly(),
  timeZone: z.string().readonly(),
  frostProtection: z.unknown().nullable().readonly(),
  overheatProtection: z.unknown().nullable().readonly(),
  holidayMode: z.unknown().nullable().readonly(),
  isConnected: z.boolean().readonly(),
  connectedInterfaceType: z.number().readonly(),
  systemId: z.string().readonly(),
  energyProducedOptIn: z.boolean().readonly(),
  isEnergyUsageCompatible: z.boolean().readonly(),
});

const FanSpeedTYpesZod = z.union([
  z.literal("One"),
  z.literal("Two"),
  z.literal("Three"),
  z.literal("Four"),
  z.literal("Five"),
  z.literal("Auto"),
]);
const OperationModeZod = z.union([
  z.literal("Heat"),
  z.literal("Cool"),
  z.literal("Fan"),
  z.literal("Dry"),
  z.literal("Automatic"),
]);
// One means top, Five means Lowest
const VaneVerticalDirectionZod = z.union([
  z.literal("One"),
  z.literal("Two"),
  z.literal("Three"),
  z.literal("Four"),
  z.literal("Five"),
  z.literal("Swing"),
  z.literal("Auto"),
]);
const VaneHorizontalDirectionZod = z.union([
  z.literal("Left"),
  z.literal("LeftCentre"),
  z.literal("Centre"),
  z.literal("RightCentre"),
  z.literal("Right"),
  z.literal("Swing"),
  z.literal("Auto"),
]);
const AllowedTemperaturesZod = z.union([
  z.literal(10),
  z.literal(10.5),
  z.literal(11),
  z.literal(11.5),
  z.literal(12),
  z.literal(12.5),
  z.literal(13),
  z.literal(13.5),
  z.literal(14),
  z.literal(14.5),
  z.literal(15),
  z.literal(15.5),
  z.literal(16),
  z.literal(16.5),
  z.literal(17),
  z.literal(17.5),
  z.literal(18),
  z.literal(18.5),
  z.literal(19),
  z.literal(19.5),
  z.literal(20),
  z.literal(20.5),
  z.literal(21),
  z.literal(21.5),
  z.literal(22),
  z.literal(22.5),
  z.literal(23),
  z.literal(23.5),
  z.literal(24),
  z.literal(24.5),
  z.literal(25),
  z.literal(25.5),
  z.literal(26),
  z.literal(26.5),
  z.literal(27),
  z.literal(27.5),
  z.literal(28),
  z.literal(28.5),
  z.literal(29),
  z.literal(29.5),
  z.literal(30),
  z.literal(30.5),
  z.literal(31),
]);

export const AirToAirUnitStateChangeZod = z.object({
  power: z.boolean().nullable(),
  operationMode: OperationModeZod.nullable(),
  setFanSpeed: FanSpeedTYpesZod.nullable(),
  vaneHorizontalDirection: VaneHorizontalDirectionZod.nullable(),
  vaneVerticalDirection: VaneVerticalDirectionZod.nullable(),
  setTemperature: AllowedTemperaturesZod.nullable(),
  temperatureIncrementOverride: z.unknown().nullable(),
  inStandbyMode: z.unknown().nullable(),
});

export type AirToAirUnit = z.infer<typeof AirToAirUnitZod>;
export type AirToAirUnitStateChange = z.infer<
  typeof AirToAirUnitStateChangeZod
>;
