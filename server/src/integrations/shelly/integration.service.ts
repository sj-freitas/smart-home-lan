import { ShellyIntegrationDevice } from "../../config/integration.zod";
import {
  DeviceState,
  IntegratedDeviceConfig,
  IntegrationService,
  TryRunActionResult,
} from "../integrations-service";
import { RoomDeviceTypes, DeviceAction } from "../../config/home.zod";

export class ShellyIntegrationService implements IntegrationService<ShellyIntegrationDevice> {
  public name: "shelly" = "shelly";

  public async consolidateDeviceStates(
    devices: IntegratedDeviceConfig<ShellyIntegrationDevice>[],
  ): Promise<DeviceState[]> {
    // No need to do anything here I guess (?)
    return [];
  }
  public async tryRunAction(
    deviceInfo: ShellyIntegrationDevice,
    deviceType: RoomDeviceTypes,
    action: DeviceAction,
  ): Promise<TryRunActionResult> {
    return "Shelly devices do not support actions";
  }
}
