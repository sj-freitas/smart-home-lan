import { TuyaIntegrationDevice } from "../../config/integration.zod";
import {
  DeviceState,
  IntegratedDeviceConfig,
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import {
  TuyaBatchStatusResponseZod,
  TuyaDeviceCommandResultZod,
} from "./types.zod";
import { DeviceAction, RoomDeviceTypes } from "../../config/home.zod";

export class TuyaCloudIntegrationService implements IntegrationService<TuyaIntegrationDevice> {
  constructor(private readonly tuyaContext: TuyaContext) {}

  public name: "tuya_cloud" = "tuya_cloud";

  public async consolidateDeviceStates(
    devices: IntegratedDeviceConfig<TuyaIntegrationDevice>[],
  ): Promise<DeviceState[]> {
    const tuyaDeviceIds = devices.map((t) => t.info.deviceId);
    const unparsedBatchedResponse = await this.tuyaContext.request({
      method: "GET",
      path: `/v1.0/iot-03/devices/status?device_ids=${encodeURIComponent(tuyaDeviceIds.join(","))}`,
      body: {},
    });
    const parsedBatchStatus = TuyaBatchStatusResponseZod.parse(
      unparsedBatchedResponse,
    );

    return devices.map((t) => {
      if (t.type !== "smart_switch") {
        console.warn(`Unsupported device type ${t.type} for Tuya`);
        return {
          online: false,
          state: "off",
          temperature: null,
          humidity: null,
        };
      }

      const matchingDevice = parsedBatchStatus.result.find(
        (currTuyaDevice) => t.info.deviceId === currTuyaDevice.id,
      );
      if (!matchingDevice) {
        return {
          online: false,
          state: "off",
          temperature: null,
          humidity: null,
        };
      }
      const switchOne = matchingDevice.status.find(
        (t) => t.code === "switch_1",
      );
      if (!switchOne) {
        throw new Error(
          `Device does not have the switch_1 status which means it's probably not a smart socket.`,
        );
      }

      return {
        state: switchOne.value ? "on" : "off",
        online: true,
        temperature: null,
        humidity: null,
      };
    });
  }

  async tryRunAction(
    deviceInfo: TuyaIntegrationDevice,
    deviceType: RoomDeviceTypes,
    actionDescription: DeviceAction,
  ): Promise<TryRunActionResult> {
    if (deviceType !== "smart_switch") {
      return `Integrations for actions for Tuya devices do not support ${deviceType}.`;
    }

    try {
      const response = await this.tuyaContext.request({
        path: `/v1.0/iot-03/devices/${deviceInfo.deviceId}/commands`,
        method: "POST",
        body: {
          commands: [
            { code: "switch_1", value: actionDescription.id === "on" },
          ],
        },
      });

      const parsedResponse = TuyaDeviceCommandResultZod.parse(response);
      return parsedResponse.success ? true : "Failed to turn on the device.";
    } catch (error: unknown) {
      console.error(error);
      return "Tuya Cloud connection failed.";
    }
  }
}
