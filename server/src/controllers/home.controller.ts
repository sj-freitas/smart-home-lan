import { Controller, Get } from "@nestjs/common";
import { UserValidationService } from "../services/user-validation.service";
import {
  ApplicationState,
  ApplicationStateService,
} from "../integrations/application-state.service";

function removeActionsFromState(appState: ApplicationState): ApplicationState {
  return {
    ...appState,
    rooms: appState.rooms.map((currRoom) => ({
      ...currRoom,
      devices: currRoom.devices.map((currDevice) => ({
        ...currDevice,
        actions: [
          {
            id: currDevice.state,
            name: currDevice.actions.find((t) => t.id === currDevice.state)
              .name,
          },
        ],
      })),
    })),
  };
}

@Controller("home")
export class HomeController {
  constructor(
    private readonly applicationStateService: ApplicationStateService,
    private readonly userValidationService: UserValidationService,
  ) {}

  @Get("/")
  public async getHomeInfo() {
    const canPerformActions = this.userValidationService.isRequestAllowed();
    const appState = await this.applicationStateService.getHomeState();

    if (!canPerformActions) {
      // User is not authenticated, therefore they can't perform actions
      return removeActionsFromState(appState);
    }

    return appState;
  }
}
