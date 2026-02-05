import { Module, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Pool } from "pg";
import { OAuth2Client } from "google-auth-library";
import { IpValidationService } from "./ip-validation.service";
import { RequestContext } from "./request-context";
import { ConfigService } from "../config/config-service";
import { ConfigModule } from "../config/module";
import { HomeConfig } from "../config/home.zod";
import { ApiKeysPersistenceService } from "./auth/api-keys.persistence.service";
import { EmailsPersistenceService } from "./auth/emails.persistence.service";
import { GoogleAuthService } from "./auth/google-auth.service";
import { AuthorizationService } from "./auth/authorization.service";
import { AuthorizationHeaderVerificationService } from "./auth/authorization-header-verification.service";
import { SessionCookieService } from "./auth/session-cookie.service";

const HOME_CONFIG = "HOME_CONFIG";

export const PgPoolProvider = {
  provide: Pool,
  useFactory: () => {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
      throw new Error(`DATABASE_URL is a required env vars!`);
    }

    const pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    return pool;
  },
};

// Ideally the Auth provider can be set in the config but as that's a bit too complex
// and out of the scope of this project we keep the API strongly tied with Google Auth -
// Everyone has a Google Account and custom providers wouldn't justify the hassle.
const OAuth2ClientProvider = {
  provide: OAuth2Client,
  useFactory: () => {
    const clientId = process.env.AUTH_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        `Missing Env Var AUTH_GOOGLE_CLIENT_ID please make sure to setup the App on Google Cloud Platform with Auth.`,
      );
    }
    return new OAuth2Client(clientId);
  },
};

const SessionCookieServiceProvider = {
  provide: SessionCookieService,
  inject: [RequestContext],
  useFactory: (request: RequestContext) => {
    const sessionSecret = process.env.AUTH_SESSION_SECRET;
    if (!sessionSecret) {
      throw new Error(
        `Missing Env Var AUTH_SESSION_SECRET please generate a secret for the app.`,
      );
    }
    return new SessionCookieService(sessionSecret, request);
  },
};

const GoogleAuthServiceProvider = {
  provide: GoogleAuthService,
  inject: [OAuth2Client],
  useFactory: (oAuth2Client: OAuth2Client) => {
    const clientId = process.env.AUTH_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        `Missing Env Var AUTH_GOOGLE_CLIENT_ID please make sure to setup the App on Google Cloud Platform with Auth.`,
      );
    }
    return new GoogleAuthService(oAuth2Client, clientId);
  },
};

const ApiKeysPersistenceServiceProvider = {
  provide: ApiKeysPersistenceService,
  inject: [Pool],
  useFactory: (pool: Pool) => new ApiKeysPersistenceService(pool),
};

const EmailsPersistenceServiceProvider = {
  provide: EmailsPersistenceService,
  inject: [Pool],
  useFactory: (pool: Pool) => new EmailsPersistenceService(pool),
};

const AuthorizationServiceProvider = {
  provide: AuthorizationService,
  inject: [
    IpValidationService,
    AuthorizationHeaderVerificationService,
    SessionCookieService,
    GoogleAuthService,
    ApiKeysPersistenceService,
    EmailsPersistenceService,
  ],
  useFactory: (
    ipValidationService: IpValidationService,
    authorizationHeaderVerificationService: AuthorizationHeaderVerificationService,
    sessionCookieService: SessionCookieService,
    googleAuthService: GoogleAuthService,
    apiKeysPersistenceService: ApiKeysPersistenceService,
    emailsPersistenceService: EmailsPersistenceService,
  ) =>
    new AuthorizationService(
      ipValidationService,
      authorizationHeaderVerificationService,
      sessionCookieService,
      googleAuthService,
      apiKeysPersistenceService,
      emailsPersistenceService,
    ),
};

const AuthorizationHeaderVerificationServiceProvider = {
  provide: AuthorizationHeaderVerificationService,
  inject: [RequestContext],
  useFactory: (request: RequestContext) => {
    return new AuthorizationHeaderVerificationService(request);
  },
};

const HomeConfigProvider = {
  provide: HOME_CONFIG,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => config.getConfig().home,
};

const RequestContextProvider = {
  provide: RequestContext,
  scope: Scope.REQUEST,
  useFactory: (req: any) => {
    return new RequestContext(req);
  },
  inject: [REQUEST],
};

const IPValidationServiceProvider = {
  provide: IpValidationService,
  inject: [RequestContext, HOME_CONFIG],
  scope: Scope.REQUEST,
  useFactory: (requestContext: RequestContext, homeConfig: HomeConfig) => {
    return new IpValidationService(requestContext, homeConfig);
  },
};

@Module({
  imports: [ConfigModule],
  providers: [
    OAuth2ClientProvider,
    GoogleAuthServiceProvider,
    SessionCookieServiceProvider,
    IPValidationServiceProvider,
    ApiKeysPersistenceServiceProvider,
    AuthorizationHeaderVerificationServiceProvider,
    EmailsPersistenceServiceProvider,
    AuthorizationServiceProvider,
    RequestContextProvider,
    HomeConfigProvider,
    PgPoolProvider,
  ],
  exports: [
    OAuth2ClientProvider,
    GoogleAuthServiceProvider,
    SessionCookieServiceProvider,
    IPValidationServiceProvider,
    ApiKeysPersistenceServiceProvider,
    AuthorizationHeaderVerificationServiceProvider,
    EmailsPersistenceServiceProvider,
    AuthorizationServiceProvider,
    RequestContextProvider,
    HomeConfigProvider,
    PgPoolProvider,
  ],
})
export class ServicesModule {}
