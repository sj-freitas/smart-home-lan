import { Controller, Get, Query } from "@nestjs/common";

@Controller("api/shelly")
export class ShellyController {
  constructor() {}

  @Get("/webhooks")
  public async getMelCloudHomeContext(
    @Query("tc") tc: string,
    @Query("rh") rh: string,
    @Query("token") token: string,
    @Query("device_id") deviceId: string,
  ) {
    // Validate the token (proof that the device is legit)
    // Store the state changes in the array
    // That's it I guess?

    console.log(`Webhook shelly request received, tc=${tc} rh=${rh} token=${token} device_id=${deviceId}`);

    return {
      eventConsumed: true,
    };
  }
}
