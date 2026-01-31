import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "../config/config-service";
import { HomeConfig } from "../config/home.zod";
import {
  IntegrationServiceWithContext,
  IntegrationsService,
} from "../integrations/integrations-service";
import { UserValidationService } from "../services/user-validation.service";
import { DeviceHelper } from "../helpers/device-helpers";

@Controller("home")
export class HomeController {
  private readonly deviceHelper: DeviceHelper;
  private readonly homeConfig: HomeConfig;
  private readonly integrations: IntegrationsService;
  private readonly userValidationService: UserValidationService;

  constructor(
    config: ConfigService,
    integrations: IntegrationsService,
    userValidationService: UserValidationService,
  ) {
    this.homeConfig = config.getConfig().home;
    this.deviceHelper = new DeviceHelper(this.homeConfig);
    this.integrations = integrations;
    this.userValidationService = userValidationService;
  }

  private getIntegrationServiceForDevice(
    roomId: string,
    deviceId: string,
  ): IntegrationServiceWithContext<unknown> | null {
    const deviceInfo = this.deviceHelper.getDevice(roomId, deviceId);
    if (!deviceInfo) {
      return null;
    }
    return this.integrations.getIntegration({
      integration: deviceInfo.integration,
      deviceType: deviceInfo.type,
    });
  }

  @Get("/")
  public async getHomeInfo() {
    const canPerformActions = this.userValidationService.isRequestAllowed();
    const homeInfo = {
      name: this.homeConfig.name,
      logo: this.homeConfig.iconUrl,
      rooms: await Promise.all(
        this.homeConfig.rooms.map(async (room) => ({
          id: room.id,
          name: room.name,
          temperature:
            (await this.getIntegrationServiceForDevice(
              room.id,
              room.roomInfo.sourceDeviceId,
            )?.getDeviceTemperature()) ?? NaN,
          devices: await Promise.all(
            room.devices.map(async (device) => {
              const deviceInfo = this.getIntegrationServiceForDevice(
                room.id,
                device.id,
              );
              const currentDeviceState =
                deviceInfo === null
                  ? "off"
                  : await deviceInfo.getDeviceState(Array.from(device.actions));

              return {
                id: device.id,
                name: device.name,
                icon: device.icon,
                type: device.type,
                actions: canPerformActions
                  ? (device.actions.map((t) => ({
                      id: t.id,
                      name: t.name,
                    })) ?? [])
                  : [],
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
