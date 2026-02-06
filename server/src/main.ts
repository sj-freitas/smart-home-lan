import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

const DEFAULT_PORT = "3001";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    process.env.AUTH_CLIENT_BASE,
    process.env.APP_DOMAIN_URL,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  });

  if (process.env.NODE_ENV !== "production") {
    app.enableCors({
      origin: process.env.AUTH_CLIENT_BASE,
      credentials: true,
    });
  }
  app.use(cookieParser());
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port, "0.0.0.0");

  console.log(`Server listening on http://0.0.0.0:${process.env.PORT}`);
}

bootstrap();
