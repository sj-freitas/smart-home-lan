import { Controller, Get, HttpCode, Query } from "@nestjs/common";
import { HueOAuth2ClientService } from "../../integrations/hue-cloud/oauth2/hue-oauth2.client.service";
import { HueOAuth2PersistenceService } from "../../integrations/hue-cloud/oauth2/hue-oauth2.persistence.service";

@Controller("auth/oauth2-hue")
export class AuthHueController {
  constructor(
    private readonly hueOauth2Service: HueOAuth2ClientService,
    private readonly huePersistenceService: HueOAuth2PersistenceService,
  ) {}

  @Get()
  @HttpCode(200)
  public async oauth2(@Query("code") code: string) {
    console.log(`OAuth2 Hue endpoint hit code = ${code}`);

    const accessToken = await this.hueOauth2Service.getAccessToken(code);
    this.huePersistenceService.storeTokens(accessToken);

    return {
      nextSteps:
        `Hue OAuth2 tokens stored successfully. However, you need to do the following ` +
        `request to link the bridge. Press the Bridge Physical Link Button and run the following CURL:` +
        `curl -X POST "https://api.meethue.com/bridge" \
  -H "Authorization: Bearer ${accessToken.accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"devicetype":"my_server#your_name"}'`,
      finalSteps:
        `After you should get a JSON with a success.username. Store that username in your ` +
        `HueCloudIntegration configuration as the 'bridgeUsername' field.`,
      codeConsumed: code,
    };
  }
}
