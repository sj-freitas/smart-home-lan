import {
  IntegrationDeviceTypes,
  IntegrationTypeNames,
} from "../config/integration.zod";
import { HomeConfig, RoomDeviceConfig } from "../config/home.zod";

function getDevicesFromHome(home: HomeConfig): Map<string, RoomDeviceConfig> {
  const allDevices = home.rooms
    .map((room) =>
      room.devices.map((device) => ({
        ...device,
        id: `${room.id}/${device.id}`,
      })),
    )
    .flatMap((t) => t);

  return new Map(allDevices.map((device) => [device.id, device]));
}

export class DeviceHelper {
  private deviceMap: Map<string, RoomDeviceConfig>;

  constructor(home: HomeConfig) {
    this.deviceMap = getDevicesFromHome(home);
  }

  public getDevice(devicePath: string): RoomDeviceConfig | null {
    const deviceInfo = this.deviceMap.get(devicePath);
    if (!deviceInfo) {
      return null;
    }
    return deviceInfo;
  }

  public getDeviceFromIntegration<T extends IntegrationDeviceTypes>(
    integration: IntegrationTypeNames,
    picker: (deviceOfType: T) => boolean,
  ): string | null {
    const allDevices = Array.from(this.deviceMap.entries()).filter(
      ([_, device]) => device.integration.name === integration,
    );

    const found = allDevices.find(([_, device]) =>
      picker(device.integration as T),
    );
    return found ? found[0] : null;
  }
}
