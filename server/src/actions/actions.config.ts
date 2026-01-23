import { RoomDeviceTypes } from "src/config/home.zod";
import { IntegrationService } from "src/integrations/integrations-service";

interface ActionType {
  name: string;
  description: string;
  perform?: (
    integrationService: IntegrationService<unknown>,
    deviceId: string,
    isTriggered?: () => boolean,
  ) => Promise<void>;
}

export const ACTIONS_BY_TYPE: Map<RoomDeviceTypes, ActionType[]> = new Map([
  [
    "air_conditioner",
    [
      {
        name: "on_heat",
        description: "Heat",
      },
      {
        name: "on_cool",
        description: "Cool",
      },
      {
        name: "off",
        description: "Off",
      },
    ],
  ],
  [
    "smart_switch",
    [
      {
        name: "on",
        description: "On",
      },
      {
        name: "off",
        description: "Off",
      },
    ],
  ],
  [
    "smart_light",
    [
      {
        name: "on_bright",
        description: "Bright",
      },
      {
        name: "on_dim",
        description: "Dim",
      },
      {
        name: "on_kinky",
        description: "Kinky",
      },
      {
        name: "off",
        description: "Off",
      },
    ],
  ],
]);
