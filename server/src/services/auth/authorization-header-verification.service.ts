import { RequestContext } from "./../request-context";

function getBearerToken(
  authorizationHeader: string | undefined,
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(/\s+/, 2);
  if (!/^Bearer$/i.test(scheme)) {
    return null;
  }
  if (!token) {
    return null;
  }

  return token;
}

export class AuthorizationHeaderVerificationService {
  constructor(private readonly request: RequestContext) {}

  /**
   * Retrieves the Authorization header from the current request.
   * If the request doesn't have a valid header NOR does it have
   * a valid "Bearer {token}" format it'll return null.
   *
   * @returns {String} token only if exists within the Authorization header.
   */
  public getBearerTokenValue(): string | null {
    const authHeader = this.request.authorizationHeader;
    if (!authHeader) {
      // Header doesn't exist
      return null;
    }

    return getBearerToken(authHeader);
  }
}
