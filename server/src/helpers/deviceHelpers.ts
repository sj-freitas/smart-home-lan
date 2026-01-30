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

  public getDevice(roomId: string, deviceId: string): RoomDeviceConfig | null {
    const deviceInfo = this.deviceMap.get(`${roomId}/${deviceId}`);
    if (!deviceInfo) {
      return null;
    }
    return deviceInfo;
  }
}
