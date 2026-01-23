import { MelCloudHomeIntegrationDevice } from "../../config/integration.zod";
import { IntegrationService } from "../integrations-service";
import { MelCloudHomeClient } from "./client";
import { AirToAirUnitStateChange } from "./types.zod";

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
  ): Promise<string> {
    const allDevices = await this.melCloudHomeClient.getContext();
    const foundDevice = allDevices.find((d) => d.id === deviceInfo.deviceId);
    if (!foundDevice) {
      return "off";
    }

    // Map the mode
    if (!foundDevice.power) {
      return "off";
    }

    if (foundDevice.mode === "Heat") {
      return "on_heat";
    }

    return "on_cool";
  }

  async tryRunAction(
    deviceInfo: MelCloudHomeIntegrationDevice,
    action: string,
  ): Promise<boolean> {
    // Hard code the actions for now, but should change.
    try {
      if (action === "on_heat") {
        const heatMode: AirToAirUnitStateChange = {
          power: true,
          operationMode: "Heat",
          setFanSpeed: "Auto",
          vaneHorizontalDirection: null,
          vaneVerticalDirection: null,
          setTemperature: 25,
          temperatureIncrementOverride: null,
          inStandbyMode: null,
        };
        return await this.melCloudHomeClient.putAtAUnit(
          deviceInfo.deviceId,
          heatMode,
        );
      }
      if (action === "on_cool") {
        const coolMode: AirToAirUnitStateChange = {
          power: true,
          operationMode: "Cool",
          setFanSpeed: "Auto",
          vaneHorizontalDirection: null,
          vaneVerticalDirection: null,
          setTemperature: 20,
          temperatureIncrementOverride: null,
          inStandbyMode: null,
        };
        return await this.melCloudHomeClient.putAtAUnit(
          deviceInfo.deviceId,
          coolMode,
        );
      }
      if (action === "off") {
        const off: AirToAirUnitStateChange = {
          power: false,
          operationMode: null,
          setFanSpeed: null,
          vaneHorizontalDirection: null,
          vaneVerticalDirection: null,
          setTemperature: null,
          temperatureIncrementOverride: null,
          inStandbyMode: null,
        };
        return await this.melCloudHomeClient.putAtAUnit(
          deviceInfo.deviceId,
          off,
        );
      }
    } catch (error: unknown) {
      console.error(error);
      return false;
    }

    console.warn(
      `Integrations for actions for MelHomeCloud devices do not support ${action} on ${deviceInfo.name}!`,
    );
    return false;
  }
}
