import { Module } from "@nestjs/common";
import { ConfigModule } from "../../config/module";
import { HueCloudIntegrationService } from "./integration.service";

const HueCloudIntegrationServiceProvider = {
  provide: HueCloudIntegrationService,
  useFactory: async () => {
    return new HueCloudIntegrationService();
  },
};

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [HueCloudIntegrationServiceProvider],
  exports: [HueCloudIntegrationServiceProvider],
})
export class HueCloudModule {}
