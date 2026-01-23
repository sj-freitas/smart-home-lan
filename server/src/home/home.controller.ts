import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "../config/config-service";
import { HomeConfig, RoomDeviceConfig } from "../config/home.zod";
import {
  IntegrationServiceWithContext,
  IntegrationsService,
} from "../integrations/integrations-service";
import { ACTIONS_BY_TYPE } from "../actions/actions.config";

function getDevicesFromHome(home: HomeConfig): Map<string, RoomDeviceConfig> {
  const allDevices = home.rooms.map((t) => t.devices).flatMap((t) => t);

  return new Map(allDevices.map((device) => [device.id, device]));
}

@Controller("home")
export class HomeController {
  private readonly deviceMap: Map<string, RoomDeviceConfig>;
  private readonly homeConfig: HomeConfig;
  private readonly integrations: IntegrationsService;

  constructor(config: ConfigService, integrations: IntegrationsService) {
    this.homeConfig = config.getConfig().home;
    this.deviceMap = getDevicesFromHome(this.homeConfig);
    this.integrations = integrations;
  }

  private getIntegrationServiceForDevice(
    deviceId: string,
  ): IntegrationServiceWithContext<unknown> | null {
    const deviceInfo = this.deviceMap.get(deviceId);
    if (!deviceInfo) {
      return null;
    }
    return this.integrations.getIntegration(deviceInfo.integration);
  }

  @Get("/")
  public async getHomeInfo() {
    const homeInfo = {
      name: this.homeConfig.name,
      rooms: await Promise.all(
        this.homeConfig.rooms.map(async (room) => ({
          id: room.id,
          name: room.name,
          temperature:
            (await this.getIntegrationServiceForDevice(
              room.roomInfo.sourceDeviceId,
            )?.getDeviceTemperature()) ?? NaN,
          devices: await Promise.all(
            room.devices.map(async (device) => {
              const deviceInfo = this.getIntegrationServiceForDevice(device.id);
              const currentDeviceState =
                deviceInfo === null ? "off" : await deviceInfo.getDeviceState();

              return {
                id: device.id,
                name: device.name,
                icon: device.icon,
                type: device.type,
                actions:
                  ACTIONS_BY_TYPE.get(device.type)?.map((t) => ({
                    id: t.name,
                    name: t.description,
                  })) ?? [],
                state: currentDeviceState,
              };
            }),
          ),
        })),
      ),
    };

    return homeInfo;
  }
}

// Based on the type we can have specific actions:
// These can be hardcoded on the API and set as a response
// - air_conditioner:
//    - on_heat
//    - on_cool
//    - off
// - smart_switch
//    - on
//    - off
// - smart_light
//    - on_bright
//    - on_dim
//    - on_kinky
//    - off
//
// The controller for state change should have a path like action/{Room}/{Device}/{Action}
// Example: /action/living_room/air_conditioner/on_heat
// The body might not be necessary for these simple actions
