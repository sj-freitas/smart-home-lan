import { IntegrationDeviceTypes, IntegrationTypeNames } from "src/config/integration.zod";

export interface IntegrationService<T> {
  readonly name: IntegrationTypeNames;
  getDeviceTemperature(deviceInfo: T): Promise<number>;
  getDeviceState(deviceInfo: T): Promise<string>;
  tryRunAction(deviceInfo: T, action: string): Promise<boolean>;
}

export class IntegrationServiceWithContext<T> {
  constructor(private readonly service: IntegrationService<T>, private readonly context: T) {}

  async getDeviceTemperature() {
    return this.service.getDeviceTemperature(this.context);
  }

  async getDeviceState() {
    return this.service.getDeviceState(this.context);
  }
  
  async tryRunAction(action: string) {
    return this.service.tryRunAction(this.context, action);
  }
}

export class IntegrationsService {
  getIntegration(integration: IntegrationDeviceTypes): IntegrationServiceWithContext<unknown> {
    const found = this.integrations.find((t) => (t.name === integration.name));
    if (!found) {
      throw new Error(`Integration ${integration.name} not supported.`);
    }
    return new IntegrationServiceWithContext(found, integration);
  }

  constructor(private readonly integrations: IntegrationService<unknown>[]) {}
}
