import { Memoizer } from "../services/memoizer";
import { DeviceAction, RoomDeviceTypes } from "../config/home.zod";
import {
  IntegrationDeviceTypes,
  IntegrationTypeNames,
} from "../config/integration.zod";

export type TryRunActionResult = true | string;

export interface IntegrationService<T> {
  readonly name: IntegrationTypeNames;
  getDeviceTemperature(
    memoizationContext: Memoizer,
    deviceInfo: T,
  ): Promise<number>;
  getDeviceState(
    memoizationContext: Memoizer,
    deviceInfo: T,
    actionDescriptions: DeviceAction[],
  ): Promise<string>;
  tryRunAction(
    memoizationContext: Memoizer,
    deviceInfo: T,
    deviceType: RoomDeviceTypes,
    action: DeviceAction,
  ): Promise<TryRunActionResult>;
}

interface DeviceContext<T> {
  info: T;
  type: RoomDeviceTypes;
}

export class IntegrationServiceWithContext<T> {
  constructor(
    private readonly service: IntegrationService<T>,
    private readonly context: DeviceContext<T>,
  ) {}

  async getDeviceTemperature(memoizationContext: Memoizer) {
    return this.service.getDeviceTemperature(
      memoizationContext,
      this.context.info,
    );
  }

  async getDeviceState(memoizationContext: Memoizer, actions: DeviceAction[]) {
    return this.service.getDeviceState(
      memoizationContext,
      this.context.info,
      actions,
    );
  }

  async tryRunAction(memoizationContext: Memoizer, action: DeviceAction) {
    return this.service.tryRunAction(
      memoizationContext,
      this.context.info,
      this.context.type,
      action,
    );
  }
}

interface IntegrationInfo {
  integration: IntegrationDeviceTypes;
  deviceType: RoomDeviceTypes;
}

export class IntegrationsService {
  getIntegration(
    info: IntegrationInfo,
  ): IntegrationServiceWithContext<unknown> {
    const found = this.integrations.find(
      (t) => t.name === info.integration.name,
    );
    if (!found) {
      throw new Error(`Integration ${info.integration.name} not supported.`);
    }
    return new IntegrationServiceWithContext(found, {
      info: info.integration,
      type: info.deviceType,
    });
  }

  constructor(private readonly integrations: IntegrationService<unknown>[]) {}
}
