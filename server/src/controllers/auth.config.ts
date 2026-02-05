export class AuthConfig {
  get setSecureCookie(): boolean {
    return process.env.SET_SECURE_COOKIE === "true";
  }
}
