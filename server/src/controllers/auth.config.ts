export class AuthConfig {
  get setSecureCookie(): boolean {
    return process.env.AUTH_SET_SECURE_COOKIE === "true";
  }
}
