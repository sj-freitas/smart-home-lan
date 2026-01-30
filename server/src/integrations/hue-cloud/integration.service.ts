import {
  HueCloudIntegrationDevice,
} from "src/config/integration.zod";
import {
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { DeviceAction, RoomDeviceTypes } from "src/config/home.zod";

export class HueCloudIntegrationService implements IntegrationService<HueCloudIntegrationDevice> {
  public name: "hue_cloud" = "hue_cloud";

  async getDeviceTemperature(
    deviceInfo: HueCloudIntegrationDevice,
  ): Promise<number> {
    return NaN;
  }

  async getDeviceState(
    deviceInfo: HueCloudIntegrationDevice,
    actionDescriptions: DeviceAction[],
  ): Promise<string> {
    return "off";
  }

  async tryRunAction(
    deviceInfo: HueCloudIntegrationDevice,
    deviceType: RoomDeviceTypes,
    action: DeviceAction,
  ): Promise<TryRunActionResult> {
    return "Failure - not implemented yet";
  }
}
