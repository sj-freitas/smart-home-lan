import { Controller, Get } from "@nestjs/common";
import { generateApiKey, hashApiKey } from "../helpers/crypto.helper";

@Controller("api/sandbox")
export class SandboxController {
  constructor() {}

  @Get("/generate-api-key")
  public async generateKey() {
    const apiKey = generateApiKey();
    return {
      apiKey,
      hash: hashApiKey(apiKey),
      instructions: `As of now, users can't create keys. So these values have to be manually inserted into the Database.`,
    };
  }
}
