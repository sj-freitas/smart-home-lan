import { HueCloudIntegrationDevice } from "../../config/integration.zod";
import {
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { DeviceAction, RoomDeviceTypes } from "../../config/home.zod";
import { HueClient } from "./hue.client";
import { LightState, LightStateZod } from "./hue.types.zod";
import { Memoizer } from "../../services/memoizer";

function normalizeDeviceIds(deviceId: string | string[]): string[] {
  if (Array.isArray(deviceId)) {
    return deviceId;
  }
  return [deviceId];
}

// Order the fields by the relevance for matching. Score a match by the number of fields that match, but
// each field has a different weight based on its relevance.
const FIELDS_ORDERED_BY_RELEVANCE: (keyof LightState)[] = [
  "on",
  "hue",
  "sat",
  "bri",
];
const WEIGHTED_FIELDS_BY_RELEVANCE = FIELDS_ORDERED_BY_RELEVANCE.reverse()
  .map(
    (field: keyof LightState, index: number) =>
      [2 ** index, field] as [number, keyof LightState],
  )
  .reverse();

const MAX_MARGIN_OF_SIMILARITY = 15;
function areFieldsMatched(field1: unknown, field2: unknown) {
  if (typeof field1 === "boolean") {
    return field1 === field2;
  }
  if (typeof field1 === "number" && typeof field2 === "number") {
    return Math.abs(field1 - field2) <= MAX_MARGIN_OF_SIMILARITY;
  }

  // Unsupported comparison (for now)
  return false;
}

function tryFindBestMatchingAction(
  currentDeviceState: LightState,
  possibleDeviceActions: Map<string, LightState>,
): string {
  const scoresForEachAction = Array.from(possibleDeviceActions.entries()).map(
    ([actionId, actionParameters]) => {
      let score = 0;
      for (const [weight, field] of WEIGHTED_FIELDS_BY_RELEVANCE) {
        if (
          areFieldsMatched(currentDeviceState[field], actionParameters[field])
        ) {
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

const HUE_STATE_CACHE_KEY = Symbol("HUE_STATE_CACHE_KEY");

export class HueCloudIntegrationService implements IntegrationService<HueCloudIntegrationDevice> {
  public name: "hue_cloud" = "hue_cloud";

  constructor(private readonly hueClient: HueClient) {}

  async getDeviceTemperature(): Promise<number> {
    return NaN;
  }

  async getDeviceState(
    memoizationContext: Memoizer,
    deviceInfo: HueCloudIntegrationDevice,
    actionDescriptions: DeviceAction[],
  ): Promise<string> {
    const lights = await memoizationContext.run(HUE_STATE_CACHE_KEY, async () =>
      this.hueClient.getLights(),
    );
    const ids = normalizeDeviceIds(deviceInfo.id);
    const [firstLight] = ids;
    const currDevice = lights[firstLight];

    if (!currDevice) {
      return "off";
    }

    const actionParametersMap = new Map(
      actionDescriptions.map(
        (t) =>
          [t.id, LightStateZod.parse(t.parameters)] as [string, LightState],
      ),
    );

    const currentDeviceState = currDevice.state;
    return tryFindBestMatchingAction(currentDeviceState, actionParametersMap);
  }

  async tryRunAction(
    _: Memoizer,
    deviceInfo: HueCloudIntegrationDevice,
    deviceType: RoomDeviceTypes,
    action: DeviceAction,
  ): Promise<TryRunActionResult> {
    if (deviceType !== "smart_light") {
      return `Failed, unsupported device type for Hue`;
    }

    const state = LightStateZod.parse(action.parameters);

    try {
      const deviceIds = normalizeDeviceIds(deviceInfo.id);
      const results = await Promise.all(
        deviceIds.map(async (currId) =>
          this.hueClient.setLightState(currId, state),
        ),
      );
      const allValid = results
        .flatMap((t) => t)
        .every((t) => Boolean(t.success));

      return allValid ? true : `Failed to perform some of the actions`;
    } catch (error: any) {
      return `Failed to set action ${action.id} on device ${deviceInfo.id}: ${error.message}`;
    }
  }
}
