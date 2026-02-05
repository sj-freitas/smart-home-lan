import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthorizationService } from "./auth/authorization.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(): Promise<boolean> {
    const result = await this.authorizationService.isUserAuthorized();

    if (result === "Authorized") {
      return true;
    }

    if (result === "NeedsLogIn") {
      throw new UnauthorizedException("Unauthorized");
    }

    throw new ForbiddenException("Forbidden");
  }
}
