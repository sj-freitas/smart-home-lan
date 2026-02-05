import { TokenPayload } from "google-auth-library";
import { hashApiKey } from "../../helpers/crypto.helper";
import { IpValidationService } from "../ip-validation.service";
import { ApiKeysPersistenceService } from "./api-keys.persistence.service";
import { GoogleAuthService } from "./google-auth.service";
import { AuthorizationHeaderVerificationService } from "./authorization-header-verification.service";
import { EmailsPersistenceService } from "./emails.persistence.service";
import { SessionCookieService } from "./session-cookie.service";

export function isJwt(token: string): boolean {
  return token.indexOf('.') >= 0;
}

// These map to the following status codes:
export type AuthorizationResult =
  | "Authorized" // 200
  | "NeedsLogIn" // 401 Needs either a login or an API key (Authorization Header most likely not found)
  | "Unauthorized"; // 403

/**
 * Service that can inform whichever context it's inserted in regarding of the current request
 * is available to access the application.
 *
 * The flow is as follows:
 * 1. IP Verification -> If enabled, it'll check if the IP is part of the allowed list, in this case it is Authorized.
 * 2. Session Cookie Verification -> If the cookie exists and is correctly signed the user is Authorized.
 * 3. Authorization Verification -> Checks if the Authorization header exists:
 *  3.1 Doesn't exit -> NeedsLogIn
 *  3.2 API Key -> If it exists in the system it is authorized if not expired.
 *  3.3 JWT -> If it is valid using GoogleAuth
 *    3.3.1 -> Check if the email is in the DB hasn't expired access
 * 4. If all flows fail the user is Unauthorized
 */
export class AuthorizationService {
  constructor(
    private readonly ipValidationService: IpValidationService,
    private readonly authorizationHeaderVerificationService: AuthorizationHeaderVerificationService,
    private readonly sessionCookieService: SessionCookieService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly apiKeysPersistenceService: ApiKeysPersistenceService,
    private readonly emailsPersistenceService: EmailsPersistenceService,
  ) {}

  private async isValidApiKey(apiKey: string): Promise<AuthorizationResult> {
    const hashedApiKey = hashApiKey(apiKey);
    const matchingKey =
      await this.apiKeysPersistenceService.validateApiKey(hashedApiKey);

    if (!matchingKey) {
      return "Unauthorized";
    }

    console.log(`API Key access from ${matchingKey.owner} detected.`);
    return "Authorized";
  }

  private async isValidJwt(jwt: string): Promise<TokenPayload> {
    const googleToken = await this.googleAuthService.verifyIdToken(jwt);
    if (!googleToken) {
      return null;
    }

    return googleToken;
  }

  public async isUserAuthorized(): Promise<AuthorizationResult> {
    const ipValidation = this.ipValidationService.isRequestAllowedBasedOnIP();
    if (ipValidation) {
      return "Authorized";
    }

    // Check the cookie to bypass this flow
    const isSessionCookieValid = this.sessionCookieService.verifySessionToken();
    if (isSessionCookieValid) {
      return "Authorized";
    }

    // No session token and no bearer -> login requested.
    const token =
      this.authorizationHeaderVerificationService.getBearerTokenValue();
    if (!token) {
      return "NeedsLogIn";
    }

    if (!isJwt(token)) {
      // Verify the API key
      return await this.isValidApiKey(token);
    }

    // Verify the JWT
    const parsedToken = await this.isValidJwt(token);
    if (!parsedToken || !parsedToken.email) {
      return "Unauthorized";
    }
    const isEmailValid = await this.emailsPersistenceService.validateEmail(
      parsedToken.email,
    );
    if (!isEmailValid) {
      return "Unauthorized";
    }

    console.log(`Email access from ${parsedToken.email} detected.`);
    return "Authorized";
  }
}
