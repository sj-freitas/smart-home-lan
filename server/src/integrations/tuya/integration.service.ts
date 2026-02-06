import { TuyaIntegrationDevice } from "../../config/integration.zod";
import {
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import {
  TuyaBatchStatusResponseZod,
  TuyaDeviceCommandResultZod,
} from "./types.zod";
import {
  DeviceAction,
  HomeConfig,
  RoomDeviceTypes,
} from "../../config/home.zod";
import { Memoizer } from "../../services/memoizer";
import { ConfigService } from "../../config/config-service";

function getAllTuyaDeviceIdsFromConfig(home: HomeConfig) {
  const allRoomsFlat = home.rooms.flatMap((t) => t);
  const allDevices = allRoomsFlat.flatMap((t) => t.devices);

  const allTuyaDevices = allDevices
    .filter((t) => t.integration.name === "tuya_cloud")
    .map((t) => ({
      deviceId: (t.integration as TuyaIntegrationDevice).deviceId,
      deviceType: t.type,
    }));

  return allTuyaDevices;
}

interface TuyaDeviceMetadata {
  deviceId: string;
  deviceType: RoomDeviceTypes;
}

const TUYA_DEVICE_MEMOIZATION_KEY = Symbol("TUYA_DEVICE_MEMOIZATION_KEY");

export class TuyaCloudIntegrationService implements IntegrationService<TuyaIntegrationDevice> {
  private readonly allTuyaDeviceIds: TuyaDeviceMetadata[];

  constructor(
    private readonly tuyaContext: TuyaContext,
    config: ConfigService,
  ) {
    this.allTuyaDeviceIds = getAllTuyaDeviceIdsFromConfig(
      config.getConfig().home,
    );
  }

  public name: "tuya_cloud" = "tuya_cloud";

  async getDeviceTemperature(): Promise<number> {
    return NaN;
  }
  async getDeviceState(
    memoizationContext: Memoizer,
    deviceInfo: TuyaIntegrationDevice,
    deviceType: RoomDeviceTypes,
  ): Promise<string> {
    if (deviceType !== "smart_switch") {
      return "off";
    }

    try {
      const deviceIds = this.allTuyaDeviceIds.map((t) => t.deviceId);
      const unparsedBatchedResponse = await memoizationContext.run(
        TUYA_DEVICE_MEMOIZATION_KEY,
        async () => {
          return await this.tuyaContext.request({
            method: "GET",
            path: `/v1.0/iot-03/devices/status?device_ids=${encodeURIComponent(deviceIds.join(","))}`,
            body: {},
          });
        },
      );
      const parsedBatchStatus = TuyaBatchStatusResponseZod.parse(
        unparsedBatchedResponse,
      );

      // Find specific device
      const matchingDevice = parsedBatchStatus.result.find(
        (t) => t.id === deviceInfo.deviceId,
      );

      if (!matchingDevice) {
        throw new Error(
          `Device with id ${deviceInfo.deviceId} was not found on Tuya Cloud.`,
        );
      }

      const switchOne = matchingDevice.status.find(
        (t) => t.code === "switch_1",
      );
      if (!switchOne) {
        throw new Error(
          `Device does not have the switch_1 status which means it's probably not a smart socket.`,
        );
      }

      return switchOne.value ? "on" : "off";
    } catch (error: unknown) {
      console.error(error);
      return "off";
    }
  }

  async tryRunAction(
    _: Memoizer,
    deviceInfo: TuyaIntegrationDevice,
    deviceType: RoomDeviceTypes,
    actionDescription: DeviceAction,
  ): Promise<TryRunActionResult> {
    if (deviceType !== "smart_switch") {
      return `Integrations for actions for Tuya devices do not support ${deviceType}.`;
    }

    // Could we get all Tuya device IDS here from the config? A bit cheating but we can try.

    try {
      if (actionDescription.id === "on") {
        const response = await this.tuyaContext.request({
          path: `/v1.0/iot-03/devices/${deviceInfo.deviceId}/commands`,
          method: "POST",
          body: { commands: [{ code: "switch_1", value: true }] },
        });

        const parsedResponse = TuyaDeviceCommandResultZod.parse(response);
        return parsedResponse.success ? true : "Failed to turn on the device.";
      }
      if (actionDescription.id === "off") {
        const response = await this.tuyaContext.request({
          path: `/v1.0/iot-03/devices/${deviceInfo.deviceId}/commands`,
          method: "POST",
          body: { commands: [{ code: "switch_1", value: false }] },
        });
        const parsedResponse = TuyaDeviceCommandResultZod.parse(response);
        return parsedResponse.success ? true : "Failed to turn off the device.";
      }
    } catch (error: unknown) {
      console.error(error);
      return "Tuya Cloud connection failed.";
    }
    return "Tuya Cloud connection failed.";
  }
}
