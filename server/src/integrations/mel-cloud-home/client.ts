import { AirToAirUnit, AirToAirUnitStateChange } from "./types.zod";

export interface RoomDevice {
  id: string;
  room: {
    name: string;
    temperature: number;
  };
  mode: string;
  power: boolean;
  isConnected: boolean;
  isInError: boolean;
  settings: Record<string, string>;
}

/**
 * MEL Cloud Home is noticeably buggy and sometimes all devices can show as OFFLINE and the API response
 * on the Context becomes an empty object. In these cases, there's not much we can do, but we should address
 * this state somehow.
 */
export class MelCloudHomeClient {
  constructor(
    private readonly authenticationCookies: string,
    private readonly apiUrl: string,
  ) {}

  async getContext(): Promise<RoomDevice[]> {
    const response = await fetch(`${this.apiUrl}/user/context`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-csrf": "1",
        Cookie: this.authenticationCookies,
      },
    });

    const jsonResponse = await response.json();
    const airToAirUnits: AirToAirUnit[] =
      jsonResponse.buildings[0]?.airToAirUnits ?? [];
    const devices = airToAirUnits.map((device) => ({
      id: device.id,
      room: {
        name: device.givenDisplayName,
        temperature:
          Number.parseFloat(
            device.settings.find(
              (currSetting) => currSetting.name === "RoomTemperature",
            )?.value ?? "NaN",
          ) ?? NaN,
      },
      power:
        device.settings.find((currSetting) => currSetting.name === "Power")
          ?.value === "True"
          ? true
          : false,
      isConnected: device.isConnected,
      isInError: device.isInError,
      mode:
        device.settings.find(
          (currSetting) => currSetting.name === "OperationMode",
        )?.value ?? "off",
      settings: device.settings.reduce((acc, setting) => ({
        ...acc,
        [setting.name]: setting.value,
      }), {}),
    }));

    return devices;
  }

  async putAtAUnit(deviceId: string, stateChange: AirToAirUnitStateChange) {
    // Maybe the preset is done before? Need to think about it to look less suspicious
    await fetch(`${this.apiUrl}/ataunit/${deviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-csrf": "1",
        Cookie: this.authenticationCookies,
      },
      body: JSON.stringify(stateChange),
    });
    return true;
  }
}
