import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { HueOAuth2PersistenceService } from "../integrations/hue-cloud/oauth2/hue-oauth2.persistence.service";
import { HueOAuth2ClientService } from "../integrations/hue-cloud/oauth2/hue-oauth2.client.service";
import { GoogleAuthService } from "../services/auth/google-auth.service";
import { AuthConfig } from "./auth.config";
import { SessionCookieService } from "../services/auth/session-cookie.service";
import { AuthGuard } from "../services/auth-guard";

@Controller("auth")
export class AuthController {
  constructor(
    // private readonly hueOauth2Service: HueOAuth2ClientService,
    // private readonly huePersistenceService: HueOAuth2PersistenceService,
    private readonly googleAuth: GoogleAuthService,
    private readonly sessionCookieService: SessionCookieService,
    private readonly authConfig: AuthConfig,
  ) {}

  // @Get("/oauth2-hue")
  // @HttpCode(200)
  // public async oauth2(@Query("code") code: string) {
  //   console.log(`OAuth2 Hue endpoint hit code = ${code}`);

  //   const accessToken = await this.hueOauth2Service.getAccessToken(code);
  //   this.huePersistenceService.storeTokens(accessToken);

  //   return {
  //     nextSteps:
  //       `Hue OAuth2 tokens stored successfully. However, you need to do the following ` +
  //       `request to link the bridge. Press the Bridge Physical Link Button and run the following CURL:` +
  //       `curl -X POST "https://api.meethue.com/bridge" \
  // -H "Authorization: Bearer ${accessToken.accessToken}" \
  // -H "Content-Type: application/json" \
  // -d '{"devicetype":"my_server#your_name"}'`,
  //     finalSteps:
  //       `After you should get a JSON with a success.username. Store that username in your ` +
  //       `HueCloudIntegration configuration as the 'bridgeUsername' field.`,
  //     codeConsumed: code,
  //   };
  // }

  @Post("/check")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public async checkPermissions() {
    return {
      canPerformActions: true,
    };
  }

  @Post("/login")
  public async login(@Body("idToken") idToken: string, @Res() res: Response) {
    const payload = await this.googleAuth.verifyIdToken(idToken);
    const session = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    const token = this.sessionCookieService.createSessionToken(session);

    // set cookie (HttpOnly). In production set secure: true and proper domain.
    res.cookie("session", token, {
      httpOnly: true,
      secure: this.authConfig.setSecureCookie,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1h
    });
    return res.json({ ok: true });
  }

  @Post("/logout")
  public async logout(@Res() res: Response) {
    res.clearCookie("session");
    return res.json({ ok: true });
  }
}
