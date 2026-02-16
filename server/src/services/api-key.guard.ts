import {
  CanActivate,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthorizationHeaderVerificationService } from "./auth/authorization-header-verification.service";
import { ApiKeysPersistenceService } from "./auth/api-keys.persistence.service";
import { hashApiKey } from "../helpers/crypto.helper";

/**
 * Basic Guard to validate if the request is authenticated using a valid API Key.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly authorizationHeaderVerificationService: AuthorizationHeaderVerificationService,
    private readonly apiKeysPersistenceService: ApiKeysPersistenceService,
  ) {}

  private async isValidApiKey(apiKey: string): Promise<boolean> {
    const hashedApiKey = hashApiKey(apiKey);
    const matchingKey =
      await this.apiKeysPersistenceService.validateApiKey(hashedApiKey);

    if (!matchingKey) {
      return false;
    }

    console.log(`API Key access from ${matchingKey.owner} detected.`);
    return true;
  }

  async canActivate(): Promise<boolean> {
    // No session token and no bearer -> login requested.
    const token =
      this.authorizationHeaderVerificationService.getBearerTokenValue();
    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    const isApiKeyValid = await this.isValidApiKey(token);
    if (!isApiKeyValid) {
      throw new ForbiddenException("Forbidden");
    }

    return true;
  }
}
