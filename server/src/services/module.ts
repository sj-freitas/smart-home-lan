import { Module, Scope } from "@nestjs/common";
import { UserValidationService } from "./user-validation.service";
import { REQUEST } from "@nestjs/core";
import { RequestContext } from "./request-context";

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
  inject: [RequestContext],
  scope: Scope.REQUEST,
  useFactory: (requestContext: RequestContext) => {
    return new UserValidationService(requestContext);
  },
};

@Module({
  providers: [UserValidationServiceProvider, RequestContextProvider],
  exports: [UserValidationServiceProvider],
})
export class ServicesModule {}
