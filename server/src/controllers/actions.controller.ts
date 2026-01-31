import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "../config/config-service";
import { DeviceAction, HomeConfig } from "../config/home.zod";
import {
  IntegrationServiceWithContext,
  IntegrationsService,
} from "../integrations/integrations-service";
import { UserValidationService } from "../services/user-validation.service";
import { DeviceHelper } from "../helpers/device-helpers";

interface IntegratedDevice<T> {
  integrationService: IntegrationServiceWithContext<T>;
  actions: Map<string, DeviceAction>;
}

@Controller("actions")
export class ActionsController {
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

    return {
      room,
      deviceId: deviceId,
      action,
      message: actionRunStatus === true ? undefined : actionRunStatus,
      runStatus: actionRunStatus === true ? "success" : "failure",
    };
  }
}
