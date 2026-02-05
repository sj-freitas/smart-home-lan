import { Controller, Get, Query } from "@nestjs/common";
import { HueClient } from "../integrations/hue-cloud/hue.client";
import { generateApiKey, hashApiKey } from "../helpers/crypto.helper";
import { ApiKeysPersistenceService } from "../services/auth/api-keys.persistence.service";
import { EmailsPersistenceService } from "../services/auth/emails.persistence.service";

@Controller("sandbox")
export class SandboxController {
  constructor(
    // private readonly hueClient: HueClient,
    private readonly apiKeysPersistenceService: ApiKeysPersistenceService,
    private readonly emailsPersistenceService: EmailsPersistenceService,
  ) {}

  // @Get("/hue-lights")
  // public async getHueLightsState() {
  //   // Very useful to get the HUE light configs to create presets.
  //   return await this.hueClient.getLights();
  // }

  @Get("/health")
  public async health() {
    // Very useful to get the HUE light configs to create presets.
    return {
      healthy: true,
    };
  }

  @Get("/verify")
  public async verifyKey(@Query("api-key") apiKey: string) {
    // Query tables for hashes
    const hashedApiKey = hashApiKey(apiKey);
    const matchingKey =
      await this.apiKeysPersistenceService.validateApiKey(hashedApiKey);

    if (!matchingKey) {
      return {
        success: false,
        reason:
          "Either there is no matching user for this key or the key has expired",
      };
    }

    return {
      success: true,
      owner: matchingKey.owner,
      expiresAt: new Date(matchingKey.expiresAt),
    };
  }

  @Get("/verify-email")
  public async verifyEmail(@Query("email") email: string) {
    const matchingKey =
      await this.emailsPersistenceService.validateEmail(email);

    if (!matchingKey) {
      return {
        success: false,
        reason:
          "Either there is no matching user for this email or the access has expired",
      };
    }

    return {
      success: true,
      owner: email,
    };
  }

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
