import { Module, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Pool } from "pg";
import { UserValidationService } from "./user-validation.service";
import { RequestContext } from "./request-context";
import { ConfigService } from "../config/config-service";
import { ConfigModule } from "../config/module";
import { HomeConfig } from "../config/home.zod";

const HOME_CONFIG = "HOME_CONFIG";

export const PgPoolProvider = {
  // TODO: Created as a singleton but I want to create a per-request transaction sub-service.
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

const UserValidationServiceProvider = {
  provide: UserValidationService,
  inject: [RequestContext, HOME_CONFIG],
  scope: Scope.REQUEST,
  useFactory: (requestContext: RequestContext, homeConfig: HomeConfig) => {
    return new UserValidationService(requestContext, homeConfig);
  },
};

@Module({
  imports: [ConfigModule],
  providers: [
    UserValidationServiceProvider,
    RequestContextProvider,
    HomeConfigProvider,
    PgPoolProvider,
  ],
  exports: [UserValidationServiceProvider, PgPoolProvider],
})
export class ServicesModule {}
