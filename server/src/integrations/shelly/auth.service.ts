export class ShellyAuthService {
  constructor(private readonly webhookSecret: string) {}

  public isTokenValid(token: string): boolean {
    return this.webhookSecret === token;
  }
}
