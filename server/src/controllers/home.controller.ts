import { Controller, Get } from "@nestjs/common";
import { ApplicationStateService } from "../integrations/application-state.service";
import { AuthorizationService } from "../services/auth/authorization.service";

@Controller("home")
export class HomeController {
  constructor(
    private readonly applicationStateService: ApplicationStateService,
  ) {}

  @Get("/")
  public async getHomeInfo() {
    const appState = await this.applicationStateService.getHomeState();

    return appState;
  }
}
