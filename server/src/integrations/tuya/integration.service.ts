import { TuyaIntegrationDevice } from "../../config/integration.zod";
import { IntegrationService } from "../integrations-service";
import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import { TuyaDeviceCommandResultZod, TuyaDeviceStatusZod } from "./types.zod";

export class TuyaCloudIntegrationService implements IntegrationService<TuyaIntegrationDevice> {
  constructor(private readonly tuyaContext: TuyaContext) {}

  public name: "tuya_cloud" = "tuya_cloud";

  async getDeviceTemperature(): Promise<number> {
    // Cannot tell temperature from a Tuya Device
    return NaN;
  }
  async getDeviceState(deviceInfo: TuyaIntegrationDevice): Promise<string> {
    try {
      const statusUnparsed = await this.tuyaContext.deviceStatus.status({
        device_id: deviceInfo.deviceId,
      });
      const status = await TuyaDeviceStatusZod.parseAsync(statusUnparsed);
      const switchOne = status.result.find((t) => t.code === "switch_1");
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
    deviceInfo: TuyaIntegrationDevice,
    action: string,
  ): Promise<boolean> {
    // Hard code the actions for now, but should change.
    try {
      if (action === "on") {
        const response = await this.tuyaContext.request({
          path: `/v1.0/iot-03/devices/${deviceInfo.deviceId}/commands`,
          method: "POST",
          body: { commands: [{ code: "switch_1", value: true }] },
        });

        const parsedResponse = TuyaDeviceCommandResultZod.parse(response);
        return parsedResponse.success;
      }
      if (action === "off") {
        const response = await this.tuyaContext.request({
          path: `/v1.0/iot-03/devices/${deviceInfo.deviceId}/commands`,
          method: "POST",
          body: { commands: [{ code: "switch_1", value: false }] },
        });
        const parsedResponse = TuyaDeviceCommandResultZod.parse(response);
        return parsedResponse.success;
      }
    } catch (error: unknown) {
      console.error(error);
      return false;
    }

    console.warn(
      `Integrations for actions for Tuya devices do not support ${action} on ${deviceInfo.name}!`,
    );
    return false;
  }
}
