import { Controller, Get, Param } from "@nestjs/common";
import { HueClient } from "src/integrations/hue-cloud/hue.client";

@Controller("sandbox")
export class SandboxController {
  private readonly hueClient: HueClient;

  constructor(hueClient: HueClient) {
    this.hueClient = hueClient;
  }

  @Get("/hue-lights")
  public async getSandboxInfo() {
    return await this.hueClient.getLights();
  }

  @Get("/hue-lights/:id/on")
  public async setLightOn(@Param("id") id: string) {
    return await this.hueClient.setLightState(id, {
      on: false,
    });
  }
}
