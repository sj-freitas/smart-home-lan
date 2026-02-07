export class AuthConfig {
  get setSecureCookie(): boolean {
    return process.env.AUTH_SET_SECURE_COOKIE === "true";
  }

  get sameSiteCookie(): "lax" | "none" | "strict" | boolean {
    switch (process.env.AUTH_SET_SAME_SITE_COOKIE) {
      case "lax":
        return "lax";
      case "none":
        return "none";
      case "strict":
        return "strict";
      case "true":
        return true;
      case "false":
        return false;
      default:
        return "lax";
    }
  }

  get domainCookie(): string {
    return process.env.AUTH_SET_DOMAIN_COOKIE ?? "localhost";
  }

  get clientBaseUrl(): string {
    const clientBaseUrl = process.env.AUTH_CLIENT_BASE;
    if (!clientBaseUrl) {
      throw new Error("AUTH_CLIENT_BASE needs to be set in .env file!");
    }

    return clientBaseUrl;
  }
}
