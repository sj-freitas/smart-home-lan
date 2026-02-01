import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix("api");
  // app.enableShutdownSignals();

  await app.listen(3001, "0.0.0.0");
  console.log("Server listening on http://0.0.0.0:3001");
}

bootstrap();
