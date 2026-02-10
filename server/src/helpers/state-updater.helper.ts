import { DeviceState } from "../services/state/types.zod";
import { HomeConfig } from "../config/home.zod";
import { IntegrationService } from "../integrations/integrations-service";
import { StateService } from "../services/state/state.service";
import { HomeStateGateway } from "../sockets/home.state.gateway";

/**
 * Helper function that consolidates the state of all devices of one integration. This is useful as
 * some different integrations require less updates or have different rate limits.
 */
export async function updateStateForDevicesOfIntegration<T>(
  homeConfig: HomeConfig,
  integrationService: IntegrationService<T>,
  stateService: StateService,
  stateUpdater: HomeStateGateway,
): Promise<void> {
  const allDeviceConfigs = homeConfig.rooms
    .map((currRoom) =>
      currRoom.devices.map((currDevice) => ({
        deviceId: currDevice.id,
        roomId: currRoom.id,
        device: currDevice,
      })),
    )
    .flatMap((t) => t)
    .filter((t) => t.device.integration.name === integrationService.name);

  const allDevices = allDeviceConfigs.map((t) => ({
    roomId: t.roomId,
    deviceId: t.deviceId,
    icon: t.device.icon,
    name: t.device.name,
    info: t.device.integration as T,
    type: t.device.type,
    actions: [...t.device.actions],
  }));

  const consolidated =
    await integrationService.consolidateDeviceStates(allDevices);

  const zipped = consolidated.map((t, idx) => ({
    ...t,
    ...allDevices[idx],
  }));

  const mapped: DeviceState[] = zipped.map((t) => ({
    id: t.deviceId,
    roomId: t.roomId,
    name: t.name,
    icon: t.icon,
    type: t.type,
    actions: t.actions.map((action) => ({
      id: action.id,
      name: action.name,
    })),
    temperature: t.temperature,
    humidity: t.humidity,
    online: t.online,
    state: t.state,
  }));

  const state = await stateService.addToState(mapped);

  if (stateUpdater.isInitialized) {
    stateUpdater.updateState(state);
  }
}
