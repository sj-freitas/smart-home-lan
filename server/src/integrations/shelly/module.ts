import { Module } from "@nestjs/common";
import { ShellyController } from "./controllers/shelly.controller";
import { ShellyIntegrationService } from "./integration.service";
import { ServicesModule } from "../../services/module";
import { ConfigModule } from "../../config/module";
import { ConfigService } from "../../config/config-service";
import { ShellyAuthService } from "./auth.service";
import { SocketsModule } from "../../sockets/module";

const ShellyAuthServiceProvider = {
  provide: ShellyAuthService,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const config = configService.getConfig();
    const shellyIntegration = config.integrations.find(
      (t) => t.name === "shelly",
    );

    if (!shellyIntegration) {
      throw new Error(
        `Shelly Module was loaded without a Shelly config, this shouldn't happen.`,
      );
    }

    return new ShellyAuthService(shellyIntegration.webhookSecret);
  },
};

const ShellyIntegrationServiceProvider = {
  provide: ShellyIntegrationService,
  useFactory: () => new ShellyIntegrationService(),
};

@Module({
  imports: [ServicesModule, ConfigModule, SocketsModule],
  providers: [ShellyIntegrationServiceProvider, ShellyAuthServiceProvider],
  controllers: [ShellyController],
  exports: [ShellyIntegrationServiceProvider],
})
export class ShellyModule {}
