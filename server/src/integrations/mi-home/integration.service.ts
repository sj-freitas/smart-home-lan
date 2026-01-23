import { MiHomeIntegrationDevice } from "../../config/integration.zod";
import { IntegrationService } from "../integrations-service";

export class MiHomeIntegrationService implements IntegrationService<MiHomeIntegrationDevice> {
  public name: "mi_home" = "mi_home";

  async getDeviceTemperature(
    deviceInfo: MiHomeIntegrationDevice,
  ): Promise<number> {
    // Not supported feature
    return NaN;
  }
  async getDeviceState(deviceInfo: MiHomeIntegrationDevice): Promise<string> {
    // Not supported feature
    return "off";
  }

  async tryRunAction(
    deviceInfo: MiHomeIntegrationDevice,
    action: string,
  ): Promise<boolean> {
    console.warn(
      `Integrations for actions for MiHome devices are not implemented yet -> Cannot run ${action} on ${deviceInfo.name}!`,
    );
    return false;
  }
}
