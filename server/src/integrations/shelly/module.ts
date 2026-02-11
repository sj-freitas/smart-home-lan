import { Module } from "@nestjs/common";
import { ShellyController } from "./controllers/shelly.controller";
import { ShellyIntegrationService } from "./integration.service";

const ShellyIntegrationServiceProvider = {
  provide: ShellyIntegrationService,
  useFactory: () => new ShellyIntegrationService(),
};

@Module({
  providers: [ShellyIntegrationServiceProvider],
  controllers: [ShellyController],
  exports: [ShellyIntegrationServiceProvider],
})
export class ShellyModule {}
