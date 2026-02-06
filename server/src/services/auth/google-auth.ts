export class GoogleAuthConfig {
  get clientSecret(): string {
    const authGoogleClientSecret = process.env.AUTH_GOOGLE_CLIENT_SECRET;
    if (!authGoogleClientSecret) {
      throw new Error(
        "AUTH_GOOGLE_CLIENT_SECRET needs to be set in .env file!",
      );
    }

    return authGoogleClientSecret;
  }

  get clientId(): string {
    const authGoogleClientId = process.env.AUTH_GOOGLE_CLIENT_ID;
    if (!authGoogleClientId) {
      throw new Error("AUTH_GOOGLE_CLIENT_ID needs to be set in .env file!");
    }

    return authGoogleClientId;
  }

  get authUrl(): string {
    const authGoogleUrl = process.env.AUTH_GOOGLE_URL;
    if (!authGoogleUrl) {
      throw new Error("AUTH_GOOGLE_URL needs to be set in .env file!");
    }

    return authGoogleUrl;
  }

  get redirectUri(): string {
    const apiDomain = process.env.APP_DOMAIN_URL;
    if (!apiDomain) {
      throw new Error("APP_DOMAIN_URL needs to be set in .env file!");
    }

    return `${apiDomain}/api/auth/google/callback`;
  }

  get clientBaseUrl(): string {
    // This config has nothing to do with Google Auth specifically but it's part of the same flow.
    const clientBaseUrl = process.env.AUTH_CLIENT_BASE;
    if (!clientBaseUrl) {
      throw new Error("AUTH_CLIENT_BASE needs to be set in .env file!");
    }

    return clientBaseUrl;
  }

  get apiBaseUrl(): string {
    const apiBaseUrl = process.env.APP_DOMAIN_URL;
    if (!apiBaseUrl) {
      throw new Error("APP_DOMAIN_URL needs to be set in .env file!");
    }

    return apiBaseUrl;
  }
}
