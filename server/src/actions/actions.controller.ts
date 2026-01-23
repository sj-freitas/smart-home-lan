import { Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
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

@Controller("action")
export class ActionsController {
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

  @Post("/:room/:deviceId/:action")
  @HttpCode(200)
  public async performAction(
    @Param("room") room: string,
    @Param("deviceId") deviceId: string,
    @Param("action") action: string,
  ) {
    const device = this.getIntegrationServiceForDevice(deviceId);
    const actionRunStatus = await device.tryRunAction(action);
    
    return {
      room,
      deviceId: deviceId,
      action,
      runStatus: actionRunStatus ? "success" : "failure",
    };
  }
}
