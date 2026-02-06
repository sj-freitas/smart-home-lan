import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { OAuth2Client as AuthGoogleOAuth2Client } from "google-auth-library";
import { Response } from "express";
import { GoogleAuthConfig } from "../../services/auth/google-auth";
import { GoogleSessionService } from "../../services/auth/google-session.service";
import { AuthConfig } from "../auth.config";
import { RequestContext } from "../../services/request-context";
import { GoogleOAuth2TokenZod } from "../../services/auth/google-auth.types.zod";

@Controller("auth/google")
export class AuthGoogleController {
  constructor(
    private readonly config: GoogleAuthConfig,
    private readonly client: AuthGoogleOAuth2Client,
    private readonly sessionService: GoogleSessionService,
    private readonly authConfig: AuthConfig,
    private readonly requestContext: RequestContext,
  ) {}

  @Get("callback")
  async callback(@Query("code") code: string, @Res() response: Response) {
    if (!code) {
      throw new BadRequestException("Missing code");
    }

    const {
      clientId,
      redirectUri,
      clientSecret,
      authUrl,
      clientBaseUrl,
      apiBaseUrl,
    } = this.config;
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenResp = await fetch(`${authUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenResp.ok) {
      const data = await tokenResp.text();
      throw new BadRequestException(
        `Token exchange failed: ${tokenResp.status} ${tokenResp.statusText} - ${data}`,
      );
    }

    const unparsedResponseJsonBody = await tokenResp.json();
    const { idToken, accessToken, refreshToken, expiresIn } =
      GoogleOAuth2TokenZod.parse(unparsedResponseJsonBody);

    if (!idToken) {
      throw new BadRequestException("No id_token returned by Google");
    }

    // Is this required? I mean yes but the Lib does this differently.
    // TODO: Extract this to GoogleAuthService instead.
    const ticket = await this.client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException("Invalid id_token");
    }

    const session = await this.sessionService.createSession(
      payload.email,
      accessToken,
      expiresIn,
      refreshToken,
    );

    response.cookie("session", session.sessionId, {
      httpOnly: true,
      secure: this.authConfig.setSecureCookie,
      sameSite: "none",
      domain: apiBaseUrl,
      path: "/",
    });

    return response.redirect(clientBaseUrl);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res() response: Response) {
    const session = this.requestContext.sessionCookie;
    if (session) {
      this.sessionService.destroySession(session);
    }

    response.clearCookie(RequestContext.SESSION_COOKIE_NAME);

    return response.status(HttpStatus.OK).send("logged out");
  }
}
