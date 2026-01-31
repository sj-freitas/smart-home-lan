import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as express from "express";
import * as cors from "cors";
import { ExpressAdapter } from "@nestjs/platform-express";
import { MEL_CLOUD_AUTHENTICATION_COOKIES } from "./integrations/mel-cloud-home/module";
import { HUE_REFRESH_TOKEN } from "./integrations/hue-cloud/module";

async function bootstrap() {
  const server = express();
  server.use(cors());

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix("api");

  // TODO: These should be dependent on what integrations we have on the config.json
  // Not super hard to implement, but some food for thought.
  console.log(
    `Prefetching AuthCookies (MELCloud) and (Hue) on bootstrap...`,
  );
  await app.get(MEL_CLOUD_AUTHENTICATION_COOKIES);
  await app.get(HUE_REFRESH_TOKEN);

  await app.listen(3001, "0.0.0.0");
  console.log("Server listening on http://0.0.0.0:3001");
}
bootstrap();
