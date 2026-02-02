import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const DEFAULT_PORT = "3001";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port, "0.0.0.0");
  console.log(`Server listening on http://0.0.0.0:${process.env.PORT}`);
}

bootstrap();
