import { Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { IntegrationsService } from "../integrations/integrations-service";
import { ConfigService } from "../config/config-service";
import { DeviceHelper } from "../helpers/device-helpers";
import { HomeStateGateway } from "../sockets/home.state.gateway";
import { AuthGuard } from "../services/auth-guard";
import { StateService } from "../services/state/state.service";

@Controller("api/actions")
export class ActionsController {
  private readonly deviceHelper: DeviceHelper;
  private readonly homeName: string;

  constructor(
    configService: ConfigService,
    private readonly integrations: IntegrationsService,
    private readonly homeStateGateway: HomeStateGateway,
    private readonly stateService: StateService,
  ) {
    const config = configService.getConfig();
    this.deviceHelper = new DeviceHelper(config.home);
    this.homeName = config.home.name;
  }

  private getIntegratedDeviceFromId(devicePath: string) {
    const deviceInfo = this.deviceHelper.getDevice(devicePath);
    if (!deviceInfo) {
      return null;
    }

    const integrationService = this.integrations.getIntegrationService(
      deviceInfo.integration.name,
    );
    return {
      device: deviceInfo,
      integration: integrationService,
    };
  }

  @UseGuards(AuthGuard)
  @Post("/:roomId/:deviceId/:actionId")
  @HttpCode(200)
  public async performAction(
    @Param("roomId") roomId: string,
    @Param("deviceId") deviceId: string,
    @Param("actionId") actionId: string,
  ) {
    const integratedDevice = this.getIntegratedDeviceFromId(
      `${roomId}/${deviceId}`,
    );
    if (!integratedDevice) {
      return {
        room: roomId,
        deviceId: deviceId,
        action: actionId,
        message: `Device with id ${deviceId} not found`,
        runStatus: "failure",
      };
    }
    const actionDescription = integratedDevice.device.actions.find(
      (t) => t.id === actionId,
    );
    if (!actionDescription) {
      return {
        room: roomId,
        deviceId: deviceId,
        action: actionId,
        message: `Action ${actionId} not found`,
        runStatus: "failure",
      };
    }

    const actionRunStatus = await integratedDevice.integration.tryRunAction(
      integratedDevice.device.integration,
      integratedDevice.device.type,
      actionDescription,
    );
    const newState = await this.stateService.addToState([
      {
        id: deviceId,
        roomId: roomId,
        state: actionId,
      },
    ]);
    this.homeStateGateway.updateState(newState);

    return {
      room: roomId,
      deviceId: deviceId,
      action: actionId,
      message: actionRunStatus === true ? undefined : actionRunStatus,
      runStatus: actionRunStatus === true ? "success" : "failure",
    };
  }
}
