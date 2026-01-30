import { DeviceAction, RoomDeviceTypes } from "../../config/home.zod";
import { MelCloudHomeIntegrationDevice } from "../../config/integration.zod";
import {
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { MelCloudHomeClient } from "./client";
import {
  AirToAirUnitStateChange,
  AirToAirUnitStateChangeZod,
} from "./types.zod";

// Order the fields by the relevance for matching. Score a match by the number of fields that match, but
// each field has a different weight based on its relevance.
const WEIGHTED_FIELDS_BY_RELEVANCE: [number, keyof AirToAirUnitStateChange][] =
  [
    "power",
    "operationMode",
    "setTemperature",
    "setFanSpeed",
    "vaneHorizontalDirection",
    "vaneVerticalDirection",
  ]
    .reverse()
    .map(
      (field: keyof AirToAirUnitStateChange, index: number) =>
        [2 ** index, field] as [number, keyof AirToAirUnitStateChange],
    )
    .reverse();

const fanSpeedSettingsToParametersMap = {
  "0": "Auto",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
};

function mapSettingsRecordToParameters(
  settings: Record<string, string>,
): AirToAirUnitStateChange {
  return AirToAirUnitStateChangeZod.parse({
    power: settings["Power"] === "True",
    operationMode: settings["OperationMode"],
    setFanSpeed:
      fanSpeedSettingsToParametersMap[settings["SetFanSpeed"]] ?? "Auto",
    vaneHorizontalDirection: settings["VaneHorizontalDirection"],
    vaneVerticalDirection: settings["VaneVerticalDirection"],
    setTemperature: Number.parseFloat(settings["SetTemperature"]),
  } as AirToAirUnitStateChange);
}

function tryFindBestMatchingAction(
  currentDeviceState: AirToAirUnitStateChange,
  possibleDeviceActions: Map<string, AirToAirUnitStateChange>,
): string {
  const scoresForEachAction = Array.from(possibleDeviceActions.entries()).map(
    ([actionId, actionParameters]) => {
      let score = 0;
      for (const [weight, field] of WEIGHTED_FIELDS_BY_RELEVANCE) {
        if (currentDeviceState[field] === actionParameters[field]) {
          score += weight;
        }
      }
      return { actionId, score };
    },
  );

  // Find the action with the highest score
  const bestMatch = scoresForEachAction.reduce(
    (best, current) => {
      return current.score > best.score ? current : best;
    },
    { actionId: "off", score: 0 },
  );

  return bestMatch.actionId;
}

export class MelCloudHomeIntegrationService implements IntegrationService<MelCloudHomeIntegrationDevice> {
  constructor(private readonly melCloudHomeClient: MelCloudHomeClient) {}

  public name: "mel_cloud_home" = "mel_cloud_home";

  async getDeviceTemperature(
    deviceInfo: MelCloudHomeIntegrationDevice,
  ): Promise<number> {
    const allDevices = await this.melCloudHomeClient.getContext();
    const foundDevice = allDevices.find((d) => d.id === deviceInfo.deviceId);
    if (!foundDevice) {
      console.log(`Device not found: ${deviceInfo.deviceId}`);
      return NaN;
    }

    return foundDevice.room.temperature;
  }
  async getDeviceState(
    deviceInfo: MelCloudHomeIntegrationDevice,
    actionDescriptions: DeviceAction[],
  ): Promise<string> {
    if (deviceInfo.deviceId === "64f39725-85fc-4d31-a697-b7f6d3c3d258") {
      console.log("Debug breakpoint for lviv/ac");
    }

    const allDevices = await this.melCloudHomeClient.getContext();
    const foundDevice = allDevices.find((d) => d.id === deviceInfo.deviceId);

    if (!foundDevice) {
      return "off";
    }

    const currentDeviceState = mapSettingsRecordToParameters(
      foundDevice.settings,
    );
    const actionParametersMap = new Map(
      actionDescriptions.map(
        (t) =>
          [t.id, AirToAirUnitStateChangeZod.parse(t.parameters)] as [
            string,
            AirToAirUnitStateChange,
          ],
      ),
    );

    return tryFindBestMatchingAction(currentDeviceState, actionParametersMap);
  }

  async tryRunAction(
    deviceInfo: MelCloudHomeIntegrationDevice,
    deviceType: RoomDeviceTypes,
    actionDescription: DeviceAction,
  ): Promise<TryRunActionResult> {
    try {
      // Only supported type for MEL Cloud Home are Air Conditioners
      if (deviceType === "air_conditioner") {
        // This is the only time we can verify that the config is correctly formed.
        // However, this should have been caught earlier in the process.
        const parsedParameters = AirToAirUnitStateChangeZod.parse(
          actionDescription.parameters,
        );

        await this.melCloudHomeClient.putAtAUnit(
          deviceInfo.deviceId,
          parsedParameters,
        );

        return true;
      }
    } catch (error: unknown) {
      console.error(error);
      return "There was an error performing the action.";
    }

    return `Integrations for actions for MelHomeCloud devices do not support ${deviceType}. This could be a config issue.`;
  }
}
