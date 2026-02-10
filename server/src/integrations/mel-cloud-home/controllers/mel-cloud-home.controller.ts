import { Controller, Get } from "@nestjs/common";
import { MelCloudHomeClient } from "../client";

@Controller("api/sandbox")
export class MelCLoudHomeController {
  constructor(private readonly melCloudHomeClient: MelCloudHomeClient) {}

  @Get("/mel-cloud-home-context")
  public async getMelCloudHomeContext() {
    return await this.melCloudHomeClient.getContext();
  }
}
