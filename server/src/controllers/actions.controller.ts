import {
  Controller,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { DeviceAction } from "../config/home.zod";
import {
  IntegrationServiceWithContext,
  IntegrationsService,
} from "../integrations/integrations-service";
import { UserValidationService } from "../services/user-validation.service";
import {
  ApplicationState,
  ApplicationStateService,
} from "../integrations/application-state.service";
import { ConfigService } from "../config/config-service";
import { DeviceHelper } from "../helpers/device-helpers";
import { HomeStateGateway } from "../sockets/home.state.gateway";

interface IntegratedDevice<T> {
  integrationService: IntegrationServiceWithContext<T>;
  actions: Map<string, DeviceAction>;
}

@Controller("actions")
export class ActionsController {
  private readonly deviceHelper: DeviceHelper;

  constructor(
    configService: ConfigService,
    private readonly applicationStateService: ApplicationStateService,
    private readonly integrations: IntegrationsService,
    private readonly userValidationService: UserValidationService,
    private readonly homeStateGateway: HomeStateGateway,
  ) {
    const config = configService.getConfig();
    this.deviceHelper = new DeviceHelper(config.home);
  }

  private getIntegratedDeviceFromId(
    roomId: string,
    deviceId: string,
  ): IntegratedDevice<unknown> | null {
    const deviceInfo = this.deviceHelper.getDevice(roomId, deviceId);
    if (!deviceInfo) {
      return null;
    }

    const deviceActions = deviceInfo.actions;
    return {
      integrationService: this.integrations.getIntegration({
        integration: deviceInfo.integration,
        deviceType: deviceInfo.type,
      }),
      actions: new Map(deviceActions.map((action) => [action.id, action])),
    };
  }

  @Post("/:room/:deviceId/:action")
  @HttpCode(200)
  public async performAction(
    @Param("room") room: string,
    @Param("deviceId") deviceId: string,
    @Param("action") action: string,
  ) {
    if (!this.userValidationService.isRequestAllowed()) {
      throw new UnauthorizedException(
        "User is not allowed to perform actions.",
      );
    }

    const currentState = await this.applicationStateService.getHomeState();
    const device = this.getIntegratedDeviceFromId(room, deviceId);
    if (!device) {
      return {
        room,
        deviceId: deviceId,
        action,
        message: `Device with id ${deviceId} not found`,
        runStatus: "failure",
      };
    }
    const actionDescription = device.actions.get(action);
    if (!actionDescription) {
      return {
        room,
        deviceId: deviceId,
        action,
        message: `Action ${action} not found`,
        runStatus: "failure",
      };
    }

    const actionRunStatus =
      await device.integrationService.tryRunAction(actionDescription);

    // New state should include the action that was performed.
    const newState: ApplicationState = {
      ...currentState,
      rooms: currentState.rooms.map((currRoom) => ({
        ...currRoom,
        devices: currRoom.devices.map((currDevice) => {
          const isCurrDevice =
            currDevice.id === deviceId && currRoom.id === room;

          if (isCurrDevice) {
            return {
              ...currDevice,
              state: action,
            };
          }

          return currDevice;
        }),
      })),
    };

    this.homeStateGateway.updateState(newState);

    return {
      room,
      deviceId: deviceId,
      action,
      message: actionRunStatus === true ? undefined : actionRunStatus,
      runStatus: actionRunStatus === true ? "success" : "failure",
    };
  }
}
