import { Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../services/auth.guard";
import { IpValidationService } from "../services/ip-validation.service";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly ipValidationService: IpValidationService) {}

  @Get("/check")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public async checkPermissions() {
    const isRequestAllowedBasedOnIP =
      this.ipValidationService.isRequestAllowedBasedOnIP();
    return {
      // This means that the request didn't require login to access, so there is no way
      // to logout an user.
      shouldRenderLogoutButton: !isRequestAllowedBasedOnIP,
      // Can be safely ignored by a client.
      canPerformActions: true,
    };
  }
}
