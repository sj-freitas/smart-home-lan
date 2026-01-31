import { Module, Scope } from "@nestjs/common";
import { UserValidationService } from "./user-validation.service";
import { REQUEST } from "@nestjs/core";
import { RequestContext } from "./request-context";
import { ConfigService } from "src/config/config-service";
import { ConfigModule } from "src/config/module";
import { HomeConfig } from "src/config/home.zod";

const HOME_CONFIG = "HOME_CONFIG";

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
  ],
  exports: [UserValidationServiceProvider],
})
export class ServicesModule {}
