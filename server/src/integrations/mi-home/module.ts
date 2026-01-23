import { Module } from "@nestjs/common";
import { MiHomeIntegrationService } from "./integration.service";

const MiHomeIntegrationServiceProvider = {
  provide: MiHomeIntegrationService,
  useFactory: async () => {
    return new MiHomeIntegrationService();
  },
};

@Module({
  imports: [],
  controllers: [],
  providers: [MiHomeIntegrationServiceProvider],
  exports: [MiHomeIntegrationServiceProvider],
})
export class MiHomeModule {}
