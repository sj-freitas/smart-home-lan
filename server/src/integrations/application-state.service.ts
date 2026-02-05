import { DeviceHelper } from "../helpers/device-helpers";
import { ConfigService } from "../config/config-service";
import {
  IntegrationServiceWithContext,
  IntegrationsService,
} from "./integrations-service";
import { HomeConfig, RoomDeviceTypes } from "../config/home.zod";
import { Memoizer } from "../services/memoizer";

export interface ApplicationState {
  name: string;
  logo: string;
  faviconUrl: string;
  subTitle: string;
  rooms: {
    id: string;
    name: string;
    icon: string;
    temperature: number;
    devices: {
      id: string;
      name: string;
      icon: string;
      type: RoomDeviceTypes;
      actions: {
        id: string;
        name: string;
      }[];
      state: string;
    }[];
  }[];
}

// A service that stores the application state.
// This service also generates the state - basically what's returned by api/home.
export class ApplicationStateService {
  private readonly deviceHelper: DeviceHelper;
  private readonly homeConfig: HomeConfig;
  private readonly integrations: IntegrationsService;

  constructor(config: ConfigService, integrations: IntegrationsService) {
    this.homeConfig = config.getConfig().home;
    this.deviceHelper = new DeviceHelper(this.homeConfig);
    this.integrations = integrations;
  }

  private getIntegrationServiceForDevice(
    devicePath: string,
  ): IntegrationServiceWithContext<unknown> | null {
    const deviceInfo = this.deviceHelper.getDevice(devicePath);
    if (!deviceInfo) {
      return null;
    }
    return this.integrations.getIntegration({
      integration: deviceInfo.integration,
      deviceType: deviceInfo.type,
    });
  }

  public async getHomeState(): Promise<ApplicationState> {
    const memoizationContext = new Memoizer();

    return {
      name: this.homeConfig.name,
      subTitle: this.homeConfig.subTitle,
      logo: this.homeConfig.iconUrl,
      faviconUrl: this.homeConfig.faviconUrl,
      rooms: await Promise.all(
        this.homeConfig.rooms.map(async (room) => ({
          id: room.id,
          name: room.name,
          icon: room.icon,
          temperature:
            (await this.getIntegrationServiceForDevice(
              room.roomInfo.sourceDeviceId,
            )?.getDeviceTemperature(memoizationContext)) ?? NaN,
          devices: await Promise.all(
            room.devices.map(async (device) => {
              const deviceInfo = this.getIntegrationServiceForDevice(
                `${room.id}/${device.id}`,
              );
              const currentDeviceState =
                deviceInfo === null
                  ? "off"
                  : await deviceInfo.getDeviceState(memoizationContext, Array.from(device.actions));

              return {
                id: device.id,
                name: device.name,
                icon: device.icon,
                type: device.type,
                actions:
                  device.actions.map((t) => ({
                    id: t.id,
                    name: t.name,
                  })) ?? [],
                state: currentDeviceState,
              };
            }),
          ),
        })),
      ),
    };
  }
}
