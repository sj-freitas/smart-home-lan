import { Controller, Get, Param } from "@nestjs/common";
import { HueClient } from "src/integrations/hue-cloud/hue.client";

@Controller("sandbox")
export class SandboxController {
  private readonly hueClient: HueClient;

  constructor(hueClient: HueClient) {
    this.hueClient = hueClient;
  }

  @Get("/hue-lights")
  public async getHueLightsState() {
    // Very useful to get the HUE light configs to create presets.
    return await this.hueClient.getLights();
  }
}
