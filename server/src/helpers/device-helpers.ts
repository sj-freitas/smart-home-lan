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
}
